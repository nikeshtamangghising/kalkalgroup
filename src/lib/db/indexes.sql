-- Database Performance Indexes
-- These indexes optimize common queries in the KalKal e-commerce application

-- ============================================================================
-- PRODUCTS TABLE INDEXES
-- ============================================================================

-- Index for product listing and filtering
CREATE INDEX IF NOT EXISTS idx_products_category_active 
ON products(category_id, is_active) 
WHERE is_active = true;

-- Index for product search by slug
CREATE INDEX IF NOT EXISTS idx_products_slug 
ON products(slug);

-- Index for featured products
CREATE INDEX IF NOT EXISTS idx_products_featured 
ON products(is_featured, is_active) 
WHERE is_featured = true AND is_active = true;

-- Index for new arrivals
CREATE INDEX IF NOT EXISTS idx_products_new_arrivals 
ON products(is_new_arrival, created_at DESC) 
WHERE is_new_arrival = true AND is_active = true;

-- Index for product popularity
CREATE INDEX IF NOT EXISTS idx_products_popularity 
ON products(popularity_score DESC, is_active) 
WHERE is_active = true;

-- Index for low stock alerts
CREATE INDEX IF NOT EXISTS idx_products_low_stock 
ON products(inventory, low_stock_threshold) 
WHERE inventory <= low_stock_threshold AND is_active = true;

-- Index for product brand filtering
CREATE INDEX IF NOT EXISTS idx_products_brand 
ON products(brand_id, is_active) 
WHERE is_active = true;

-- Full-text search index for product name and description
CREATE INDEX IF NOT EXISTS idx_products_search 
ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================================================
-- ORDERS TABLE INDEXES
-- ============================================================================

-- Index for user orders
CREATE INDEX IF NOT EXISTS idx_orders_user 
ON orders(user_id, created_at DESC);

-- Index for guest orders
CREATE INDEX IF NOT EXISTS idx_orders_guest_email 
ON orders(guest_email, created_at DESC) 
WHERE is_guest_order = true;

-- Index for order status tracking
CREATE INDEX IF NOT EXISTS idx_orders_status 
ON orders(status, created_at DESC);

-- Index for tracking number lookup
CREATE INDEX IF NOT EXISTS idx_orders_tracking 
ON orders(tracking_number) 
WHERE tracking_number IS NOT NULL;

-- ============================================================================
-- ORDER ITEMS TABLE INDEXES
-- ============================================================================

-- Index for order items by order
CREATE INDEX IF NOT EXISTS idx_order_items_order 
ON order_items(order_id);

-- Index for product sales analytics
CREATE INDEX IF NOT EXISTS idx_order_items_product 
ON order_items(product_id, created_at DESC);

-- ============================================================================
-- REVIEWS TABLE INDEXES
-- ============================================================================

-- Index for product reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product 
ON reviews(product_id, is_approved, created_at DESC) 
WHERE is_approved = true;

-- Index for user reviews
CREATE INDEX IF NOT EXISTS idx_reviews_user 
ON reviews(user_id, created_at DESC);

-- Index for verified purchase reviews
CREATE INDEX IF NOT EXISTS idx_reviews_verified 
ON reviews(product_id, is_verified_purchase) 
WHERE is_verified_purchase = true AND is_approved = true;

-- ============================================================================
-- USER ACTIVITIES TABLE INDEXES
-- ============================================================================

-- Index for user activity tracking
CREATE INDEX IF NOT EXISTS idx_user_activities_user 
ON user_activities(user_id, created_at DESC);

-- Index for product activity analytics
CREATE INDEX IF NOT EXISTS idx_user_activities_product 
ON user_activities(product_id, activity_type, created_at DESC);

-- Index for session tracking
CREATE INDEX IF NOT EXISTS idx_user_activities_session 
ON user_activities(session_id, created_at DESC);

-- ============================================================================
-- USER FAVORITES TABLE INDEXES
-- ============================================================================

-- Index for user favorites lookup
CREATE INDEX IF NOT EXISTS idx_user_favorites_user 
ON user_favorites(user_id, created_at DESC);

-- Index for product favorites count
CREATE INDEX IF NOT EXISTS idx_user_favorites_product 
ON user_favorites(product_id);

-- ============================================================================
-- CART ITEMS TABLE INDEXES
-- ============================================================================

-- Index for user cart
CREATE INDEX IF NOT EXISTS idx_cart_items_user 
ON cart_items(user_id, updated_at DESC);

-- Index for guest cart (session-based)
CREATE INDEX IF NOT EXISTS idx_cart_items_session 
ON cart_items(session_id, updated_at DESC) 
WHERE session_id IS NOT NULL;

-- Index for cart product lookup
CREATE INDEX IF NOT EXISTS idx_cart_items_product 
ON cart_items(product_id);

-- ============================================================================
-- INVENTORY ADJUSTMENTS TABLE INDEXES
-- ============================================================================

-- Index for product inventory history
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_product 
ON inventory_adjustments(product_id, created_at DESC);

-- Index for inventory audit trail
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_user 
ON inventory_adjustments(user_id, created_at DESC);

-- Index for inventory change type analytics
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_type 
ON inventory_adjustments(change_type, created_at DESC);

-- ============================================================================
-- CATEGORIES TABLE INDEXES
-- ============================================================================

-- Index for category hierarchy
CREATE INDEX IF NOT EXISTS idx_categories_parent 
ON categories(parent_id, sort_order);

-- Index for active categories
CREATE INDEX IF NOT EXISTS idx_categories_active 
ON categories(is_active, sort_order) 
WHERE is_active = true;

-- ============================================================================
-- DISCOUNTS TABLE INDEXES
-- ============================================================================

-- Index for active discounts
CREATE INDEX IF NOT EXISTS idx_discounts_active 
ON discounts(is_active, valid_from, valid_to) 
WHERE is_active = true;

-- Index for discount code lookup
CREATE INDEX IF NOT EXISTS idx_discounts_code 
ON discounts(code) 
WHERE is_active = true;

-- ============================================================================
-- EMAIL LOGS TABLE INDEXES
-- ============================================================================

-- Index for email status tracking
CREATE INDEX IF NOT EXISTS idx_email_logs_status 
ON email_logs(status, created_at DESC);

-- Index for recipient email lookup
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient 
ON email_logs("to", created_at DESC);

-- ============================================================================
-- ADDRESSES TABLE INDEXES
-- ============================================================================

-- Index for user addresses
CREATE INDEX IF NOT EXISTS idx_addresses_user 
ON addresses(user_id, is_default DESC);

-- ============================================================================
-- PERFORMANCE NOTES
-- ============================================================================

-- 1. Partial indexes (with WHERE clause) are used for frequently filtered data
--    to reduce index size and improve performance
--
-- 2. Composite indexes are ordered by most selective column first
--
-- 3. DESC indexes are used for timestamp columns that are commonly sorted
--    in descending order (newest first)
--
-- 4. Full-text search index uses GIN (Generalized Inverted Index) for
--    efficient text search on product names and descriptions
--
-- 5. These indexes should be created AFTER initial data load for better
--    performance during bulk inserts
--
-- 6. Monitor index usage with:
--    SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';
--
-- 7. Remove unused indexes to improve write performance:
--    SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;
