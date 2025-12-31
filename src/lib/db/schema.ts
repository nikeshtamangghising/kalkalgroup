import { relations } from 'drizzle-orm'
import { pgTable, text, numeric, timestamp, boolean, integer, json, index } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

/**
 * ENUMS
 */
export const Role = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
} as const

export const AddressType = {
  SHIPPING: 'SHIPPING',
  BILLING: 'BILLING',
} as const

export const ProductStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ACTIVE: 'ACTIVE',
  DISCONTINUED: 'DISCONTINUED',
} as const

export const InventoryChangeType = {
  MANUAL_ADJUSTMENT: 'MANUAL_ADJUSTMENT',
  RESTOCK: 'RESTOCK',
  DAMAGED: 'DAMAGED',
  ORDER_PLACED: 'ORDER_PLACED',
  ORDER_RETURNED: 'ORDER_RETURNED',
  INITIAL: 'INITIAL',
  OTHER: 'OTHER',
} as const

export const OrderStatus = {
  DRAFT: 'DRAFT',
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PROCESSING: 'PROCESSING',
  FULFILLED: 'FULFILLED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const

export const PaymentStatus = {
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const

export const ShipmentStatus = {
  PENDING: 'PENDING',
  LABEL_CREATED: 'LABEL_CREATED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const

export const GalleryCategory = {
  FACTORY: 'FACTORY',
  PRODUCTION: 'PRODUCTION',
  PRODUCTS: 'PRODUCTS',
  TEAM: 'TEAM',
  FARMERS: 'FARMERS',
  EVENTS: 'EVENTS',
  FACILITY: 'FACILITY',
} as const

/**
 * AUTH / PROFILE
 */
export const users = pgTable('users', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash'),
  role: text('role').notNull().default(Role.CUSTOMER),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
}))

export const profiles = pgTable('profiles', {
  userId: text('user_id').primaryKey().references(() => users.id),
  gender: text('gender'),
  dateOfBirth: timestamp('date_of_birth'),
  marketingOptIn: boolean('marketing_opt_in').notNull().default(false),
  preferences: json('preferences'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refreshToken: text('refresh_token'),
  accessToken: text('access_token'),
  expiresAt: integer('expires_at'),
  tokenType: text('token_type'),
  scope: text('scope'),
  idToken: text('id_token'),
  sessionState: text('session_state'),
}, (table) => ({
  providerIdx: index('accounts_provider_idx').on(table.provider, table.providerAccountId),
}))

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  sessionToken: text('session_token').notNull().unique(),
  userId: text('user_id').notNull().references(() => users.id),
  expires: timestamp('expires').notNull(),
})

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: timestamp('expires').notNull(),
}, (table) => ({
  identifierTokenIdx: index('verification_tokens_identifier_token_idx').on(table.identifier, table.token),
}))

/**
 * ADDRESS BOOK
 */
export const addresses = pgTable('addresses', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').notNull().references(() => users.id),
  label: text('label'),
  type: text('type').notNull().default(AddressType.SHIPPING),
  fullName: text('full_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  line1: text('line1').notNull(),
  line2: text('line2'),
  city: text('city').notNull(),
  state: text('state'),
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userDefaultIdx: index('addresses_default_per_type_idx').on(table.userId, table.type).where(sql`${table.isDefault} = true`),
  userIdIdx: index('addresses_user_id_idx').on(table.userId),
}))

/**
 * CATALOG
 */
export const categories = pgTable('categories', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  parentId: text('parent_id'), // Will be set as foreign key in relations
  imageUrl: text('image_url'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  slugIdx: index('categories_slug_idx').on(table.slug),
  activeIdx: index('categories_active_idx').on(table.isActive),
  parentIdx: index('categories_parent_idx').on(table.parentId),
}))

export const brands = pgTable('brands', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  logoUrl: text('logo_url'),
  website: text('website'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  slugIdx: index('brands_slug_idx').on(table.slug),
  nameIdx: index('brands_name_idx').on(table.name),
  activeIdx: index('brands_active_idx').on(table.isActive),
}))

