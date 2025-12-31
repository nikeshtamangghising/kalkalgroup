import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../src/lib/db/schema'

// Load environment variables first
config()

async function debugCategories() {
  try {
    console.log('🔍 Debugging categories in database...')
    console.log('📊 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found in environment variables')
      return
    }

    // Create a fresh database connection
    const client = postgres(process.env.DATABASE_URL, {
      ssl: 'require',
      max: 1,
      prepare: false,
    })
    
    const db = drizzle(client, { schema })
    
    // Check direct database connection
    const directCategories = await db.select().from(schema.categories)
    console.log(`📊 Found ${directCategories.length} categories in database:`)
    
    if (directCategories.length > 0) {
      directCategories.forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.name} (${cat.slug}) - Active: ${cat.is_active}`)
      })
    } else {
      console.log('❌ No categories found in database!')
      console.log('💡 You may need to create some categories first.')
    }

    // Close the connection
    await client.end()

  } catch (error) {
    console.error('❌ Database connection error:', error)
  }
}

debugCategories().then(() => {
  console.log('✅ Debug complete')
  process.exit(0)
}).catch((error) => {
  console.error('❌ Debug failed:', error)
  process.exit(1)
})