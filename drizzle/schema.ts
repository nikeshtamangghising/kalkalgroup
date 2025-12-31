import { pgTable, index, unique, text, timestamp, foreignKey, integer, boolean, numeric, json } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

const gen_random_uuid = () => sql`gen_random_uuid()`;



export const verificationTokens = pgTable("verification_tokens", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	index("verification_tokens_identifier_token_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops"), table.token.asc().nullsLast().op("text_ops")),
	unique("verification_tokens_token_unique").on(table.token),
]);

export const accounts = pgTable("accounts", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	scope: text(),
	userId: text("user_id").notNull(),
	providerAccountId: text("provider_account_id").notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	idToken: text("id_token"),
	sessionState: text("session_state"),
}, (table) => [
	index("accounts_provider_idx").using("btree", table.provider.asc().nullsLast().op("text_ops"), table.providerAccountId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "accounts_user_id_users_id_fk"
		}),
]);

export const addresses = pgTable("addresses", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	type: text().default('SHIPPING').notNull(),
	phone: text(),
	city: text().notNull(),
	country: text().notNull(),
	state: text(),
	userId: text("user_id").notNull(),
	label: text(),
	fullName: text("full_name").notNull(),
	email: text(),
	line1: text().notNull(),
	line2: text(),
	postalCode: text("postal_code").notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("addresses_default_per_type_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.type.asc().nullsLast().op("text_ops")).where(sql`(is_default = true)`),
	index("addresses_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "addresses_user_id_users_id_fk"
		}),
]);

export const brands = pgTable("brands", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	website: text(),
	logoUrl: text("logo_url"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("brands_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("brands_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("brands_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	unique("brands_name_unique").on(table.name),
	unique("brands_slug_unique").on(table.slug),
]);

export const cartItems = pgTable("cart_items", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	quantity: integer().default(1).notNull(),
	cartId: text("cart_id").notNull(),
	productId: text("product_id").notNull(),
	productVariantId: text("product_variant_id").notNull(),
	unitPrice: numeric("unit_price", { precision: 12, scale:  2 }).notNull(),
	currency: text().default('NPR').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("cart_items_cart_idx").using("btree", table.cartId.asc().nullsLast().op("text_ops")),
	index("cart_items_product_idx").using("btree", table.productId.asc().nullsLast().op("text_ops")),
	index("cart_items_unique_idx").using("btree", table.cartId.asc().nullsLast().op("text_ops"), table.productVariantId.asc().nullsLast().op("text_ops")),
	index("cart_items_variant_idx").using("btree", table.productVariantId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.cartId],
			foreignColumns: [carts.id],
			name: "cart_items_cart_id_carts_id_fk"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "cart_items_product_id_products_id_fk"
		}),
	foreignKey({
			columns: [table.productVariantId],
			foreignColumns: [productVariants.id],
			name: "cart_items_product_variant_id_product_variants_id_fk"
		}),
]);

export const categories = pgTable("categories", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	parentId: text("parent_id"),
	imageUrl: text("image_url"),
	isActive: boolean("is_active").default(true).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("categories_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("categories_parent_idx").using("btree", table.parentId.asc().nullsLast().op("text_ops")),
	index("categories_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	unique("categories_slug_unique").on(table.slug),
]);

export const inventoryAdjustments = pgTable("inventory_adjustments", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	reason: text(),
	productVariantId: text("product_variant_id").notNull(),
	quantityChange: integer("quantity_change").notNull(),
	referenceType: text("reference_type"),
	referenceId: text("reference_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("inventory_adjustments_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("inventory_adjustments_product_variant_idx").using("btree", table.productVariantId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.productVariantId],
			foreignColumns: [productVariants.id],
			name: "inventory_adjustments_product_variant_id_product_variants_id_fk"
		}),
]);

export const orderItems = pgTable("order_items", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	quantity: integer().notNull(),
	price: numeric({ precision: 12, scale:  2 }).notNull(),
	orderId: text("order_id").notNull(),
	productId: text("product_id").notNull(),
	productVariantId: text("product_variant_id").notNull(),
	nameSnapshot: text("name_snapshot").notNull(),
	skuSnapshot: text("sku_snapshot"),
	currency: text().default('NPR').notNull(),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("order_items_order_idx").using("btree", table.orderId.asc().nullsLast().op("text_ops")),
	index("order_items_product_idx").using("btree", table.productId.asc().nullsLast().op("text_ops")),
	index("order_items_variant_idx").using("btree", table.productVariantId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_orders_id_fk"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "order_items_product_id_products_id_fk"
		}),
	foreignKey({
			columns: [table.productVariantId],
			foreignColumns: [productVariants.id],
			name: "order_items_product_variant_id_product_variants_id_fk"
		}),
]);