export const products = pgTable('products', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  shortDescription: text('short_description'),
  status: text('status').notNull().default(ProductStatus.DRAFT),
  brandId: text('brand_id').references(() => brands.id),
  categoryId: text('category_id').references(() => categories.id),
  thumbnailUrl: text('thumbnail_url'),
  basePrice: numeric('base_price', { precision: 12, scale: 2 }).notNull(),
  price: numeric('price', { precision: 12, scale: 2 }),
  discountPrice: numeric('discount_price', { precision: 12, scale: 2 }),
  purchasePrice: numeric('purchase_price', { precision: 12, scale: 2 }),
  currency: text('currency').notNull().default('NPR'),
  tags: text('tags').array().notNull().default(sql`'{}'::text[]`),
  images: text('images').array().notNull().default(sql`'{}'::text[]`),
  sku: text('sku'),
  isActive: boolean('is_active').notNull().default(true),
  isFeatured: boolean('is_featured').notNull().default(false),
  isNewArrival: boolean('is_new_arrival').notNull().default(false),
  inventory: integer('inventory').notNull().default(0),
  lowStockThreshold: integer('low_stock_threshold').notNull().default(0),
  orderCount: integer('order_count').notNull().default(0),
  purchaseCount: integer('purchase_count').notNull().default(0),
  viewCount: integer('view_count').notNull().default(0),
  popularityScore: numeric('popularity_score', { precision: 10, scale: 2 }).notNull().default('0'),
  ratingAvg: numeric('rating_avg', { precision: 3, scale: 2 }).notNull().default('0'),
  ratingCount: integer('rating_count').notNull().default(0),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  weight: numeric('weight', { precision: 10, scale: 3 }),
  dimensions: json('dimensions'),
  attributes: json('attributes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  slugIdx: index('products_slug_idx').on(table.slug),
  statusIdx: index('products_status_idx').on(table.status),
  activeIdx: index('products_active_idx').on(table.isActive),
  featuredIdx: index('products_featured_idx').on(table.isFeatured),
  categoryIdx: index('products_category_idx').on(table.categoryId),
  brandIdx: index('products_brand_idx').on(table.brandId),
  createdAtIdx: index('products_created_at_idx').on(table.createdAt),
  popularityIdx: index('products_popularity_idx').on(table.popularityScore),
}))

export const productVariants = pgTable('product_variants', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  productId: text('product_id').notNull().references(() => products.id),
  sku: text('sku').notNull().unique(),
  attributes: json('attributes'),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('NPR'),
  inventoryQuantity: integer('inventory_quantity').notNull().default(0),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  productIdx: index('product_variants_product_idx').on(table.productId),
  skuIdx: index('product_variants_sku_idx').on(table.sku),
  defaultIdx: index('product_variants_default_idx').on(table.productId).where(sql`${table.isDefault} = true`),
}))

export const productImages = pgTable('product_images', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  productId: text('product_id').notNull().references(() => products.id),
  imageUrl: text('image_url').notNull(),
  altText: text('alt_text'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  productIdx: index('product_images_product_idx').on(table.productId),
}))

/**
 * INVENTORY & CART
 */
export const inventoryAdjustments = pgTable('inventory_adjustments', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  productVariantId: text('product_variant_id').notNull().references(() => productVariants.id),
  quantityChange: integer('quantity_change').notNull(),
  reason: text('reason'),
  referenceType: text('reference_type'),
  referenceId: text('reference_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  productVariantIdx: index('inventory_adjustments_product_variant_idx').on(table.productVariantId),
  createdAtIdx: index('inventory_adjustments_created_at_idx').on(table.createdAt),
}))

export const carts = pgTable('carts', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').references(() => users.id),
  sessionId: text('session_id'),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('carts_user_idx').on(table.userId),
  sessionIdx: index('carts_session_idx').on(table.sessionId),
}))

