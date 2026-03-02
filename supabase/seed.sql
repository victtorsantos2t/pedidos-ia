-- Inserir Categoria: Hamburguer
INSERT INTO public.categories (id, name, sort_order, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Hambúrgueres Premium', 1, true);

-- Inserir Categoria: Bebidas
INSERT INTO public.categories (id, name, sort_order, is_active)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'Bebidas Geladas', 2, true);

-- Inserir 5 Hambúrgueres
INSERT INTO public.products (category_id, name, description, price, image_url, is_available)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Classic Burger', 'Blend 160g, queijo prato, alface, tomate e maionese da casa no pão brioche.', 32.90, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80', true),
  ('11111111-1111-1111-1111-111111111111', 'Double Cheddar Bacon', 'Dois blends de 160g, muito cheddar derretido, farofa de bacon crocante e cebola caramelizada.', 45.90, 'https://images.unsplash.com/photo-1594212202875-8eb6ea550423?auto=format&fit=crop&w=500&q=80', true),
  ('11111111-1111-1111-1111-111111111111', 'Smash Chicken', 'Sobrecoxa desossada e empanada super crocante, salada coleslaw e honey mustard.', 29.90, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=500&q=80', true),
  ('11111111-1111-1111-1111-111111111111', 'Veggie Supreme', 'Hambúrguer de grão de bico e cogumelos, queijo prato (opcional), rúcula e tomate seco.', 34.50, 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80', true),
  ('11111111-1111-1111-1111-111111111111', 'Truffle Monster', 'Blend 200g, queijo gruyère, maionese trufada e cogumelos salteados no pão australiano.', 52.00, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=500&q=80', true);


-- Inserir 5 Bebidas
INSERT INTO public.products (category_id, name, description, price, image_url, is_available)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'Coca-Cola Latinha 350ml', 'Refrigerante Cola Lata.', 6.50, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80', true),
  ('22222222-2222-2222-2222-222222222222', 'Guaraná Antarctica 350ml', 'Refrigerante Guaraná Lata.', 6.50, 'https://images.unsplash.com/photo-1626082895617-2c6b412bfebf?auto=format&fit=crop&w=500&q=80', true),
  ('22222222-2222-2222-2222-222222222222', 'Suco Natural Laranja 500ml', 'Suco de laranja natural feito na hora, sem açúcar e sem gelo.', 12.00, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=500&q=80', true),
  ('22222222-2222-2222-2222-222222222222', 'Milkshake de Ovomaltine', 'Sorvete artesanal, muito ovomaltine e chantilly. 400ml.', 22.90, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80', true),
  ('22222222-2222-2222-2222-222222222222', 'Água com Gás com Limão', 'Água mineral com gás 500ml e rodelas de limão taiti.', 5.00, 'https://images.unsplash.com/photo-1559839914-11aae4f45bd3?auto=format&fit=crop&w=500&q=80', true);
