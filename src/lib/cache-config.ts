/**
 * Centralized caching configuration for the application
 * Defines cache TTLs and strategies for different data types
 */

export const CACHE_CONFIG = {
    // Product data caching
    products: {
        list: 5 * 60, // 5 minutes for product lists
        detail: 10 * 60, // 10 minutes for product details
        featured: 15 * 60, // 15 minutes for featured products
        search: 2 * 60, // 2 minutes for search results
    },

    // Category data caching
    categories: {
        list: 30 * 60, // 30 minutes for category lists
        detail: 30 * 60, // 30 minutes for category details
        tree: 60 * 60, // 1 hour for category tree
    },

    // User data caching
    user: {
        profile: 5 * 60, // 5 minutes for user profile
        cart: 1 * 60, // 1 minute for cart (frequently updated)
        orders: 10 * 60, // 10 minutes for order history
    },

    // Static data caching
    static: {
        settings: 60 * 60, // 1 hour for site settings
        homepage: 10 * 60, // 10 minutes for homepage data
        brands: 30 * 60, // 30 minutes for brands
    },

    // Analytics and metrics
    analytics: {
        productMetrics: 5 * 60, // 5 minutes for product metrics
        dashboardStats: 2 * 60, // 2 minutes for admin dashboard
    },
} as const;

/**
 * Cache tags for invalidation
 */
export const CACHE_TAGS = {
    products: 'products',
    product: (id: string) => `product-${id}`,
    categories: 'categories',
    category: (id: string) => `category-${id}`,
    user: (id: string) => `user-${id}`,
    cart: (userId: string) => `cart-${userId}`,
    orders: (userId: string) => `orders-${userId}`,
    settings: 'settings',
} as const;

/**
 * Cache key generators
 */
export const CACHE_KEYS = {
    productList: (params: Record<string, unknown>) =>
        `products:list:${JSON.stringify(params)}`,
    productDetail: (id: string) => `products:detail:${id}`,
    categoryList: () => 'categories:list',
    categoryDetail: (id: string) => `categories:detail:${id}`,
    userProfile: (id: string) => `user:profile:${id}`,
    userCart: (userId: string) => `user:cart:${userId}`,
    siteSettings: () => 'site:settings',
} as const;

/**
 * Cache warming strategy
 * These are critical data that should be pre-cached on application startup
 */
export const CACHE_WARMING_KEYS = [
    'categories:list',
    'site:settings',
    'products:featured',
] as const;

/**
 * Stale-while-revalidate configuration
 * Serve stale content while fetching fresh data in the background
 */
export const SWR_CONFIG = {
    products: {
        staleTime: 60, // Serve stale for 60 seconds
        revalidateTime: 5 * 60, // Revalidate every 5 minutes
    },
    categories: {
        staleTime: 5 * 60, // Serve stale for 5 minutes
        revalidateTime: 30 * 60, // Revalidate every 30 minutes
    },
} as const;