export const orders = pgTable("orders", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	status: text().default('PENDING_PAYMENT').notNull(),
	orderNumber: text("order_number").notNull(),
	userId: text("user_id"),
	cartId: text("cart_id"),
	paymentStatus: text("payment_status").default('PENDING').notNull(),
	fulfillmentStatus: text("fulfillment_status").default('PENDING').notNull(),
	subtotal: numeric({ precision: 12, scale:  2 }).notNull(),
	taxTotal: numeric("tax_total", { precision: 12, scale:  2 }).default('0').notNull(),
	shippingTotal: numeric("shipping_total", { precision: 12, scale:  2 }).default('0').notNull(),
	discountTotal: numeric("discount_total", { precision: 12, scale:  2 }).default('0').notNull(),
	grandTotal: numeric("grand_total", { precision: 12, scale:  2 }).notNull(),
	currency: text().default('NPR').notNull(),
	shippingAddressId: text("shipping_address_id"),
	billingAddressId: text("billing_address_id"),
	notes: text(),
	placedAt: timestamp("placed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("orders_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("orders_order_number_idx").using("btree", table.orderNumber.asc().nullsLast().op("text_ops")),
	index("orders_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("orders_user_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "orders_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.cartId],
			foreignColumns: [carts.id],
			name: "orders_cart_id_carts_id_fk"
		}),
	foreignKey({
			columns: [table.shippingAddressId],
			foreignColumns: [addresses.id],
			name: "orders_shipping_address_id_addresses_id_fk"
		}),
	foreignKey({
			columns: [table.billingAddressId],
			foreignColumns: [addresses.id],
			name: "orders_billing_address_id_addresses_id_fk"
		}),
	unique("orders_order_number_unique").on(table.orderNumber),
]);

export const sessions = pgTable("sessions", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
	sessionToken: text("session_token").notNull(),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_user_id_users_id_fk"
		}),
	unique("sessions_session_token_unique").on(table.sessionToken),
]);

export const users = pgTable("users", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	email: text().notNull(),
	name: text().notNull(),
	role: text().default('CUSTOMER').notNull(),
	passwordHash: text("password_hash"),
	phone: text(),
	avatarUrl: text("avatar_url"),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("users_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("users_role_idx").using("btree", table.role.asc().nullsLast().op("text_ops")),
	unique("users_email_unique").on(table.email),
]);

export const carts = pgTable("carts", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	userId: text("user_id"),
	sessionId: text("session_id"),
	status: text().default('ACTIVE').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("carts_session_idx").using("btree", table.sessionId.asc().nullsLast().op("text_ops")),
	index("carts_user_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "carts_user_id_users_id_fk"
		}),
]);

export const payments = pgTable("payments", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	orderId: text("order_id").notNull(),
	provider: text().notNull(),
	providerReference: text("provider_reference"),
	status: text().default('PENDING').notNull(),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	currency: text().default('NPR').notNull(),
	capturedAt: timestamp("captured_at", { mode: 'string' }),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("payments_order_idx").using("btree", table.orderId.asc().nullsLast().op("text_ops")),
	index("payments_provider_idx").using("btree", table.provider.asc().nullsLast().op("text_ops")),
	index("payments_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "payments_order_id_orders_id_fk"
		}),
]);

export const productImages = pgTable("product_images", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	productId: text("product_id").notNull(),
	imageUrl: text("image_url").notNull(),
	altText: text("alt_text"),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("product_images_product_idx").using("btree", table.productId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_images_product_id_products_id_fk"
		}),
]);

export const productVariants = pgTable("product_variants", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	productId: text("product_id").notNull(),
	sku: text().notNull(),
	attributes: json(),
	price: numeric({ precision: 12, scale:  2 }).notNull(),
	currency: text().default('NPR').notNull(),
	inventoryQuantity: integer("inventory_quantity").default(0).notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("product_variants_default_idx").using("btree", table.productId.asc().nullsLast().op("text_ops")).where(sql`(is_default = true)`),
	index("product_variants_product_idx").using("btree", table.productId.asc().nullsLast().op("text_ops")),
	index("product_variants_sku_idx").using("btree", table.sku.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_variants_product_id_products_id_fk"
		}),
	unique("product_variants_sku_unique").on(table.sku),
]);

export const profiles = pgTable("profiles", {
	userId: text("user_id").primaryKey().notNull(),
	gender: text(),
	dateOfBirth: timestamp("date_of_birth", { mode: 'string' }),
	marketingOptIn: boolean("marketing_opt_in").default(false).notNull(),
	preferences: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "profiles_user_id_users_id_fk"
		}),
]);

