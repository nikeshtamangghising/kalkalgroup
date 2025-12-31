import 'server-only'
import { db } from '@/lib/db'
import { userActivities } from './db/schema'
import { eq } from 'drizzle-orm'

export function createViewTracker(_userId?: string, _sessionId?: string) {
  return {
    observe: (_element: Element) => {
      // TODO: Implement actual view tracking
      console.log('View tracking not implemented')
    },
    disconnect: () => {
      // TODO: Implement actual disconnect
      console.log('Disconnect not implemented')
    }
  }
}

export interface ActivityData {
  userId?: string
  sessionId?: string
  productId?: string
  activityType: 'VIEW' | 'CART_ADD' | 'CART_UPDATE' | 'CART_REMOVE' | 'CART_CLEAR' | 'ORDER'
  metadata?: Record<string, any>
}

export class ActivityTracker {
  static async trackActivity(data: ActivityData) {
    try {
      const activity = {
        userId: data.userId || null,
        sessionId: data.sessionId || null,
        productId: data.productId || null,
        activityType: data.activityType,
        metadata: data.metadata || {},
        createdAt: new Date(),
      }

      await db.insert(userActivities).values(activity)
    } catch (error) {
      console.error('Failed to track activity:', error)
      // Don't throw errors for activity tracking to avoid breaking main functionality
    }
  }

  static async getUserActivities(userId: string, limit: number = 50) {
    try {
      return await db
        .select()
        .from(userActivities)
        .where(eq(userActivities.userId, userId))
        .orderBy(userActivities.createdAt)
        .limit(limit)
    } catch (error) {
      console.error('Failed to get user activities:', error)
      return []
    }
  }

  static async getSessionActivities(sessionId: string, limit: number = 50) {
    try {
      return await db
        .select()
        .from(userActivities)
        .where(eq(userActivities.sessionId, sessionId))
        .orderBy(userActivities.createdAt)
        .limit(limit)
    } catch (error) {
      console.error('Failed to get session activities:', error)
      return []
    }
  }

  static async getProductViews(productId: string, limit: number = 100) {
    try {
      return await db
        .select()
        .from(userActivities)
        .where(
          eq(userActivities.productId, productId)
        )
        .orderBy(userActivities.createdAt)
        .limit(limit)
    } catch (error) {
      console.error('Failed to get product views:', error)
      return []
    }
  }
}
