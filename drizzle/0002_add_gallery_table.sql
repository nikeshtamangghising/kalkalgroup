-- Migration: Add gallery table
-- Created: 2024-12-14

CREATE TABLE IF NOT EXISTS "gallery" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"image_url" text NOT NULL,
	"alt_text" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Insert sample gallery data
INSERT INTO "gallery" ("title", "description", "category", "image_url", "alt_text", "is_active", "sort_order") VALUES
('Main Production Facility', 'Our state-of-the-art 50,000+ liters daily capacity production facility', 'Factory', '/api/placeholder/600/400', 'Main Production Facility', true, 1),
('Quality Control Laboratory', 'Advanced testing equipment ensuring product quality and safety', 'Factory', '/api/placeholder/600/400', 'Quality Control Laboratory', true, 2),
('Storage & Warehouse', 'Climate-controlled storage facility for raw materials and finished products', 'Factory', '/api/placeholder/600/400', 'Storage & Warehouse', true, 3),
('Packaging Department', 'Automated packaging lines ensuring hygiene and efficiency', 'Factory', '/api/placeholder/600/400', 'Packaging Department', true, 4),
('Oil Extraction Process', 'Traditional cold-pressing method for premium mustard oil', 'Production', '/api/placeholder/600/400', 'Oil Extraction Process', true, 5),
('Refining Process', 'Modern refining equipment for pure, healthy cooking oils', 'Production', '/api/placeholder/600/400', 'Refining Process', true, 6),
('Daal Processing', 'Cleaning and processing of premium quality lentils and pulses', 'Production', '/api/placeholder/600/400', 'Daal Processing', true, 7),
('Quality Testing', 'Rigorous testing at every stage of production', 'Production', '/api/placeholder/600/400', 'Quality Testing', true, 8),
('Premium Mustard Oil', 'Our flagship cold-pressed mustard oil with authentic taste', 'Products', '/api/placeholder/600/400', 'Premium Mustard Oil', true, 9),
('Organic Sunflower Oil', 'Light, healthy sunflower oil perfect for everyday cooking', 'Products', '/api/placeholder/600/400', 'Organic Sunflower Oil', true, 10),
('Premium Daal Collection', 'High-quality lentils and pulses sourced from local farmers', 'Products', '/api/placeholder/600/400', 'Premium Daal Collection', true, 11),
('Sesame Oil', 'Rich, aromatic sesame oil for traditional and gourmet cooking', 'Products', '/api/placeholder/600/400', 'Sesame Oil', true, 12),
('Our Production Team', 'Skilled professionals ensuring quality at every step', 'Team', '/api/placeholder/600/400', 'Our Production Team', true, 13),
('Quality Control Team', 'Expert team maintaining our high quality standards', 'Team', '/api/placeholder/600/400', 'Quality Control Team', true, 14),
('ISO Certification', 'International quality standards certification', 'Awards', '/api/placeholder/600/400', 'ISO Certification', true, 15),
('Food Safety Awards', 'Recognition for excellence in food safety and quality', 'Awards', '/api/placeholder/600/400', 'Food Safety Awards', true, 16);