export const shipments = pgTable("shipments", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	orderId: text("order_id").notNull(),
	carrier: text(),
	trackingNumber: text("tracking_number"),
	status: text().default('PENDING').notNull(),
	shippedAt: timestamp("shipped_at", { mode: 'string' }),
	deliveredAt: timestamp("delivered_at", { mode: 'string' }),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("shipments_order_idx").using("btree", table.orderId.asc().nullsLast().op("text_ops")),
	index("shipments_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("shipments_tracking_number_idx").using("btree", table.trackingNumber.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "shipments_order_id_orders_id_fk"
		}),
]);

export const gallery = pgTable("gallery", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	category: text().default('FACTORY').notNull(),
	imageUrl: text("image_url").notNull(),
	cloudinaryPublicId: text("cloudinary_public_id").notNull(),
	altText: text("alt_text"),
	isActive: boolean("is_active").default(true).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	tags: text().array().default([""]),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("gallery_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("gallery_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("gallery_sort_order_idx").using("btree", table.sortOrder.asc().nullsLast().op("int4_ops")),
]);

export const siteSettings = pgTable("site_settings", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	key: text().notNull(),
	value: text().notNull(),
	type: text().default('STRING').notNull(),
	description: text(),
	category: text().default('general'),
	isPublic: boolean("is_public").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("site_settings_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("site_settings_key_idx").using("btree", table.key.asc().nullsLast().op("text_ops")),
	unique("site_settings_key_unique").on(table.key),
]);

export const products = pgTable("products", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text().notNull(),
	currency: text().default('NPR').notNull(),
	tags: text().array().default([""]).notNull(),
	status: text().default('DRAFT').notNull(),
	brandId: text("brand_id"),
	categoryId: text("category_id"),
	thumbnailUrl: text("thumbnail_url"),
	basePrice: numeric("base_price", { precision: 12, scale:  2 }).notNull(),
	seoTitle: text("seo_title"),
	seoDescription: text("seo_description"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	shortDescription: text("short_description"),
	price: numeric({ precision: 12, scale:  2 }),
	discountPrice: numeric("discount_price", { precision: 12, scale:  2 }),
	purchasePrice: numeric("purchase_price", { precision: 12, scale:  2 }),
	images: text().array().default([""]).notNull(),
	sku: text(),
	isActive: boolean("is_active").default(true).notNull(),
	isFeatured: boolean("is_featured").default(false).notNull(),
	isNewArrival: boolean("is_new_arrival").default(false).notNull(),
	inventory: integer().default(0).notNull(),
	lowStockThreshold: integer("low_stock_threshold").default(0).notNull(),
	orderCount: integer("order_count").default(0).notNull(),
	purchaseCount: integer("purchase_count").default(0).notNull(),
	viewCount: integer("view_count").default(0).notNull(),
	popularityScore: numeric("popularity_score", { precision: 10, scale:  2 }).default('0').notNull(),
	ratingAvg: numeric("rating_avg", { precision: 3, scale:  2 }).default('0').notNull(),
	ratingCount: integer("rating_count").default(0).notNull(),
	metaTitle: text("meta_title"),
	metaDescription: text("meta_description"),
	weight: numeric({ precision: 10, scale:  3 }),
	dimensions: json(),
	attributes: json(),
}, (table) => [
	index("products_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("products_brand_idx").using("btree", table.brandId.asc().nullsLast().op("text_ops")),
	index("products_category_idx").using("btree", table.categoryId.asc().nullsLast().op("text_ops")),
	index("products_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("products_featured_idx").using("btree", table.isFeatured.asc().nullsLast().op("bool_ops")),
	index("products_popularity_idx").using("btree", table.popularityScore.asc().nullsLast().op("numeric_ops")),
	index("products_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("products_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.brandId],
			foreignColumns: [brands.id],
			name: "products_brand_id_brands_id_fk"
		}),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "products_category_id_categories_id_fk"
		}),
	unique("products_slug_unique").on(table.slug),
]);

export const userActivities = pgTable("user_activities", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	userId: text("user_id"),
	sessionId: text("session_id"),
	productId: text("product_id"),
	activityType: text("activity_type").notNull(),
	metadata: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("user_activities_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("user_activities_product_idx").using("btree", table.productId.asc().nullsLast().op("text_ops")),
	index("user_activities_type_idx").using("btree", table.activityType.asc().nullsLast().op("text_ops")),
	index("user_activities_user_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_activities_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "user_activities_product_id_products_id_fk"
		}),
]);

export const userInterests = pgTable("user_interests", {
	id: text().default(gen_random_uuid()).primaryKey().notNull(),
	userId: text("user_id"),
	categoryId: text("category_id"),
	score: numeric({ precision: 5, scale:  2 }).default('1'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("user_interests_category_idx").using("btree", table.categoryId.asc().nullsLast().op("text_ops")),
	index("user_interests_user_category_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.categoryId.asc().nullsLast().op("text_ops")),
	index("user_interests_user_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_interests_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "user_interests_category_id_categories_id_fk"
		}),
]);
