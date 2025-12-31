import 'server-only'
import { db } from '@/lib/db';
import { carts, cartItems, products, productVariants, categories } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ActivityTracker } from './activity-tracker';
import type { Product, Category } from '@/types'

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  productVariantId?: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: Product & { category?: Category | null };
  variant?: {
    id: string;
    productId: string;
    sku: string | null;
    price: number | null;
    currency: string | null;
    attributes: any;
    inventoryQuantity: number;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}

export interface AddToCartData {
  productId: string;
  productVariantId?: string;
  quantity?: number;
  userId?: string;
  sessionId?: string;
}

// Helper function to transform joined cart item data to CartItem format
function transformCartItem(item: {
  cartItem: typeof cartItems.$inferSelect;
  product: typeof products.$inferSelect | null;
  category: typeof categories.$inferSelect | null;
  variant: typeof productVariants.$inferSelect | null;
}): CartItem | null {
  if (!item.product) {
    return null;
  }
  
  return {
    id: item.cartItem.id,
    cartId: item.cartItem.cartId,
    productId: item.cartItem.productId,
    productVariantId: item.cartItem.productVariantId,
    quantity: item.cartItem.quantity,
    createdAt: item.cartItem.createdAt,
    updatedAt: item.cartItem.updatedAt,
    product: {
      ...item.product,
      category: item.category || null,
    } as Product & { category?: Category | null },
    variant: item.variant ? {
      id: item.variant.id,
      productId: item.variant.productId,
      sku: item.variant.sku,
      price: typeof item.variant.price === 'string' ? parseFloat(item.variant.price) : (item.variant.price || null),
      currency: item.variant.currency,
      attributes: item.variant.attributes,
      inventoryQuantity: item.variant.inventoryQuantity,
      isDefault: item.variant.isDefault,
      createdAt: item.variant.createdAt,
      updatedAt: item.variant.updatedAt,
    } : null,
  };
}

export class CartRepository {
  /**
   * Add item to cart
   */
  static async addToCart(data: AddToCartData): Promise<CartItem> {
    const { productId, productVariantId, quantity = 1, userId, sessionId } = data;

    if (!userId && !sessionId) {
      throw new Error('Either userId or sessionId must be provided');
    }

    // Get or create cart
    let cartId: string;
    if (userId) {
      const [userCart] = await db.select({ id: carts.id })
        .from(carts)
        .where(eq(carts.userId, userId))
        .limit(1);
      
      if (userCart) {
        cartId = userCart.id;
      } else {
        const [newCart] = await db.insert(carts)
          .values({ userId })
          .returning();
        cartId = newCart.id;
      }
    } else {
      const [sessionCart] = await db.select({ id: carts.id })
        .from(carts)
        .where(eq(carts.sessionId, sessionId!))
        .limit(1);
      
      if (sessionCart) {
        cartId = sessionCart.id;
      } else {
        const [newCart] = await db.insert(carts)
          .values({ sessionId })
          .returning();
        cartId = newCart.id;
      }
    }

    // Check if product exists and is available
    const productResult = await db.select({
      id: products.id,
      inventory: products.inventory,
      isActive: products.isActive,
      name: products.name,
    })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
    
    const product = productResult[0];

    if (!product) {
      throw new Error('Product not found');
    }

    if (!product.isActive) {
      throw new Error('Product is not available');
    }

    if (product.inventory < quantity) {
      throw new Error(`Only ${product.inventory} items available in stock`);
    }

    try {
      // Check if item already exists in cart
      const whereConditions = [
        eq(cartItems.cartId, cartId),
        eq(cartItems.productId, productId)
      ];
      if (productVariantId) {
        whereConditions.push(eq(cartItems.productVariantId, productVariantId));
      }

      const existingItems = await db.select()
        .from(cartItems)
        .where(and(...whereConditions))
        .limit(1);
      
      const existingItem = existingItems[0];
      let result;

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        
        if (product.inventory < newQuantity) {
          throw new Error(`Cannot add ${quantity} items. Only ${product.inventory - existingItem.quantity} more can be added`);
        }

        await db.update(cartItems)
          .set({ 
            quantity: newQuantity,
            updatedAt: new Date(),
          })
          .where(eq(cartItems.id, existingItem.id));
        
        // Fetch with product, category, and variant
        const joinedResult = await db.select({
          cartItem: cartItems,
          product: products,
          category: categories,
          variant: productVariants,
        })
          .from(cartItems)
          .leftJoin(products, eq(cartItems.productId, products.id))
          .leftJoin(categories, eq(products.categoryId, categories.id))
          .leftJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
          .where(eq(cartItems.id, existingItem.id))
          .limit(1);
        
        result = joinedResult[0] ? transformCartItem(joinedResult[0]) : null;
      } else {
        // Create new cart item
        const insertData: any = {
          cartId,
          productId,
          quantity,
        };
        if (productVariantId) insertData.productVariantId = productVariantId;

        const [newItem] = await db.insert(cartItems)
          .values(insertData)
          .returning();
        
        // Fetch with product, category, and variant
        const joinedResult = await db.select({
          cartItem: cartItems,
          product: products,
          category: categories,
          variant: productVariants,
        })
          .from(cartItems)
          .leftJoin(products, eq(cartItems.productId, products.id))
          .leftJoin(categories, eq(products.categoryId, categories.id))
          .leftJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
          .where(eq(cartItems.id, newItem.id))
          .limit(1);
        
        result = joinedResult[0] ? transformCartItem(joinedResult[0]) : null;
      }

      // Track activity
      if (userId) {
        await ActivityTracker.trackActivity({
          userId,
          productId,
          activityType: 'CART_ADD',
          metadata: {
            quantity,
            cartItemId: result?.id,
          }
        })
      }

      if (!result) {
        throw new Error('Failed to load cart item after insert/update');
      }

      return result as CartItem;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  }

