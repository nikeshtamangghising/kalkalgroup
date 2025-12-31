
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

async function inspect() {
    console.log('Inspecting columns...');
    // Note: accessing information_schema might be restricted via Supabase client if not enabled
    // But let's try calling rpc or just guessing by doing 'select *' and looking at keys of returned logic if possible
    // Or just try fetching one row with select('*')

    const { data: products, error: pError } = await supabase
        .from('products')
        .select('*')
        .limit(1);

    if (pError) {
        console.error('Products * error:', pError);
    } else if (products && products.length > 0) {
        console.log('Product columns:', Object.keys(products[0]));
    } else {
        console.log('Products empty, cannot inspect keys via select *');
    }

    const { data: orders, error: oError } = await supabase
        .from('orders')
        .select('*')
        .limit(1);

    if (oError) {
        console.error('Orders * error:', oError);
    } else if (orders && orders.length > 0) {
        console.log('Order columns:', Object.keys(orders[0]));
    } else {
        console.log('Orders empty, cannot inspect keys via select *');
    }
}

inspect();
