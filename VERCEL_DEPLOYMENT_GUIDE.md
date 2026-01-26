# 🚀 Vercel Deployment Guide for LNPMS

## Pre-Deployment Checklist

### 1. **Database Setup**
- ❌ **SQLite NOT supported on Vercel** (ephemeral filesystem)
- ✅ **Use PostgreSQL or MongoDB** instead

#### Option A: PostgreSQL (Recommended)
1. Sign up for PostgreSQL service:
   - Neon (https://neon.tech) - Free tier available
   - Heroku PostgreSQL
   - AWS RDS
   - DigitalOcean Managed Databases

2. Get your DATABASE_URL:
   ```
   postgresql://username:password@host:port/database_name
   ```

#### Option B: MongoDB
1. Sign up for MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database_name
   ```

### 2. **Environment Variables Setup**

Create Vercel environment variables:

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add the following variables:

```
JWT_SECRET = (generate a strong random string, 32+ characters)
DATABASE_URL = postgresql://user:pass@host/dbname
FRONTEND_URL = https://your-domain.vercel.app
NODE_ENV = production
```

### 3. **Update Database Connection**

Edit `backend/db.js` to support PostgreSQL:

```javascript
if (process.env.DATABASE_URL) {
  // PostgreSQL for production
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  module.exports = pool;
} else {
  // SQLite for local development
  const Database = require('better-sqlite3');
  module.exports = new Database('./backend/police_cases.db');
}
```

### 4. **Update package.json Build Scripts**

```json
{
  "scripts": {
    "start": "node backend/index.js",
    "build": "npm install",
    "dev": "concurrently \"npm run backend:dev\" \"npm run frontend:dev\""
  }
}
```

### 5. **GitHub Setup**

1. Initialize Git (if not already done):
```bash
cd c:\Users\user\Desktop\LNPMS
git init
git add .
git commit -m "Initial commit for Vercel deployment"
```

2. Push to GitHub:
```bash
git remote add origin https://github.com/your-username/lnpms.git
git branch -M main
git push -u origin main
```

### 6. **Vercel Deployment Steps**

1. Go to https://vercel.com
2. Sign up / Log in
3. Click "New Project"
4. Import your GitHub repository
5. Select the LNPMS project
6. Configure:
   - **Framework**: Node.js
   - **Root Directory**: ./
   - **Build Command**: `npm install`
   - **Output Directory**: Leave blank
   - **Environment Variables**: Add from step 2
7. Click "Deploy"

### 7. **Post-Deployment**

1. **Set Custom Domain**:
   - Vercel Dashboard → Project Settings → Domains
   - Add your custom domain or use default `.vercel.app` domain

2. **Test API Endpoints**:
   ```bash
   curl https://your-app.vercel.app/api/auth/login
   ```

3. **Monitor Logs**:
   - Vercel Dashboard → Deployments → View Logs

4. **Enable CI/CD**:
   - Automatic deployments on git push enabled by default

### 8. **Database Migration**

For PostgreSQL, run migration script:

```javascript
// backend/migrate-to-postgres.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  const client = await pool.connect();
  try {
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        role VARCHAR(50),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS cases (
        id SERIAL PRIMARY KEY,
        case_number VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255),
        description TEXT,
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      -- Add more tables as needed
    `);
    console.log('✅ Migration completed');
  } finally {
    client.release();
  }
}

migrate().catch(err => console.error(err));
```

### 9. **Troubleshooting**

| Issue | Solution |
|-------|----------|
| 500 errors on deploy | Check Vercel logs and environment variables |
| Database connection fails | Verify DATABASE_URL and IP whitelist in DB service |
| CORS errors | Update FRONTEND_URL and BACKEND_URL env vars |
| Cold start timeout | Increase maxDuration in vercel.json |
| Static files not loading | Check frontend build output directory |

### 10. **Performance Optimization**

1. **Enable Caching**:
```javascript
// Add to backend/index.js
app.use(compression());
app.set('etag', false);
```

2. **Database Connection Pooling**:
```javascript
const pool = new Pool({
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000
});
```

3. **API Response Compression**:
```javascript
app.use(compression({ level: 6 }));
```

### 11. **Cost Estimate**

- **Vercel Hosting**: $0-20/month
- **PostgreSQL (Neon)**: $0 (free tier) or $15-50/month
- **Domain**: $10-15/year

### 12. **Next Steps**

- ✅ Set up monitoring and error tracking (Sentry)
- ✅ Enable automated backups
- ✅ Set up SSL/TLS certificate (automatic with Vercel)
- ✅ Configure CDN for static assets
- ✅ Set up analytics and usage tracking
- ✅ Create staging environment

---

## Quick Deployment Command

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel --prod

# 4. Set environment variables
vercel env add JWT_SECRET
vercel env add DATABASE_URL
vercel env add FRONTEND_URL

# 5. Redeploy with env vars
vercel --prod
```

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Express.js on Vercel](https://vercel.com/docs/frameworks/express)
- [PostgreSQL on Vercel](https://vercel.com/docs/databases/postgres)
- [Neon PostgreSQL Free Tier](https://neon.tech)

---

**Status**: Ready for Production Deployment ✅
**Last Updated**: January 26, 2026
**LNPMS Version**: 4.0 Professional Edition
