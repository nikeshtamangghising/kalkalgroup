
import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Testing Products query...');

    // Since we fixed schema.ts, Drizzle would generate snake_case columns.
    // But here we are using Supabase client to verify the DB columns and data access.
    // Now we should be able to query correct columns.

    const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, discount_price, category_id, is_active')
        .limit(3);

    if (productsError) {
        console.error('Products Error:', JSON.stringify(productsError, undefined, 2));
    } else {
        console.log('Products Success:', products?.length, 'items');
    }

    console.log('Testing Categories query...');
    const { data: categories, error: catsError } = await supabase
        .from('categories')
        .select('id, name, parent_id, is_active')
        .limit(3);

    if (catsError) {
        console.error('Categories Error:', JSON.stringify(catsError, undefined, 2));
    } else {
        console.log('Categories Success:', categories?.length, 'items');
    }
}

test();
