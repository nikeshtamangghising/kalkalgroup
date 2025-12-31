import { eq, sql } from 'drizzle-orm'
import 'server-only'
import { db } from './db'
import { logger } from '@/lib/backend/monitoring/logger'
import { siteSettings } from './db/schema'

export interface ShippingSettings {
  freeShippingThreshold: number
  currency: string
  shippingCost: number
  expressShippingCost?: number
}

export interface SiteSettingsData {
  shipping: ShippingSettings
  tax: {
    rate: number
    included: boolean
  }
  currency: {
    default: string
    symbol: string
    position: 'before' | 'after'
  }
  policies: {
    returnDays: number
    warrantyDays: number
  }
}

type SettingValue = string | number | boolean | Record<string, unknown> | null
type WritableSettings = SiteSettingsData & Record<string, unknown>

// Default settings fallback
const DEFAULT_SETTINGS: SiteSettingsData = {
  shipping: {
    freeShippingThreshold: 999,
    currency: 'NPR',
    shippingCost: 199,
    expressShippingCost: 499,
  },
  tax: {
    rate: 0.1,
    included: false,
  },
  currency: {
    default: 'NPR',
    symbol: 'Rs.',
    position: 'before',
  },
  policies: {
    returnDays: 30,
    warrantyDays: 365,
  },
}

// Cache for settings
let settingsCache: SiteSettingsData | null = null
let cacheExpiry: Date | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const cloneDefaultSettings = (): WritableSettings =>
  JSON.parse(JSON.stringify(DEFAULT_SETTINGS)) as WritableSettings

const parseSettingValue = (type: string, rawValue: string): SettingValue => {
  switch (type) {
    case 'NUMBER':
      return parseFloat(rawValue)
    case 'BOOLEAN':
      return rawValue === 'true'
    case 'JSON':
      try {
        return JSON.parse(rawValue) as Record<string, unknown>
      } catch {
        return null
      }
    default:
      return rawValue
  }
}

export async function getSiteSettings(): Promise<SiteSettingsData> {
  // Check cache first
  if (settingsCache && cacheExpiry && new Date() < cacheExpiry) {
    return settingsCache
  }

  try {
    const settings = await db.select().from(siteSettings).where(eq(siteSettings.isPublic, true))

    const siteSettingsData: WritableSettings = cloneDefaultSettings()

    for (const setting of settings) {
      const keys = setting.key.split('.')
      if (keys.length === 0) continue

      let current: Record<string, unknown> = siteSettingsData

      for (let i = 0; i < keys.length - 1; i++) {
        const segment = keys[i]
        const next = current[segment]

        if (typeof next !== 'object' || next === null) {
          current[segment] = {}
        }

        current = current[segment] as Record<string, unknown>
      }

      const lastKey = keys[keys.length - 1]
      current[lastKey] = parseSettingValue(setting.type, setting.value)
    }

    settingsCache = siteSettingsData
    cacheExpiry = new Date(Date.now() + CACHE_DURATION)

    return siteSettingsData
  } catch (error) {
    logger.error('Error fetching site settings', { error })
    return DEFAULT_SETTINGS
  }
}

export async function getShippingSettings(): Promise<ShippingSettings> {
  const settings = await getSiteSettings()
  return settings.shipping
}

export async function updateSiteSetting(
  key: string,
  value: SettingValue,
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' = 'STRING'
) {
  try {
    const stringValue = type === 'JSON' ? JSON.stringify(value) : String(value ?? '')

    await db.insert(siteSettings).values({
      key,
      value: stringValue,
      type,
      isPublic: true,
      category: key.includes('shipping') ? 'shipping' : 'general',
      description: `Default ${key.replace('.', ' ')} setting`,
    }).onConflictDoUpdate({
      target: siteSettings.key,
      set: {
        value: stringValue,
        type,
        updatedAt: new Date(),
      },
    })

    settingsCache = null
    cacheExpiry = null
  } catch (error) {
    logger.error('Error updating site setting', { error })
    throw error
  }
}

// Initialize default settings if they don't exist
export async function initializeDefaultSettings() {
  try {
    const existingSettings = await db.select({ count: sql`COUNT(*)` }).from(siteSettings);
    
    if (Number(existingSettings[0].count) === 0) {
      const settingsToCreate = [
        // Shipping settings
        { key: 'shipping.freeShippingThreshold', value: '999', type: 'NUMBER' as const, category: 'shipping' },
        { key: 'shipping.currency', value: 'NPR', type: 'STRING' as const, category: 'shipping' },
        { key: 'shipping.shippingCost', value: '199', type: 'NUMBER' as const, category: 'shipping' },
        { key: 'shipping.expressShippingCost', value: '499', type: 'NUMBER' as const, category: 'shipping' },
        
        // Currency settings
        { key: 'currency.default', value: 'NPR', type: 'STRING' as const, category: 'currency' },
        { key: 'currency.symbol', value: 'Rs.', type: 'STRING' as const, category: 'currency' },
        { key: 'currency.position', value: 'before', type: 'STRING' as const, category: 'currency' },
        
        // Tax settings
        { key: 'tax.rate', value: '0.1', type: 'NUMBER' as const, category: 'tax' },
        { key: 'tax.included', value: 'false', type: 'BOOLEAN' as const, category: 'tax' },
        
        // Policy settings
        { key: 'policies.returnDays', value: '30', type: 'NUMBER' as const, category: 'policies' },
        { key: 'policies.warrantyDays', value: '365', type: 'NUMBER' as const, category: 'policies' },
      ]

      for (const setting of settingsToCreate) {
        await db.insert(siteSettings).values({
          ...setting,
          isPublic: true,
        })
      }
    }
  } catch (error) {
    logger.error('Error initializing default settings', { error })
  }
}