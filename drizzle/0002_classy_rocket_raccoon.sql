CREATE TABLE "carts" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"session_id" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" text NOT NULL,
	"provider" text NOT NULL,
	"provider_reference" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'NPR' NOT NULL,
	"captured_at" timestamp,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" text NOT NULL,
	"image_url" text NOT NULL,
	"alt_text" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" text NOT NULL,
	"sku" text NOT NULL,
	"attributes" json,
	"price" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'NPR' NOT NULL,
	"inventory_quantity" integer DEFAULT 0 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"gender" text,
	"date_of_birth" timestamp,
	"marketing_opt_in" boolean DEFAULT false NOT NULL,
	"preferences" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" text NOT NULL,
	"carrier" text,
	"tracking_number" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"shipped_at" timestamp,
	"delivered_at" timestamp,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "blog_posts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "discount_usage" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "discounts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "email_logs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "product_attributes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "product_relations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "reviews" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "site_settings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_activities" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_favorites" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_interests" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verificationtokens" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "blog_posts" CASCADE;--> statement-breakpoint
DROP TABLE "discount_usage" CASCADE;--> statement-breakpoint
DROP TABLE "discounts" CASCADE;--> statement-breakpoint
DROP TABLE "email_logs" CASCADE;--> statement-breakpoint
DROP TABLE "product_attributes" CASCADE;--> statement-breakpoint
DROP TABLE "product_relations" CASCADE;--> statement-breakpoint
DROP TABLE "reviews" CASCADE;--> statement-breakpoint
DROP TABLE "site_settings" CASCADE;--> statement-breakpoint
DROP TABLE "user_activities" CASCADE;--> statement-breakpoint
DROP TABLE "user_favorites" CASCADE;--> statement-breakpoint
DROP TABLE "user_interests" CASCADE;--> statement-breakpoint
DROP TABLE "verificationtokens" CASCADE;--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_trackingNumber_unique";--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_sku_unique";--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_sessionToken_unique";--> statement-breakpoint
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "addresses" DROP CONSTRAINT "addresses_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_productId_products_id_fk";
--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "categories_parentId_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_adjustments" DROP CONSTRAINT "inventory_adjustments_productId_products_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_adjustments" DROP CONSTRAINT "inventory_adjustments_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_orderId_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_productId_products_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_categoryId_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_brandId_brands_id_fk";
--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_users_id_fk";
--> statement-breakpoint
DROP INDEX "providerAccountIdIdx";--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "state" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ALTER COLUMN "quantity" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "price" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT';--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "provider_account_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "refresh_token" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "access_token" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "expires_at" integer;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "token_type" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "id_token" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "session_state" text;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "label" text;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "full_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "line1" text NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "line2" text;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "postal_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "is_default" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "cart_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "product_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "product_variant_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "unit_price" numeric(12, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "currency" text DEFAULT 'NPR' NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "parent_id" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_adjustments" ADD COLUMN "product_variant_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_adjustments" ADD COLUMN "quantity_change" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_adjustments" ADD COLUMN "reference_type" text;--> statement-breakpoint
ALTER TABLE "inventory_adjustments" ADD COLUMN "reference_id" text;--> statement-breakpoint
ALTER TABLE "inventory_adjustments" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "order_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "product_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "product_variant_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "name_snapshot" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "sku_snapshot" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "currency" text DEFAULT 'NPR' NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "metadata" json;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "order_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "cart_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_status" text DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "fulfillment_status" text DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "subtotal" numeric(12, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tax_total" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_total" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "discount_total" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "grand_total" numeric(12, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "currency" text DEFAULT 'NPR' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_address_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "billing_address_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "placed_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "status" text DEFAULT 'DRAFT' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "brand_id" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "category_id" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "thumbnail_url" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "base_price" numeric(12, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "seo_title" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "seo_description" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "session_token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "carts_session_idx" ON "carts" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_default_idx" ON "product_variants" USING btree ("product_id") WHERE "product_variants"."is_default" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "verification_tokens_identifier_token_idx" ON "verification_tokens" USING btree ("identifier","token");--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_address_id_addresses_id_fk" FOREIGN KEY ("shipping_address_id") REFERENCES "public"."addresses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_billing_address_id_addresses_id_fk" FOREIGN KEY ("billing_address_id") REFERENCES "public"."addresses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_idx" ON "accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "addresses_default_per_type_idx" ON "addresses" USING btree ("user_id","type") WHERE "addresses"."is_default" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_unique_idx" ON "cart_items" USING btree ("cart_id","product_variant_id");--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "userId";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "providerAccountId";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "refreshToken";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "accessToken";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "expiresAt";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "tokenType";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "idToken";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "sessionState";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "userId";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "firstName";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "lastName";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "company";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "addressLine1";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "addressLine2";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "postalCode";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "isDefault";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "addresses" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "brands" DROP COLUMN "logo";--> statement-breakpoint
ALTER TABLE "brands" DROP COLUMN "isActive";--> statement-breakpoint
ALTER TABLE "brands" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "brands" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "cart_items" DROP COLUMN "userId";--> statement-breakpoint
ALTER TABLE "cart_items" DROP COLUMN "sessionId";--> statement-breakpoint
ALTER TABLE "cart_items" DROP COLUMN "productId";--> statement-breakpoint
ALTER TABLE "cart_items" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "cart_items" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "parentId";--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "metaTitle";--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "metaDescription";--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "image";--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "isActive";--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "sortOrder";--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "inventory_adjustments" DROP COLUMN "productId";--> statement-breakpoint
ALTER TABLE "inventory_adjustments" DROP COLUMN "changeType";--> statement-breakpoint
ALTER TABLE "inventory_adjustments" DROP COLUMN "quantity";--> statement-breakpoint
ALTER TABLE "inventory_adjustments" DROP COLUMN "referenceId";--> statement-breakpoint
ALTER TABLE "inventory_adjustments" DROP COLUMN "userId";--> statement-breakpoint
ALTER TABLE "inventory_adjustments" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "inventory_adjustments" DROP COLUMN "notes";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "orderId";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "productId";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "userId";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "guestEmail";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "guestName";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "trackingNumber";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "total";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "stripePaymentIntentId";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "shippingAddress";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "isGuestOrder";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "shortDescription";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "price";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "purchasePrice";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "discountPrice";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "images";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "inventory";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "lowStockThreshold";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "sku";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "weight";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "dimensions";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "metaTitle";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "metaDescription";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "viewCount";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "orderCount";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "favoriteCount";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "cartCount";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "popularityScore";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "lastScoreUpdate";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "purchaseCount";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "ratingAvg";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "ratingCount";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "categoryId";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "brandId";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "isActive";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "isFeatured";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "isNewArrival";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "sessionToken";--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "userId";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "emailVerified";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "image";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "resetToken";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "resetTokenExpiry";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_number_unique" UNIQUE("order_number");--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token");