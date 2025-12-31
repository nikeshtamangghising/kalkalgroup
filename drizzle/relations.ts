import { relations } from "drizzle-orm/relations";
import { users, accounts, addresses, carts, cartItems, products, productVariants, inventoryAdjustments, orders, orderItems, sessions, payments, productImages, profiles, shipments, brands, categories, userActivities, userInterests } from "./schema";

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	accounts: many(accounts),
	addresses: many(addresses),
	orders: many(orders),
	sessions: many(sessions),
	carts: many(carts),
	profiles: many(profiles),
	userActivities: many(userActivities),
	userInterests: many(userInterests),
}));

export const addressesRelations = relations(addresses, ({one, many}) => ({
	user: one(users, {
		fields: [addresses.userId],
		references: [users.id]
	}),
	orders_shippingAddressId: many(orders, {
		relationName: "orders_shippingAddressId_addresses_id"
	}),
	orders_billingAddressId: many(orders, {
		relationName: "orders_billingAddressId_addresses_id"
	}),
}));

export const cartItemsRelations = relations(cartItems, ({one}) => ({
	cart: one(carts, {
		fields: [cartItems.cartId],
		references: [carts.id]
	}),
	product: one(products, {
		fields: [cartItems.productId],
		references: [products.id]
	}),
	productVariant: one(productVariants, {
		fields: [cartItems.productVariantId],
		references: [productVariants.id]
	}),
}));

export const cartsRelations = relations(carts, ({one, many}) => ({
	cartItems: many(cartItems),
	orders: many(orders),
	user: one(users, {
		fields: [carts.userId],
		references: [users.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	cartItems: many(cartItems),
	orderItems: many(orderItems),
	productImages: many(productImages),
	productVariants: many(productVariants),
	brand: one(brands, {
		fields: [products.brandId],
		references: [brands.id]
	}),
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id]
	}),
	userActivities: many(userActivities),
}));

export const productVariantsRelations = relations(productVariants, ({one, many}) => ({
	cartItems: many(cartItems),
	inventoryAdjustments: many(inventoryAdjustments),
	orderItems: many(orderItems),
	product: one(products, {
		fields: [productVariants.productId],
		references: [products.id]
	}),
}));

export const inventoryAdjustmentsRelations = relations(inventoryAdjustments, ({one}) => ({
	productVariant: one(productVariants, {
		fields: [inventoryAdjustments.productVariantId],
		references: [productVariants.id]
	}),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.id]
	}),
	productVariant: one(productVariants, {
		fields: [orderItems.productVariantId],
		references: [productVariants.id]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	orderItems: many(orderItems),
	user: one(users, {
		fields: [orders.userId],
		references: [users.id]
	}),
	cart: one(carts, {
		fields: [orders.cartId],
		references: [carts.id]
	}),
	address_shippingAddressId: one(addresses, {
		fields: [orders.shippingAddressId],
		references: [addresses.id],
		relationName: "orders_shippingAddressId_addresses_id"
	}),
	address_billingAddressId: one(addresses, {
		fields: [orders.billingAddressId],
		references: [addresses.id],
		relationName: "orders_billingAddressId_addresses_id"
	}),
	payments: many(payments),
	shipments: many(shipments),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	order: one(orders, {
		fields: [payments.orderId],
		references: [orders.id]
	}),
}));

export const productImagesRelations = relations(productImages, ({one}) => ({
	product: one(products, {
		fields: [productImages.productId],
		references: [products.id]
	}),
}));

export const profilesRelations = relations(profiles, ({one}) => ({
	user: one(users, {
		fields: [profiles.userId],
		references: [users.id]
	}),
}));

export const shipmentsRelations = relations(shipments, ({one}) => ({
	order: one(orders, {
		fields: [shipments.orderId],
		references: [orders.id]
	}),
}));

export const brandsRelations = relations(brands, ({many}) => ({
	products: many(products),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	products: many(products),
	userInterests: many(userInterests),
}));

export const userActivitiesRelations = relations(userActivities, ({one}) => ({
	user: one(users, {
		fields: [userActivities.userId],
		references: [users.id]
	}),
	product: one(products, {
		fields: [userActivities.productId],
		references: [products.id]
	}),
}));

export const userInterestsRelations = relations(userInterests, ({one}) => ({
	user: one(users, {
		fields: [userInterests.userId],
		references: [users.id]
	}),
	category: one(categories, {
		fields: [userInterests.categoryId],
		references: [categories.id]
	}),
}));