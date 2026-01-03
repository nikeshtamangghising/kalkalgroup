import 'server-only'
import { db } from '@/lib/db'
import { siteSettings } from './db/schema'
import { eq, ilike } from 'drizzle-orm'
import { logger } from '@/lib/backend/monitoring/logger'

export const SettingType = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  JSON: 'JSON',
} as const

export type SettingType = typeof SettingType[keyof typeof SettingType]

export interface SiteSettings {
  id: string
  key: string
  value: string
  type: string
  description?: string | null
  category?: string | null
  isPublic?: boolean
  createdAt: string
  updatedAt: string
}

export class SettingsRepository {
  static async initializeDefaults(): Promise<void> {
    // Initialize default settings
    const defaultSettings = [
      { key: 'free_shipping_threshold', value: '200', type: SettingType.NUMBER, category: 'shipping' },
      { key: 'shipping_rate', value: '200', type: SettingType.NUMBER, category: 'shipping' },
      { key: 'tax_rate', value: '0.13', type: SettingType.NUMBER, category: 'pricing' },
      { key: 'site_name', value: 'Kalkal Group', type: SettingType.STRING, category: 'general' },
      { key: 'site_description', value: 'Quality Products', type: SettingType.STRING, category: 'general' },
      
      // Contact information settings
      { key: 'contact_address', value: 'Suryavinayak Municipality, Ward No. 5, Bhaktapur', type: SettingType.STRING, category: 'contact' },
      { key: 'contact_phone_primary', value: '01-6619673', type: SettingType.STRING, category: 'contact' },
      { key: 'contact_phone_secondary', value: '9801354245', type: SettingType.STRING, category: 'contact' },
      { key: 'contact_phone_tertiary', value: '9801354246', type: SettingType.STRING, category: 'contact' },
      { key: 'contact_email', value: 'Kalkalgroup98@gmail.com', type: SettingType.STRING, category: 'contact' },
      { key: 'contact_business_hours', value: 'Open daily 9:00 AM - 5:00 PM', type: SettingType.STRING, category: 'contact' },
    ]

    for (const setting of defaultSettings) {
      const existing = await this.get(setting.key)
      if (!existing) {
        await this.set(setting.key, setting.value, setting.type as SettingType, undefined, setting.category)
      }
    }
  }

  // Get a setting by key
  static async get(key: string): Promise<SiteSettings | null> {
    try {
      const result = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, key))
        .limit(1)
      
      return result[0] as unknown as SiteSettings as unknown as SiteSettings || null
    } catch (error) {
      logger.error('Failed to get setting', { key, error })
      throw error
    }
  }

  // Get a setting value with default and type conversion
  static async getValue(key: string, defaultValue: any = null): Promise<any> {
    try {
      const setting = await this.get(key)
      if (!setting) return defaultValue

      // Convert based on type
      switch (setting.type) {
        case SettingType.NUMBER:
          return Number(setting.value)
        case SettingType.BOOLEAN:
          return setting.value === 'true'
        case SettingType.JSON:
          return JSON.parse(setting.value)
        default:
          return setting.value
      }
    } catch (error) {
      logger.error('Failed to get setting value', { key, defaultValue, error })
      return defaultValue
    }
  }

  // Set a setting value
  static async set(key: string, value: any, type?: SettingType, description?: string, category?: string, isPublic?: boolean): Promise<SiteSettings> {
    try {
      // Auto-detect type if not provided
      if (!type) {
        if (typeof value === 'number') type = SettingType.NUMBER
        else if (typeof value === 'boolean') type = SettingType.BOOLEAN
        else if (typeof value === 'object') type = SettingType.JSON
        else type = SettingType.STRING
      }

      // Convert value to string
      const stringValue = type === SettingType.JSON ? JSON.stringify(value) : String(value)

      // Check if exists
      const existing = await this.get(key)

      if (existing) {
        // Update existing
        const result = await db
          .update(siteSettings)
          .set({
            value: stringValue,
            type,
            description: description || existing.description,
            category: category || existing.category,
            isPublic: isPublic !== undefined ? isPublic : existing.isPublic,
            updatedAt: new Date(),
          })
          .where(eq(siteSettings.key, key))
          .returning()
        
        return result[0] as unknown as SiteSettings
      } else {
        // Create new
        const result = await db
          .insert(siteSettings)
          .values({
            key,
            value: stringValue,
            type,
            description,
            category: category || 'general',
            isPublic: isPublic || false,
          })
          .returning()
        
        return result[0] as unknown as SiteSettings
      }
    } catch (error) {
      logger.error('Failed to set setting', { key, value, type, error })
      throw error
    }
  }

  // Get all settings by category
  static async getByCategory(category: string): Promise<SiteSettings[]> {
    try {
      return (await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.category, category))
        .orderBy(siteSettings.key)) as unknown as SiteSettings[]
    } catch (error) {
      logger.error('Failed to get settings by category', { category, error })
      throw error
    }
  }

  // Get all public settings
  static async getPublicSettings(): Promise<Record<string, any>> {
    try {
      const settings = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.isPublic, true))

      const result: Record<string, any> = {}
      for (const setting of settings) {
        // Convert based on type
        switch (setting.type) {
          case SettingType.NUMBER:
            result[setting.key] = Number(setting.value)
            break
          case SettingType.BOOLEAN:
            result[setting.key] = setting.value === 'true'
            break
          case SettingType.JSON:
            result[setting.key] = JSON.parse(setting.value)
            break
          default:
            result[setting.key] = setting.value
        }
      }
      return result
    } catch (error) {
      logger.error('Failed to get public settings', { error })
      throw error
    }
  }

  // Delete a setting
  static async delete(key: string): Promise<boolean> {
    try {
      const result = await db.delete(siteSettings).where(eq(siteSettings.key, key)).returning()
      return result.length > 0
    } catch (error) {
      logger.error('Failed to delete setting', { key, error })
      throw error
    }
  }

  // Get all settings
  static async getAll(): Promise<SiteSettings[]> {
    try {
      return (await db
        .select()
        .from(siteSettings)
        .orderBy(siteSettings.category, siteSettings.key)) as unknown as SiteSettings[]
    } catch (error) {
      logger.error('Failed to get all settings', { error })
      throw error
    }
  }

  // Search settings by key
  static async search(query: string, limit: number = 50): Promise<SiteSettings[]> {
    try {
      return (await db
        .select()
        .from(siteSettings)
        .where(ilike(siteSettings.key, `%${query}%`))
        .limit(limit)
        .orderBy(siteSettings.key)) as unknown as SiteSettings[]
    } catch (error) {
      logger.error('Failed to search settings', { query, error })
      throw error
    }
  }
}
