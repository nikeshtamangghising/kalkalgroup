import 'server-only'
import { db, checkDatabaseConnection } from '@/lib/db'

// Database health check object
export const dbHealth = {
  async getStatus() {
    const isHealthy = await checkDatabaseConnection()
    return {
      healthy: isHealthy,
      timestamp: new Date().toISOString()
    }
  }
}

// Re-export db for convenience
export { db }

