-- =================================================================================
-- RDOS - PRODUCTION SCALING & ENTERPRISE PREPARATION
-- Contém: Defesas, Índices, Event Sourcing (Auditoria) e Baseline Multi-Tenant.
-- =================================================================================

-- ---------------------------------------------------------------------------------
-- 1. CONSTRAINTS DE E-COMMERCE (Defesa de Domínio API)
-- ---------------------------------------------------------------------------------
ALTER TABLE public.products ADD CONSTRAINT chk_product_price CHECK (price >= 0);
ALTER TABLE public.product_extras ADD CONSTRAINT chk_extra_price CHECK (price >= 0);
ALTER TABLE public.order_items ADD CONSTRAINT chk_qty_positivo CHECK (quantity > 0);
ALTER TABLE public.order_items ADD CONSTRAINT chk_item_price CHECK (unit_price >= 0);
ALTER TABLE public.orders ADD CONSTRAINT chk_total_positivo CHECK (total_amount >= 0);

-- ---------------------------------------------------------------------------------
-- 2. SUPORTE A ENTERPRISE SOFT DELETES (deleted_at)
-- ---------------------------------------------------------------------------------
ALTER TABLE public.categories ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE public.products ADD COLUMN deleted_at TIMESTAMPTZ;
-- Modificamos as visualizações públicas para obedecer ao Soft Delete
-- Nota: Será necessário atualizar o Frontend para buscar `.is('deleted_at', null)`

-- ---------------------------------------------------------------------------------
-- 3. PREPARAÇÃO MULTI-TENANT (SaaS Ready)
-- ---------------------------------------------------------------------------------
-- Adicionamos a coluna store_id sem ferir a arquitetura atual para não quebrar a aplicação.
ALTER TABLE public.categories ADD COLUMN store_id INT DEFAULT 1 REFERENCES store_config(id);
ALTER TABLE public.products ADD COLUMN store_id INT DEFAULT 1 REFERENCES store_config(id);
ALTER TABLE public.orders ADD COLUMN store_id INT DEFAULT 1 REFERENCES store_config(id);
ALTER TABLE public.delivery_zones ADD COLUMN store_id INT DEFAULT 1 REFERENCES store_config(id);

-- ---------------------------------------------------------------------------------
-- 4. ÍNDICES DE PERFORMANCE (Otimizações essenciais)
-- ---------------------------------------------------------------------------------
-- Foreign Keys
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_product_extras_product ON public.product_extras(product_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_user_id ON public.push_subscriptions(user_id);

-- Índices Composto Padrão SaaS (Tenant + Data)
CREATE INDEX IF NOT EXISTS idx_orders_tenant_created ON public.orders(store_id, created_at DESC);

-- Partial Index do Kanban
CREATE INDEX IF NOT EXISTS idx_active_orders_kanban 
ON public.orders (store_id, status, created_at)
WHERE status NOT IN ('COMPLETED', 'CANCELLED');

-- ---------------------------------------------------------------------------------
-- 5. ORDER EVENTS (Auditoria de Ciclo de Vida do Pedido)
-- ---------------------------------------------------------------------------------
CREATE TABLE public.order_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    previous_status order_status,
    new_status order_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON public.order_events(order_id);
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

-- CRIAR O TRIGGER: Toda vez que o campo "status" da tabela orders for atualizado,
-- a base grava o log na tabela de Eventos automaticamente!
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') OR (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.order_events (order_id, previous_status, new_status)
        VALUES (
            NEW.id, 
            CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END, 
            NEW.status
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ativar o Trigger na tabela de Pedidos
CREATE TRIGGER trigger_log_order_status
AFTER INSERT OR UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION log_order_status_change();
