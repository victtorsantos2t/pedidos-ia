-- Nova funcionalidade: Adicionais e Observações

-- 1. Criar tabela de Adicionais (Extras) vinculados a Produtos
CREATE TABLE product_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS da nova tabela
ALTER TABLE product_extras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Extras are publically viewable" ON product_extras FOR SELECT USING (is_active = true);

CREATE POLICY "Admins bypass RLS on extras" ON product_extras FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 2. Adicionar suporte a JSONB para salvar o "snapshot" dos adicionais na hora da compra, 
-- para garantir que se o preço do adicional mudar amanhã, o pedido antigo mantenha o valor certo.
ALTER TABLE order_items ADD COLUMN extras JSONB DEFAULT '[]'::jsonb;


-- ==============================================================================
-- 3. (OPCIONALIDADE P/ TESTE) Inserir alguns adicionais nos Lanches atuais
-- Vamos colocar Bacon, Cheddar e Ovo em todos os lanches da categoria Hambúrgueres
INSERT INTO public.product_extras (product_id, name, price)
SELECT id, 'Bacon Extra', 4.50 FROM products WHERE category_id = (SELECT id FROM categories WHERE name = 'Hambúrgueres Premium' LIMIT 1);

INSERT INTO public.product_extras (product_id, name, price)
SELECT id, 'Cheddar Extra', 3.00 FROM products WHERE category_id = (SELECT id FROM categories WHERE name = 'Hambúrgueres Premium' LIMIT 1);

INSERT INTO public.product_extras (product_id, name, price)
SELECT id, 'Ovo Frito', 2.00 FROM products WHERE category_id = (SELECT id FROM categories WHERE name = 'Hambúrgueres Premium' LIMIT 1);
