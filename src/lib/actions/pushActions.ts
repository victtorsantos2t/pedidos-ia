"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import webpush from "web-push";

// Configuração do Web Push
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || "mailto:contato@rdos.com.br";

if (publicVapidKey && privateVapidKey) {
    webpush.setVapidDetails(subject, publicVapidKey, privateVapidKey);
}

export async function savePushSubscription(subscription: any) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch (error) { }
                    }
                }
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Usuário não autenticado.' };
        }

        // Antes de inserir, verifica se a inscrição já não existe
        const { data: existing } = await supabase
            .from('push_subscriptions')
            .select('id')
            .eq('user_id', user.id)
            .contains('subscription', { endpoint: subscription.endpoint })
            .single();

        if (existing) {
            return { success: true, message: 'Já inscrito' };
        }

        const { error } = await supabase
            .from('push_subscriptions')
            .insert({
                user_id: user.id,
                subscription: subscription
            });

        if (error) {
            console.error('Erro ao salvar no supabase:', error);
            return { error: 'Não foi possível salvar a inscrição' };
        }

        return { success: true };
    } catch (e: any) {
        console.error('Exception no savePushSubscription:', e);
        return { error: e.message };
    }
}

// Essa função será chamada APENAS pelo backend/admin interno 
// e precisa da connection com o `service_role` ou ao menos admin privileges (porque ela precisa ler dados que talvez não sejam dela). 
// Usaremos SSR pra rodar seguro na action de admin:
export async function sendNotificationToUser(userId: string, title: string, body: string, url: string = "/") {
    try {
        const cookieStore = await cookies();

        // ATENÇÃO: Se RLS estiver ativado e bloqueando acesso alheio, para listar as "inscrições dos outros",
        // teremos que usar uma key que passe por cima (service_role) caso o admin tente chamar isso.
        // Simularemos com a chave anon clássica pra fins de design atual, 
        // mas o ideal futuro é usar o service_role key, que vou tentar puxar da .env se tiver, senao vai a anon.

        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const supabaseAdmin = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceKey,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll() { }
                }
            }
        );

        // Busca todas as inscrições para este usuário alvo
        const { data: subscriptions, error } = await supabaseAdmin
            .from('push_subscriptions')
            .select('subscription')
            .eq('user_id', userId);

        if (error || !subscriptions || subscriptions.length === 0) {
            console.warn(`Nenhum dispositivo encontrado para o user ${userId}`);
            return { error: 'Sem aparelhos ligados' };
        }

        let sucessos = 0;
        const payload = JSON.stringify({ title, body, url });

        // Envia para cada aparelho que o usuário tenha permitido (PC, Celular 1, etc)
        for (const sub of subscriptions) {
            try {
                await webpush.sendNotification(sub.subscription, payload);
                sucessos++;
            } catch (err: any) {
                // Se der erro (ex: cliente desinstalou o app), seria bom remover a subscription do banco
                if (err.statusCode === 410 || err.statusCode === 404) {
                    console.log('Subscription expirada, deletando do banco...');
                    await supabaseAdmin
                        .from('push_subscriptions')
                        .delete()
                        .eq('subscription->>endpoint', sub.subscription.endpoint);
                } else {
                    console.error('Erro enviando push specific:', err);
                }
            }
        }

        return { success: true, count: sucessos };
    } catch (e: any) {
        console.error('Exception ao enviar push:', e);
        return { error: e.message };
    }
}
