import 'dotenv/config'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function main() {
  if (!db) {
    console.error('Database not available - DATABASE_URL not set')
    process.exit(1)
  }
  
  const email = process.argv[2] || 'admin@kalkal.com'
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
  console.log(result[0])
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err)
  process.exit(1)
})
