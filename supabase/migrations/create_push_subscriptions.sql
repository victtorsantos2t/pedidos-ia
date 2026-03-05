-- Script SQL para criar a tabela de Push Subscriptions no Supabase
-- Execute este script no SQL Editor do seu painel do Supabase.

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configurando RLS (Row Level Security)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Usuários só podem ver e inserir suas próprias inscrições
CREATE POLICY "Users can add own subscriptions" 
    ON push_subscriptions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" 
    ON push_subscriptions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
    ON push_subscriptions FOR DELETE
    USING (auth.uid() = user_id);

-- O Service Role (backend) precisa ter acesso total para poder ler todas as assinaturas e enviar as mensagens
-- O Service Role ignora as políticas RLS por padrão quando usamos o supabase-admin (chave 'service_role'),
-- então não precisamos criar uma política específica para o dashboard se usarmos essa chave no backend.
