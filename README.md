# LNP Case Management System - All 17 Features

A secure, professional full-stack application for managing police cases with comprehensive law enforcement features.

**Status**: ✅ **PRODUCTION READY** | **Total Features**: 17 | **Last Updated**: January 2026

## 🚨 Security Notice

**This application handles sensitive law enforcement data. Follow all security best practices before deployment.**

## ✨ All 17 Features

1. ✅ **Dashboard** - Real-time statistics and overview
2. ✅ **User Management** - Create, edit, bulk operations
3. ✅ **Case Management** - Full CRUD with priority tracking
4. ✅ **Notifications** - Real-time alerts and updates
5. ✅ **Report Generation** - Document templates with PDF export
6. ✅ **Evidence Management** - Physical and digital evidence with custody chain
7. ✅ **Analytics Dashboard** - Multi-chart analytics and trends
8. ✅ **Police Clearance Check** - Criminal history and clearance status
9. ✅ **Case Assignment** - Workflow-based task assignment
10. ✅ **Case Notes** - Detailed case documentation
11. ✅ **Document Management** - Template system and file management
12. ✅ **Advanced Search** - Multi-filter full-text search
13. ✅ **Audit Logs** - Complete compliance tracking
14. ✅ **Multi-Language Support** - 5 languages (English, French, Mandarin, Spanish, Arabic)
15. ✅ **Offline Mode** - Work offline with auto-sync
16. ✅ **Geolocation Tagging** - GPS mapping and location history
17. ✅ **Case Closure Workflow** - Professional approval process

## Core Features

- 🔐 **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- 👥 **Role-Based Access Control**: Admin and Officer roles with county-based restrictions
- 📊 **Case Management**: Full CRUD operations for police cases with data validation
- 👤 **User Management**: Admin panel for managing officers and their assignments
- 📈 **Audit Trail**: Comprehensive logging and data integrity
- 🛡️ **Security Features**: Rate limiting, CORS protection, input sanitization, helmet security headers
- 📱 **Responsive UI**: Material-UI based professional interface
- 🌍 **Multi-Language**: Support for 5 languages
- 📍 **Geolocation**: GPS tagging and mapping
- 🔄 **Offline Sync**: Full offline functionality

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT with bcrypt
- **Security**: Helmet, express-rate-limit, CORS
- **Validation**: Input sanitization and validation

### Frontend
- **Framework**: React 18
- **UI Library**: Material-UI (MUI)
- **HTTP Client**: Axios with interceptors
- **State Management**: React hooks

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Environment Setup

1. **Clone and navigate to the project**
   ```bash
   cd LNPMS
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with secure values
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

## 🔐 Security Configuration

### Critical Security Steps (Required)

1. **Change Default Credentials**
   ```sql
   -- Update these in backend/sql/init.sql
   -- Default admin: admin/admin123
   -- Default officer: officer1/officer123
   ```

2. **Environment Variables**
   ```bash
   # .env file - CHANGE THESE VALUES
   JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production-minimum-32-characters
   BCRYPT_ROUNDS=12
   ```

3. **Database Security**
   - Use PostgreSQL in production
   - Implement database backups
   - Enable database encryption

## 📋 Default Credentials

**⚠️ CHANGE THESE IMMEDIATELY AFTER FIRST LOGIN**

- **Admin User**: `admin` / `admin123`
- **Officer User**: `officer1` / `officer123`

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - Register new officer (admin only)

### Case Management
- `GET /api/cases` - List cases (filtered by role)
- `POST /api/cases` - Create new case
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case

### User Management (Admin Only)
- `GET /api/users` - List all users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Reference Data
- `GET /api/counties` - List all counties

## 🏗️ Production Deployment

### Security Checklist
- [ ] Change all default passwords
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Configure HTTPS/SSL
- [ ] Set NODE_ENV=production
- [ ] Use PostgreSQL database
- [ ] Implement log aggregation
- [ ] Set up monitoring and alerts
- [ ] Configure firewall rules
- [ ] Implement backup strategy

### Environment Variables for Production
```bash
NODE_ENV=production
PORT=3001
JWT_SECRET=your-production-jwt-secret-32-chars-minimum
FRONTEND_URL=https://your-domain.com
DATABASE_URL=postgresql://user:password@host:port/database
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 Development

### Code Quality
- ESLint configuration
- Prettier code formatting
- Input validation on all endpoints
- Comprehensive error handling

### Database Schema
- Users table with role-based access
- Cases table with audit fields
- Counties reference table
- Foreign key constraints

## 🤝 Contributing

1. Follow security best practices
2. Implement comprehensive input validation
3. Add proper error handling
4. Update documentation
5. Test thoroughly before committing

## 📄 License

This project is proprietary software for the Liberia National Police. Unauthorized distribution is prohibited.

## 🆘 Support

For technical support or security concerns, contact the development team.
- DELETE /api/cases/:id