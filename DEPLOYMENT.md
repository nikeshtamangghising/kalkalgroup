# Kalkal Group - Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Database**: Supabase PostgreSQL database configured
4. **Environment Variables**: All required environment variables ready

## Environment Variables Setup

### Required Environment Variables

Copy these to your Vercel project settings:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database?pgbouncer=true

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=https://your-domain.vercel.app

# Email
RESEND_API_KEY=your-resend-api-key

# Cloudinary
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Payment URLs
PAYMENT_SUCCESS_URL=https://your-domain.vercel.app/checkout/success
PAYMENT_FAILURE_URL=https://your-domain.vercel.app/checkout/failure
```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository: `nikeshtamangghising/kalkalgroup`
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave empty)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm ci`

5. Add environment variables in the "Environment Variables" section
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel --prod
   ```

## Post-Deployment Setup

### 1. Database Migration

After deployment, run database migrations:

```bash
# Via Vercel CLI
vercel env pull .env.local
npm run db:migrate

# Or create a deployment script
```

### 2. Seed Initial Data

```bash
npm run db:seed:production
```

### 3. Configure Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update `NEXTAUTH_URL` and payment URLs to use your custom domain

## Build Optimization

The project is configured with:

- ✅ **TypeScript checking**: Enabled for production builds
- ✅ **Image optimization**: Cloudinary integration
- ✅ **Code splitting**: Optimized chunks for admin, UI, and vendor code
- ✅ **Caching**: API routes with appropriate cache headers
- ✅ **Security headers**: XSS protection, content type options
- ✅ **Performance monitoring**: Built-in performance tracking

## Monitoring & Maintenance

### 1. Vercel Analytics

Enable Vercel Analytics in your project settings for:
- Page views and performance metrics
- Core Web Vitals monitoring
- User experience insights

### 2. Error Monitoring

The project includes error boundaries and logging:
- Check Vercel Function logs for API errors
- Monitor database connection health
- Track performance metrics

### 3. Automated Tasks

Configured cron jobs:
- **Daily maintenance**: 2:00 AM UTC
- **Score updates**: Every 6 hours
- **Session cleanup**: 1:00 AM UTC

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors: `npm run type:check`
   - Verify all environment variables are set
   - Check database connectivity

2. **Database Connection Issues**
   - Verify `DATABASE_URL` format
   - Ensure Supabase project is active
   - Check connection pooling settings

3. **Image Upload Issues**
   - Verify Cloudinary credentials
   - Check image size limits
   - Ensure proper CORS settings

### Performance Optimization

1. **Monitor Bundle Size**
   ```bash
   npm run analyze
   ```

2. **Check Core Web Vitals**
   ```bash
   npm run perf:lighthouse
   ```

3. **Database Query Optimization**
   - Use connection pooling
   - Implement proper indexing
   - Monitor slow queries

## Security Checklist

- ✅ Environment variables secured
- ✅ Database credentials protected
- ✅ API routes authenticated
- ✅ CORS properly configured
- ✅ Security headers implemented
- ✅ Input validation in place

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Review function logs for API errors
3. Monitor database connection status
4. Verify environment variable configuration

## Production URLs

After deployment, your application will be available at:
- **Main Site**: `https://your-project.vercel.app`
- **Admin Panel**: `https://your-project.vercel.app/admin`
- **API Health**: `https://your-project.vercel.app/api/health`