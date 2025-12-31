-- Create Admin User
-- Email: admin@kalkal.com
-- Password: kalkal2026admin

INSERT INTO users (email, name, password_hash, role, created_at, updated_at)
VALUES (
  'admin@kalkal.com',
  'Admin User',
  '$2b$10$U5FLiNaFoCJmaB90D./KY.sRag5gxmgPrVyNHp27WfuEfbkbxyG',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Create Basic Categories
INSERT INTO categories (name, slug, description, is_active, sort_order, created_at, updated_at)
VALUES 
  ('Electronics', 'electronics', 'Latest gadgets and electronic devices', true, 0, NOW(), NOW()),
  ('Clothing', 'clothing', 'Fashion and apparel for all occasions', true, 0, NOW(), NOW()),
  ('Home & Garden', 'home-garden', 'Everything for your home and garden', true, 0, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
ON CONFLICT (slug) DO NOTHING;

-- Note: To get the bcrypt hash for 'admin123', run this in Node.js:
-- const bcrypt = require('bcryptjs');
-- console.log(await bcrypt.hash('admin123', 10));
