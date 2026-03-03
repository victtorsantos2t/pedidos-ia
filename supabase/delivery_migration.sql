
-- 1. Criação da tabela de Zonas de Entrega
CREATE TABLE IF NOT EXISTS public.delivery_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    raio_min_km DECIMAL NOT NULL DEFAULT 0,
    raio_max_km DECIMAL NOT NULL,
    taxa_base DECIMAL NOT NULL DEFAULT 0,
    valor_km_extra DECIMAL NOT NULL DEFAULT 0,
    pedido_minimo DECIMAL NOT NULL DEFAULT 0,
    frete_gratis_acima DECIMAL NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Índices para performance (Haversine/Busca por Raio)
CREATE INDEX IF NOT EXISTS idx_delivery_zones_raio_range ON public.delivery_zones (raio_min_km, raio_max_km);

-- 3. Habilitar RLS
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Segurança (Visão Pública / Escrita Admin)
CREATE POLICY "Zonas de entrega visíveis para todos" ON public.delivery_zones
    FOR SELECT USING (ativo = true);

CREATE POLICY "Admins possuem controle total sobre zonas" ON public.delivery_zones
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

-- 5. Inserir Zonas de Exemplo (Zonas de São Paulo como referência)
INSERT INTO public.delivery_zones (nome, raio_min_km, raio_max_km, taxa_base, valor_km_extra, pedido_minimo, frete_gratis_acima)
VALUES 
('Zona Local (Grátis)', 0, 1.5, 0, 0, 30.00, 0),
('Zona Urbana 1', 1.5, 3.5, 5.00, 1.50, 40.00, 100.00),
('Zona Urbana 2', 3.5, 7.0, 9.00, 2.00, 50.00, 150.00),
('Zona Estendida', 7.0, 12.0, 15.00, 3.50, 70.00, 250.00)
ON CONFLICT DO NOTHING;

-- 6. Adicionar colunas de coordenadas ao store_config
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_config' AND column_name='lat') THEN
        ALTER TABLE public.store_config ADD COLUMN lat DECIMAL DEFAULT -23.5505;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='store_config' AND column_name='lng') THEN
        ALTER TABLE public.store_config ADD COLUMN lng DECIMAL DEFAULT -46.6333;
    END IF;
END $$;
