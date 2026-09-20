ALTER TABLE public.chapters
  ADD COLUMN IF NOT EXISTS unit_title text,
  ADD COLUMN IF NOT EXISTS source_page integer,
  ADD COLUMN IF NOT EXISTS source_key text;

CREATE UNIQUE INDEX IF NOT EXISTS chapters_source_key_unique
  ON public.chapters (source_key)
  WHERE source_key IS NOT NULL;

INSERT INTO public.chapters (title, description, class_name, order_index, unit_title, source_page, source_key)
VALUES
  ('Introduction to Agricultural Practices', 'Unit I · Work with Life Forms', 'IX', 1, 'Work with Life Forms', 5, 'kaushal-vikas-01'),
  ('Rooftop Gardening', 'Unit I · Work with Life Forms', 'IX', 2, 'Work with Life Forms', 21, 'kaushal-vikas-02'),
  ('Precision Farming', 'Unit I · Work with Life Forms', 'IX', 3, 'Work with Life Forms', 39, 'kaushal-vikas-03'),
  ('Additional Vocations — Life Forms', 'Mushroom Cultivation, Aquaponics, Pisciculture, Backyard Poultry and Non-timber Forest Produce', 'IX', 4, 'Work with Life Forms', 61, 'kaushal-vikas-04'),
  ('Shaping Materials', 'Unit II · Work with Machines and Materials', 'IX', 5, 'Work with Machines and Materials', 73, 'kaushal-vikas-05'),
  ('Construction', 'Unit II · Work with Machines and Materials', 'IX', 6, 'Work with Machines and Materials', 91, 'kaushal-vikas-06'),
  ('Apparel', 'Unit II · Work with Machines and Materials', 'IX', 7, 'Work with Machines and Materials', 113, 'kaushal-vikas-07'),
  ('Additional Vocations — Machines and Materials', 'Sheet Metal Work, Plumbing, Food Processing, Furniture Making and Pottery', 'IX', 8, 'Work with Machines and Materials', 133, 'kaushal-vikas-08'),
  ('Personal and Lifestyle Services', 'Unit III · Work in Human Services', 'IX', 9, 'Work in Human Services', 145, 'kaushal-vikas-09'),
  ('Healthcare', 'Unit III · Work in Human Services', 'IX', 10, 'Work in Human Services', 163, 'kaushal-vikas-10'),
  ('Tourism', 'Unit III · Work in Human Services', 'IX', 11, 'Work in Human Services', 185, 'kaushal-vikas-11'),
  ('Additional Vocations — Human Services', 'Hospitality, Event Management, Data-based Services, Interior Design and Public Information Services', 'IX', 12, 'Work in Human Services', 207, 'kaushal-vikas-12')
ON CONFLICT (source_key) WHERE source_key IS NOT NULL DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  unit_title = EXCLUDED.unit_title,
  source_page = EXCLUDED.source_page;