export const cartItems = pgTable('cart_items', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  cartId: text('cart_id').notNull().references(() => carts.id),
  productId: text('product_id').notNull().references(() => products.id),
  productVariantId: text('product_variant_id').notNull().references(() => productVariants.id),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('NPR'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  cartProductVariantIdx: index('cart_items_unique_idx').on(table.cartId, table.productVariantId),
  cartIdx: index('cart_items_cart_idx').on(table.cartId),
  productIdx: index('cart_items_product_idx').on(table.productId),
  variantIdx: index('cart_items_variant_idx').on(table.productVariantId),
}))

/**
 * ORDERS / PAYMENTS / SHIPMENTS
 */
export const orders = pgTable('orders', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text('order_number').notNull().unique(),
  userId: text('user_id').references(() => users.id),
  cartId: text('cart_id').references(() => carts.id),
  status: text('status').notNull().default(OrderStatus.PENDING_PAYMENT),
  paymentStatus: text('payment_status').notNull().default(PaymentStatus.PENDING),
  fulfillmentStatus: text('fulfillment_status').notNull().default(ShipmentStatus.PENDING),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  taxTotal: numeric('tax_total', { precision: 12, scale: 2 }).notNull().default('0'),
  shippingTotal: numeric('shipping_total', { precision: 12, scale: 2 }).notNull().default('0'),
  discountTotal: numeric('discount_total', { precision: 12, scale: 2 }).notNull().default('0'),
  grandTotal: numeric('grand_total', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('NPR'),
  shippingAddressId: text('shipping_address_id').references(() => addresses.id),
  billingAddressId: text('billing_address_id').references(() => addresses.id),
  notes: text('notes'),
  placedAt: timestamp('placed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  orderNumberIdx: index('orders_order_number_idx').on(table.orderNumber),
  userIdx: index('orders_user_idx').on(table.userId),
  statusIdx: index('orders_status_idx').on(table.status),
  createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
}))

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  orderId: text('order_id').notNull().references(() => orders.id),
  productId: text('product_id').notNull().references(() => products.id),
  productVariantId: text('product_variant_id').notNull().references(() => productVariants.id),
  nameSnapshot: text('name_snapshot').notNull(),
  skuSnapshot: text('sku_snapshot'),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('NPR'),
  quantity: integer('quantity').notNull(),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  orderIdx: index('order_items_order_idx').on(table.orderId),
  productIdx: index('order_items_product_idx').on(table.productId),
  variantIdx: index('order_items_variant_idx').on(table.productVariantId),
}))

export const payments = pgTable('payments', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  orderId: text('order_id').notNull().references(() => orders.id),
  provider: text('provider').notNull(),
  providerReference: text('provider_reference'),
  status: text('status').notNull().default(PaymentStatus.PENDING),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('NPR'),
  capturedAt: timestamp('captured_at'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  orderIdx: index('payments_order_idx').on(table.orderId),
  providerIdx: index('payments_provider_idx').on(table.provider),
  statusIdx: index('payments_status_idx').on(table.status),
}))

export const shipments = pgTable('shipments', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  orderId: text('order_id').notNull().references(() => orders.id),
  carrier: text('carrier'),
  trackingNumber: text('tracking_number'),
  status: text('status').notNull().default(ShipmentStatus.PENDING),
  estimatedDelivery: timestamp('estimated_delivery'),
  actualDelivery: timestamp('actual_delivery'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  orderIdIdx: index('shipments_order_id_idx').on(table.orderId),
}))

/**
 * REVIEWS
 */
export const reviews = pgTable('reviews', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id),
  guestName: text('guest_name'),
  guestEmail: text('guest_email'),
  rating: integer('rating').notNull(),
  title: text('title'),
  content: text('content'),
  isVerified: boolean('is_verified').notNull().default(false),
  isApproved: boolean('is_approved').notNull().default(false),
  helpfulVotes: integer('helpful_votes').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  productIdIdx: index('reviews_product_id_idx').on(table.productId),
  userIdIdx: index('reviews_user_id_idx').on(table.userId),
}))

/**
 * GALLERY
 */
