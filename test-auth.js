const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testAuthFlow() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found');
    return;
  }

  const client = postgres(connectionString, {
    ssl: 'require',
    max: 1,
  });

  try {
    console.log('🔍 Testing authentication flow...');
    
    // 1. Check admin user exists
    const adminUser = await client`
      SELECT id, email, name, role, password_hash 
      FROM users 
      WHERE email = 'admin@kalkal.com'
    `;
    
    if (adminUser.length === 0) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', adminUser[0].email);
    
    // 2. Test password verification
    const user = adminUser[0];
    const testPassword = 'admin123';
    const isPasswordValid = await bcrypt.compare(testPassword, user.password_hash);
    
    console.log('🔐 Password test result:', isPasswordValid ? '✅ Valid' : '❌ Invalid');
    
    if (!isPasswordValid) {
      console.log('🔧 Regenerating password hash...');
      const newPasswordHash = await bcrypt.hash(testPassword, 10);
      await client`
        UPDATE users 
        SET password_hash = ${newPasswordHash}, updated_at = NOW()
        WHERE email = 'admin@kalkal.com'
      `;
      console.log('✅ Password hash updated');
      
      // Test again
      const isValidAgain = await bcrypt.compare(testPassword, newPasswordHash);
      console.log('🔐 New password test:', isValidAgain ? '✅ Valid' : '❌ Invalid');
    }
    
    // 3. Check environment variables
    console.log('\n🔧 Environment Variables:');
    console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing');
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '❌ Missing');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
    
    // 4. Recommendations
    console.log('\n📋 Troubleshooting Steps:');
    console.log('1. For Vercel deployment, set NEXTAUTH_URL to: https://kalkalgroup.vercel.app');
    console.log('2. Ensure NEXTAUTH_SECRET is the same in development and production');
    console.log('3. Check Vercel logs for detailed error messages');
    console.log('4. Try clearing browser cookies and cache');
    console.log('5. Verify the admin user credentials:');
    console.log('   - Email: admin@kalkal.com');
    console.log('   - Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

testAuthFlow();
