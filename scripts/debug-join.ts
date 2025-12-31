
import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function test() {
    console.log('Testing JOIN query...');

    // Supabase syntax for join
    const { data, error } = await supabase
        .from('products')
        .select('id, name, is_active, category_id, categories(id, name)')
        .eq('is_active', true)
        .limit(5);

    if (error) {
        console.error('Join Error:', JSON.stringify(error, null, 2));
    } else {
        console.log('Join Success:', data?.length, 'items');
        if (data && data.length > 0) console.log(data[0]);
    }
}

test();