export const gallery = pgTable('gallery', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull().default(GalleryCategory.FACTORY),
  imageUrl: text('image_url').notNull(),
  cloudinaryPublicId: text('cloudinary_public_id').notNull(),
  altText: text('alt_text'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  tags: text('tags').array().default(sql`'{}'::text[]`),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  categoryIdx: index('gallery_category_idx').on(table.category),
  activeIdx: index('gallery_active_idx').on(table.isActive),
  sortOrderIdx: index('gallery_sort_order_idx').on(table.sortOrder),
}))

/**
 * RELATIONS
 */
export const userRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  addresses: many(addresses),
  carts: many(carts),
  orders: many(orders),
  accounts: many(accounts),
  sessions: many(sessions),
}))

export const profileRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}))

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const addressRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}))

export const categoryRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'category_parent'
  }),
  children: many(categories, { 
    relationName: 'category_parent'
  }),
  products: many(products),
}))

export const brandRelations = relations(brands, ({ many }) => ({
  products: many(products),
}))

export const productRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
  images: many(productImages),
  orderItems: many(orderItems),
  cartItems: many(cartItems),
}))

export const productVariantRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  inventoryAdjustments: many(inventoryAdjustments),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}))

export const productImageRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}))

export const inventoryAdjustmentRelations = relations(inventoryAdjustments, ({ one }) => ({
  productVariant: one(productVariants, {
    fields: [inventoryAdjustments.productVariantId],
    references: [productVariants.id],
  }),
}))

export const cartRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}))

export const cartItemRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.productVariantId],
    references: [productVariants.id],
  }),
}))

export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  cart: one(carts, {
    fields: [orders.cartId],
    references: [carts.id],
  }),
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id],
    relationName: 'shippingAddress',
  }),
  billingAddress: one(addresses, {
    fields: [orders.billingAddressId],
    references: [addresses.id],
    relationName: 'billingAddress',
  }),
  items: many(orderItems),
  payments: many(payments),
  shipments: many(shipments),
}))

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.productVariantId],
    references: [productVariants.id],
  }),
}))

export const paymentRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}))

export const shipmentRelations = relations(shipments, ({ one }) => ({
  order: one(orders, {
    fields: [shipments.orderId],
    references: [orders.id],
  }),
}))

export const reviewRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}))

// Site Settings table
export const siteSettings = pgTable('site_settings', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  type: text('type').notNull().default('STRING'),
  description: text('description'),
  category: text('category').default('general'),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  keyIdx: index('site_settings_key_idx').on(table.key),
  categoryIdx: index('site_settings_category_idx').on(table.category),
}))

export const siteSettingsRelations = relations(siteSettings, ({}) => ({}))

// User Activities table for tracking user behavior
export const userActivities = pgTable('user_activities', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').references(() => users.id),
  sessionId: text('session_id'),
  productId: text('product_id').references(() => products.id),
  activityType: text('activity_type').notNull(),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('user_activities_user_idx').on(table.userId),
  productIdx: index('user_activities_product_idx').on(table.productId),
  typeIdx: index('user_activities_type_idx').on(table.activityType),
  createdAtIdx: index('user_activities_created_at_idx').on(table.createdAt),
}))

export const userActivitiesRelations = relations(userActivities, ({ one }) => ({
  user: one(users, {
    fields: [userActivities.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [userActivities.productId],
    references: [products.id],
  }),
}))

// User Interests table for personalization
export const userInterests = pgTable('user_interests', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').references(() => users.id),
  categoryId: text('category_id').references(() => categories.id),
  score: numeric('score', { precision: 5, scale: 2 }).default('1'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userCategoryIdx: index('user_interests_user_category_idx').on(table.userId, table.categoryId),
  userIdx: index('user_interests_user_idx').on(table.userId),
  categoryIdx: index('user_interests_category_idx').on(table.categoryId),
}))

export const userInterestsRelations = relations(userInterests, ({ one }) => ({
  user: one(users, {
    fields: [userInterests.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [userInterests.categoryId],
    references: [categories.id],
  }),
}))