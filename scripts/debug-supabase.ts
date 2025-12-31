
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
    console.log('Testing Orders query (Fixed)...');
    const ordersQuery = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .range(0, 4)
        .order('created_at', { ascending: false });

    const { data: orders, count, error: ordersError } = await ordersQuery;

    if (ordersError) {
        console.error('Orders Query Error:', JSON.stringify(ordersError, null, 2));
    } else {
        console.log('Orders Query Success:', orders?.length, 'items', count ? `(Total: ${count})` : '');
    }

    console.log('Testing Low Stock query (Fixed)...');
    const productsQuery = supabase
        .from('products')
        .select('id, name, inventory, lowStockThreshold:low_stock_threshold, price')
        .eq('is_active', true)
        .order('inventory', { ascending: true });

    const { data: products, error: productsError } = await productsQuery;

    if (productsError) {
        console.error('Products Query Error:', JSON.stringify(productsError, null, 2));
    } else {
        console.log('Products Query Success:', products?.length, 'items');
    }
}

test();
