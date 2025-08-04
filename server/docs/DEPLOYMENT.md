# Deployment Guide

## Overview

This guide covers deploying the Gym Workout Tracker API to production environments. The application is built with Hono.js, TypeScript, and uses Neon PostgreSQL as the database.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Neon PostgreSQL database
- Domain name (optional but recommended)

## Environment Setup

### 1. Environment Variables

Create a `.env` file in the server root with the following variables:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Authentication
BETTER_AUTH_SECRET=your-super-secure-secret-key-here

# Server Configuration
NODE_ENV=production
PORT=3001

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting (Optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Database Setup

#### Neon PostgreSQL Setup

1. Create a Neon project at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Update the `DATABASE_URL` in your environment variables

#### Database Migration and Seeding

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Seed the database with initial data
npm run db:seed
```

## Deployment Options

### Option 1: Railway

Railway provides simple deployment with automatic scaling.

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy:**
   ```bash
   railway login
   railway init
   railway add
   ```

3. **Configure Environment Variables:**
   - Go to your Railway dashboard
   - Add all environment variables from your `.env` file
   - Deploy with `railway up`

4. **Custom Domain (Optional):**
   - In Railway dashboard, go to Settings > Domains
   - Add your custom domain

### Option 2: Vercel

Vercel offers excellent performance and easy deployment.

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Configure vercel.json:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/index.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/index.ts"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Environment Variables:**
   - Use Vercel dashboard or CLI to set environment variables
   - `vercel env add DATABASE_URL`
   - `vercel env add BETTER_AUTH_SECRET`

### Option 3: DigitalOcean App Platform

DigitalOcean provides managed hosting with automatic scaling.

1. **Create app.yaml:**
   ```yaml
   name: gym-tracker-api
   services:
   - name: api
     source_dir: /
     github:
       repo: your-username/gym-workout-planner
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: NODE_ENV
       value: production
     - key: DATABASE_URL
       value: ${DATABASE_URL}
     - key: BETTER_AUTH_SECRET
       value: ${BETTER_AUTH_SECRET}
   ```

2. **Deploy via DigitalOcean Console:**
   - Create new App
   - Connect GitHub repository
   - Configure environment variables
   - Deploy

### Option 4: Self-Hosted (VPS)

Deploy on your own server using PM2 for process management.

1. **Server Setup:**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   npm install -g pm2

   # Clone repository
   git clone https://github.com/your-username/gym-workout-planner.git
   cd gym-workout-planner/server
   ```

2. **Install Dependencies:**
   ```bash
   npm ci --production
   npm run build
   ```

3. **Configure PM2:**
   Create `ecosystem.config.js`:
   ```javascript
   module.exports = {
     apps: [{
       name: 'gym-tracker-api',
       script: 'dist/index.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3001
       },
       env_production: {
         NODE_ENV: 'production',
         PORT: 3001
       }
     }]
   };
   ```

4. **Start Application:**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

5. **Nginx Configuration:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Database Management

### Migrations

Run migrations on deployment:

```bash
# In package.json scripts
"db:migrate": "tsx src/db/migrate.ts",
"db:seed": "tsx src/db/seed.ts"
```

### Backup Strategy

Set up automated backups for your Neon database:

1. **Neon Built-in Backups:**
   - Neon automatically creates backups
   - Configure retention period in dashboard

2. **Custom Backup Script:**
   ```bash
   #!/bin/bash
   # backup.sh
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   # Upload to cloud storage (AWS S3, etc.)
   ```

## Monitoring & Logging

### Health Checks

The API includes a health check endpoint at `/health`:

```bash
curl https://yourdomain.com/health
```

### Application Monitoring

1. **Railway/Vercel:**
   - Built-in monitoring dashboards
   - View logs, metrics, and errors

2. **Self-Hosted:**
   ```bash
   # PM2 monitoring
   pm2 monit

   # PM2 logs
   pm2 logs gym-tracker-api

   # System monitoring
   sudo apt install htop
   htop
   ```

### Error Tracking

Integrate error tracking services:

1. **Sentry Integration:**
   ```typescript
   import * as Sentry from "@sentry/node";

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });
   ```

2. **Custom Logging:**
   ```typescript
   import winston from 'winston';

   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' }),
     ],
   });
   ```

## Security Considerations

### HTTPS/TLS

1. **Managed Platforms:**
   - Railway, Vercel, DigitalOcean provide automatic HTTPS

2. **Self-Hosted:**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx

   # Get SSL certificate
   sudo certbot --nginx -d yourdomain.com

   # Auto-renewal
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Environment Security

1. **Secrets Management:**
   - Never commit `.env` files
   - Use platform-specific secret management
   - Rotate secrets regularly

2. **Database Security:**
   - Use strong passwords
   - Enable SSL connections
   - Limit database access by IP

3. **API Security:**
   - Rate limiting (already implemented)
   - CORS configuration (already implemented)
   - Input validation (already implemented)

## Performance Optimization

### Caching

1. **Redis Integration:**
   ```typescript
   import Redis from 'ioredis';
   
   const redis = new Redis(process.env.REDIS_URL);
   
   // Cache workout plans
   app.get('/workouts/plans', async (c) => {
     const cached = await redis.get(`plans:${userId}`);
     if (cached) return c.json(JSON.parse(cached));
     
     // Fetch from database
     const plans = await fetchPlans();
     await redis.setex(`plans:${userId}`, 300, JSON.stringify(plans));
     return c.json(plans);
   });
   ```

2. **CDN for Static Assets:**
   - Use CloudFlare, AWS CloudFront, or similar
   - Cache API responses with appropriate headers

### Database Optimization

1. **Connection Pooling:**
   ```typescript
   // Already configured in Drizzle + Neon setup
   const db = drizzle(sql, { schema });
   ```

2. **Query Optimization:**
   - Use database indexes (already implemented)
   - Implement pagination (already implemented)
   - Use select projections for large datasets

## Testing in Production

### Smoke Tests

Create a basic test script:

```bash
#!/bin/bash
# smoke-test.sh

API_URL="https://yourdomain.com"

echo "Testing health endpoint..."
curl -f "$API_URL/health" || exit 1

echo "Testing authentication..."
curl -f -X POST "$API_URL/api/auth/sign-in" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"invalid"}' || exit 1

echo "All tests passed!"
```

### Load Testing

Use tools like Artillery or k6:

```yaml
# artillery.yml
config:
  target: 'https://yourdomain.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Health check"
    requests:
      - get:
          url: "/health"
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors:**
   ```bash
   # Check DATABASE_URL format
   # Ensure database is accessible
   # Verify SSL configuration
   ```

2. **Memory Issues:**
   ```bash
   # Monitor memory usage
   pm2 monit
   
   # Increase instance size on managed platforms
   # Add swap on self-hosted servers
   ```

3. **Rate Limiting Issues:**
   ```bash
   # Check rate limit headers
   curl -I https://yourdomain.com/health
   
   # Adjust rate limits in environment variables
   ```

### Debugging

1. **Enable Debug Logging:**
   ```bash
   export DEBUG=*
   npm start
   ```

2. **Database Query Logging:**
   ```typescript
   // In development
   const db = drizzle(sql, { 
     schema, 
     logger: true // Enable query logging
   });
   ```

## Maintenance

### Regular Tasks

1. **Weekly:**
   - Review application logs
   - Check error rates
   - Monitor performance metrics

2. **Monthly:**
   - Update dependencies
   - Review security advisories
   - Optimize database queries

3. **Quarterly:**
   - Rotate secrets
   - Review backup procedures
   - Performance testing

### Updates

1. **Dependency Updates:**
   ```bash
   npm audit
   npm update
   npm audit fix
   ```

2. **Security Updates:**
   ```bash
   # Check for security vulnerabilities
   npm audit

   # Update specific packages
   npm update package-name
   ```

3. **Database Schema Updates:**
   ```bash
   # Create migration
   npm run db:generate

   # Apply migration
   npm run db:migrate
   ```

---

This deployment guide covers the essential steps to deploy and maintain your Gym Workout Tracker API in production. Choose the deployment option that best fits your needs and budget.