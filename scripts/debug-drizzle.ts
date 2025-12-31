
import dotenv from 'dotenv';
dotenv.config();

// We need to shim the alias if tsx doesn't handle it by default, 
// but let's try relative imports.
// Note: We need to make sure we don't import Next.js specific things that fail in node script.
// db/index.ts imports postgres and schema. schema imports drizzle-orm. Should be fine.

import { db } from '../src/lib/db/index';
import { products, categories } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function test() {
    console.log('Testing Drizzle Query...');
    try {
        const result = await db.select({
            id: products.id,
            name: products.name,
            basePrice: products.basePrice,
            currency: products.currency,
            status: products.status,
            categoryId: products.categoryId,
            category: {
                id: categories.id,
                name: categories.name
            }
        })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .where(eq(products.status, 'ACTIVE'))
            .limit(5);

        console.log('Success!', result);
    } catch (err: any) {
        console.error('Drizzle Error:', err);
        if (err.cause) console.error('Cause:', err.cause);
    }
    process.exit(0);
}

test();
