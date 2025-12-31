const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Simple schema for users table
const users = {
  id: 'text',
  email: 'text',
  name: 'text',
  passwordHash: 'password_hash',
  role: 'text'
};

async function checkAdminUser() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment variables');
    return;
  }

  console.log('✅ DATABASE_URL found');

  const client = postgres(connectionString, {
    ssl: 'require',
    max: 1,
  });

  const db = drizzle(client);

  try {
    console.log('🔍 Checking for admin user...');
    
    // Check if admin user exists
    const result = await client`
      SELECT id, email, name, role, password_hash 
      FROM users 
      WHERE email = 'admin@kalkal.com'
    `;
    
    if (result.length === 0) {
      console.log('❌ Admin user not found');
      
      // Create admin user
      console.log('🔧 Creating admin user...');
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      await client`
        INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at)
        VALUES (gen_random_uuid(), 'admin@kalkal.com', 'Admin User', ${passwordHash}, 'ADMIN', NOW(), NOW())
      `;
      
      console.log('✅ Admin user created successfully!');
      console.log('   Email: admin@kalkal.com');
      console.log('   Password: admin123');
    } else {
      const user = result[0];
      console.log('✅ Admin user found:');
      console.log('   Email:', user.email);
      console.log('   Name:', user.name);
      console.log('   Role:', user.role);
      console.log('   Has password hash:', !!user.password_hash);
      
      // Verify password
      if (user.password_hash) {
        const isValid = await bcrypt.compare('admin123', user.password_hash);
        console.log('   Password valid:', isValid);
        
        if (!isValid) {
          console.log('🔧 Updating password...');
          const newPasswordHash = await bcrypt.hash('admin123', 10);
          await client`
            UPDATE users 
            SET password_hash = ${newPasswordHash}, updated_at = NOW()
            WHERE email = 'admin@kalkal.com'
          `;
          console.log('✅ Password updated');
        }
      }
    }
    
    // Test database connection
    await client`SELECT 1`;
    console.log('✅ Database connection successful');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Details:', error);
  } finally {
    await client.end();
  }
}

checkAdminUser();
