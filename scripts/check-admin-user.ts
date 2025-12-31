import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminUser() {
    console.log('🔍 Checking for admin user...\n');

    try {
        // Check if admin user exists
        const { data: users, error } = await supabase
            .from('users')
            .select('email, name, role')
            .eq('email', 'admin@kalkal.com');

        if (error) {
            console.error('❌ Error querying users table:', error.message);
            console.log('\n💡 This likely means the users table doesn\'t exist or RLS is blocking access.');
            console.log('   You need to run the SQL in Supabase SQL Editor first!\n');
            process.exit(1);
        }

        if (!users || users.length === 0) {
            console.log('❌ Admin user NOT found in database!\n');
            console.log('📋 Next steps:');
            console.log('1. Go to: https://supabase.com/dashboard/project/crojjqwgjfkticukytmg/editor');
            console.log('2. Click SQL Editor → New query');
            console.log('3. Copy and run the SQL from: scripts/create-admin.sql\n');
            process.exit(1);
        }

        console.log('✅ Admin user found!');
        console.log('   Email:', users[0].email);
        console.log('   Name:', users[0].name);
        console.log('   Role:', users[0].role);
        console.log('\n✅ Admin user exists in database!');
        console.log('   If login still fails, check:');
        console.log('   1. Password is exactly: admin123');
        console.log('   2. NextAuth configuration is correct');
        console.log('   3. Check server logs for more details\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    }
}

checkAdminUser();
