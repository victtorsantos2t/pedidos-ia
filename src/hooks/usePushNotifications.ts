"use client";

import { useEffect, useState } from "react";
import { savePushSubscription } from "@/lib/actions/pushActions";

/*
    Hook simples para pedir permissão e registrar Service Worker de notificações web.
    Usado no _app ou no Layout principal, e chamado de preferência numa ação de usuário
    tipo "Acompanhar Pedido" ou após fazer o login / pedido com sucesso.
*/
export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>("default");

    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
        }
    }, []);

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    const requestPermissionAndSubscribe = async () => {
        if (!isSupported) {
            console.log("Notificações não são suportadas neste navegador.");
            return false;
        }

        try {
            // 1. Pede a permissão (A janela nativa do browser sobe aqui)
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result !== 'granted') {
                console.log("Permissão de notificação negada.");
                return false;
            }

            // 2. Registra o Roteador de Plano de Fundo (SW)
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            // 3. Aguarda ele ficar ativo (caso instalou e tá Waiting)
            await navigator.serviceWorker.ready;

            // 4. Checa se o usuário já não está inscrito no próprio navegador
            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                // Se não, assina com nossa chave mestra pública (VAPID PUBLIC KEY) 
                // Essa chave precisa estar nas variáveis de ambiente (.env.local) e começar com NEXT_PUBLIC_...
                const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                if (!vapidPublicKey) {
                    console.error("VAPID KEY não encontrada nas variáveis de ambiente");
                    return false;
                }

                const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true, // Obrigatório pelo Chrome
                    applicationServerKey: convertedVapidKey
                });
            }

            // 5. Salva na Nuvem (Supabase) via Server Action
            // Para não salvar infinito, do lado do servidor ele verifica se o record já existe.
            if (subscription) {
                await savePushSubscription(JSON.parse(JSON.stringify(subscription)));
            }

            return true;
        } catch (err) {
            console.error('Erro na Inscrição de Push:', err);
            return false;
        }
    };

    return {
        isSupported,
        permission,
        requestPermissionAndSubscribe
    };
}