  /**
   * Get cart items for user or session
   */
  static async getCartItems(userId?: string, sessionId?: string): Promise<CartItem[]> {
    if (!userId && !sessionId) {
      throw new Error('Either userId or sessionId must be provided');
    }

    // Get cart ID
    let cartId: string;
    if (userId) {
      const [userCart] = await db.select({ id: carts.id })
        .from(carts)
        .where(eq(carts.userId, userId))
        .limit(1);
      
      if (!userCart) return [];
      cartId = userCart.id;
    } else {
      const [sessionCart] = await db.select({ id: carts.id })
        .from(carts)
        .where(eq(carts.sessionId, sessionId!))
        .limit(1);
      
      if (!sessionCart) return [];
      cartId = sessionCart.id;
    }

    // Fetch cart items with joins
    const items = await db.select({
      cartItem: cartItems,
      product: products,
      category: categories,
      variant: productVariants,
    })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
      .where(eq(cartItems.cartId, cartId))
      .orderBy(desc(cartItems.createdAt));

    // Transform to CartItem format
    return items.map(transformCartItem).filter((item): item is CartItem => item !== null);
  }

  /**
   * Update cart item quantity
   */
  static async updateQuantity(
    cartItemId: string,
    quantity: number,
    userId?: string,
    sessionId?: string
  ): Promise<CartItem> {
    if (quantity <= 0) {
      await this.removeFromCart(cartItemId, userId, sessionId);
      throw new Error('Cart item removed due to zero quantity');
    }

    // Get cart item with product to check inventory
    const cartItemResult = await db.select({
      cartItem: cartItems,
      product: products,
      category: categories,
      variant: productVariants,
    })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
      .where(eq(cartItems.id, cartItemId))
      .limit(1);
    
    const cartItem = cartItemResult[0] ? transformCartItem(cartItemResult[0]) : null;
    
    if (!cartItem) {
      throw new Error('Cart item not found');
    }
    
    // Update quantity
    await db.update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, cartItemId));
    
    // Fetch updated item
    const updatedResult = await db.select({
      cartItem: cartItems,
      product: products,
      category: categories,
      variant: productVariants,
    })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
      .where(eq(cartItems.id, cartItemId))
      .limit(1);
    
    const result = updatedResult[0] ? transformCartItem(updatedResult[0]) : null;
    
    if (!result) {
      throw new Error('Failed to fetch updated cart item');
    }
    
    return result;
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(
    cartItemId: string,
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    // Verify cart ownership
    const cartItemResult = await db.select({
      cartItem: cartItems,
      cart: carts,
    })
      .from(cartItems)
      .leftJoin(carts, eq(cartItems.cartId, carts.id))
      .where(eq(cartItems.id, cartItemId))
      .limit(1);
    
    const cartItem = cartItemResult[0];
    
    if (!cartItem) {
      throw new Error('Cart item not found');
    }
    
    // Verify ownership
    if (userId && cartItem.cart?.userId !== userId) {
      throw new Error('Unauthorized');
    }
    if (sessionId && cartItem.cart?.sessionId !== sessionId) {
      throw new Error('Unauthorized');
    }
    
    // Remove item
    await db.delete(cartItems)
      .where(eq(cartItems.id, cartItemId));
  }

  /**
   * Get cart item by ID
   */
  static async getCartItemById(cartItemId: string): Promise<CartItem | null> {
    const cartItemResult = await db.select({
      cartItem: cartItems,
      product: products,
      category: categories,
      variant: productVariants,
    })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
      .where(eq(cartItems.id, cartItemId))
      .limit(1);
    
    const cartItem = cartItemResult[0] ? transformCartItem(cartItemResult[0]) : null;

    if (!cartItem) {
      return null;
    }

    return cartItem;
  }

  /**
   * Clear cart for user or session
   */
  static async clearCart(userId?: string, sessionId?: string): Promise<void> {
    if (!userId && !sessionId) {
      throw new Error('Either userId or sessionId must be provided');
    }

    // Get cart ID
    let cartId: string;
    if (userId) {
      const [userCart] = await db.select({ id: carts.id })
        .from(carts)
        .where(eq(carts.userId, userId))
        .limit(1);
      
      if (!userCart) return;
      cartId = userCart.id;
    } else {
      const [sessionCart] = await db.select({ id: carts.id })
        .from(carts)
        .where(eq(carts.sessionId, sessionId!))
        .limit(1);
      
      if (!sessionCart) return;
      cartId = sessionCart.id;
    }

    await db.delete(cartItems)
      .where(eq(cartItems.cartId, cartId));

    if (userId) {
      await ActivityTracker.trackActivity({
        userId,
        activityType: 'CART_CLEAR',
        metadata: { cartId },
      })
    }
  }

  /**
   * Get cart total
   */
  static async getCartTotal(userId?: string, sessionId?: string): Promise<number> {
    const items = await this.getCartItems(userId, sessionId);
    
    return items.reduce((total, item) => {
      const variantPrice = typeof item.variant?.price === 'string' ? parseFloat(item.variant.price) : (item.variant?.price ?? 0);
      const productPrice = typeof item.product.price === 'string' ? parseFloat(item.product.price) : (item.product.price ?? 0);
      const price = variantPrice || productPrice;
      return total + (price * item.quantity);
    }, 0);
  }
}

export default CartRepository;