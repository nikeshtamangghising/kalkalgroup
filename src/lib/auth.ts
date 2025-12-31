import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getUserByEmail } from './db-utils'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  // Note: PrismaAdapter not compatible with CredentialsProvider + JWT sessions
  // adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null
        }

        try {
          console.log('🔍 Looking up user:', credentials.email);
          const user = await getUserByEmail(credentials.email)

          if (!user) {
            console.log('❌ User not found:', credentials.email);
            return null
          }

          console.log('✅ User found:', user.email, 'Role:', user.role);

          // Check password
          let isPasswordValid = false

          // Support both legacy `password` column and new `password_hash`
          const passwordHash =
            user.passwordHash ??
            (user as Record<string, any>)?.password_hash ??
            (user as Record<string, any>)?.password

          if (passwordHash) {
            // Compare hashed password
            console.log('🔐 Comparing password...');
            isPasswordValid = await bcrypt.compare(credentials.password, passwordHash)
            console.log('🔐 Password valid:', isPasswordValid);
          } else {
            console.log('⚠️  No password hash found for user');
            // For demo users without hashed passwords, use simple check
            isPasswordValid = credentials.password === 'password'
          }

          if (!isPasswordValid) {
            console.log('❌ Invalid password');
            return null
          }

          console.log('✅ Authentication successful!');
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('❌ Auth error:', error);
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string || token.sub!
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development',
}

// Helper function to get server session
export async function getServerSession() {
  const { getServerSession } = await import('next-auth')
  return getServerSession(authOptions)
}

// Helper function to check if user is admin
export async function isAdmin() {
  const session = await getServerSession()
  return session?.user?.role === 'ADMIN'
}

// Helper function to check if user is authenticated
export async function isAuthenticated() {
  const session = await getServerSession()
  return !!session?.user
}