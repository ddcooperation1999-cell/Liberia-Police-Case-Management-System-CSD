# Liberia National Police CMS - Deployment Guide

## 🚀 Quick Deployment

### Development Setup
```bash
# Backend
cd backend
npm install
cp .env.example .env  # Edit .env with secure values
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm start
```

### Production Deployment

#### 1. Security First
```bash
# Generate secure JWT secret
openssl rand -hex 32

# Update .env with production values
NODE_ENV=production
JWT_SECRET=your-generated-32-char-secret
FRONTEND_URL=https://your-domain.com
```

#### 2. Database Migration (SQLite to PostgreSQL)
```bash
# Install PostgreSQL and create database
createdb police_cases_db

# Update .env with PostgreSQL connection
DATABASE_URL=postgresql://user:password@localhost:5432/police_cases_db

# Run migrations (if needed)
npm run migrate
```

#### 3. Build and Deploy
```bash
# Build frontend
cd frontend
npm run build

# Backend production start
cd backend
npm install --production
npm start
```

#### 4. Reverse Proxy (nginx example)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend (static files)
    location / {
        root /path/to/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
}
```

## 🔒 Security Checklist

- [ ] Change default admin password (`admin`/`admin123`)
- [ ] Change default officer password (`officer1`/`officer123`)
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up firewall rules (only allow necessary ports)
- [ ] Implement database backups
- [ ] Set up monitoring and alerting
- [ ] Regular security updates
- [ ] Implement log aggregation
- [ ] Configure rate limiting (✅ Done)
- [ ] Enable security headers (✅ Done)

## 📊 Monitoring

### Health Checks
- GET `/health` - Application health status
- Monitor response time and error rates

### Logs
- Application logs in `logs/` directory
- Database query performance
- Authentication failures

### Alerts
- Set up alerts for:
  - High error rates
  - Failed login attempts
  - Database connection issues
  - Server resource usage

## 🔄 Backup Strategy

### Database Backups
```bash
# SQLite backup (development)
cp police_cases.db backup_$(date +%Y%m%d_%H%M%S).db

# PostgreSQL backup (production)
pg_dump police_cases_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### File Backups
- Backup entire application directory
- Backup environment files (secure location)
- Backup SSL certificates

### Automated Backups
- Daily database backups
- Weekly full application backups
- Test restore procedures monthly

## 🚨 Emergency Procedures

### Security Breach Response
1. Immediately change all passwords
2. Rotate JWT secrets
3. Review access logs
4. Notify relevant authorities
5. Implement additional security measures

### Data Loss Recovery
1. Restore from latest backup
2. Verify data integrity
3. Update all users about the incident
4. Implement preventive measures

## 📞 Support

For technical issues or security concerns:
- Development Team: [contact information]
- Emergency: [emergency contact]
- Documentation: [link to full documentation]