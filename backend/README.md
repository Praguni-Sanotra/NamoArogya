# NAMOAROGYA Backend

Production-ready healthcare backend API with FHIR compliance, integrating AYUSH (NAMASTE) and ICD-11 medical coding systems.

## 🏥 Features

- **FHIR R4 Compliant**: Full support for FHIR Patient, Condition, and Observation resources
- **Dual Medical Coding**: Seamless integration of NAMASTE (AYUSH) and ICD-11 codes
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Role-Based Access Control**: Doctor and Admin roles with granular permissions
- **Audit Logging**: Complete audit trail for all clinical actions
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Security**: Helmet, CORS, rate limiting, data encryption
- **India EHR Ready**: Designed for ABDM compliance

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Databases**: 
  - PostgreSQL (structured clinical data)
  - MongoDB Atlas (FHIR documents)
  - Redis (caching & sessions)
- **Authentication**: JWT with bcrypt
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI 3.0
- **Logging**: Winston

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database & app configuration
│   │   ├── database.js
│   │   └── swagger.js
│   ├── controllers/     # Request handlers
│   │   └── authController.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js
│   │   ├── auditLog.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validator.js
│   ├── models/          # Database models
│   │   └── mongodb/
│   │       ├── FHIRPatient.js
│   │       ├── FHIRCondition.js
│   │       ├── NAMASTECode.js
│   │       └── ICD11Code.js
│   ├── routes/          # API routes
│   │   ├── auth.routes.js
│   │   ├── patient.routes.js
│   │   ├── diagnosis.routes.js
│   │   ├── namaste.routes.js
│   │   ├── icd11.routes.js
│   │   ├── dualCoding.routes.js
│   │   └── analytics.routes.js
│   ├── services/        # Business logic
│   │   └── authService.js
│   ├── utils/           # Utility functions
│   │   ├── logger.js
│   │   ├── encryption.js
│   │   └── response.js
│   ├── validators/      # Request validation
│   │   └── authValidator.js
│   └── app.js          # Express app setup
├── migrations/          # Database migrations
│   └── 001_create_tables.sql
├── logs/               # Application logs
├── server.js           # Entry point
├── package.json
├── .env.example
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- MongoDB Atlas account (connection string provided)
- Redis (optional, for caching)

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - PostgreSQL credentials
   - MongoDB URI (already provided)
   - JWT secrets
   - Redis connection (optional)

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb namoarogya
   
   # Run migrations
   psql -d namoarogya -f migrations/001_create_tables.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   
   Server will start on `http://localhost:5000`

## 📚 API Documentation

Once the server is running, access the interactive API documentation at:

**http://localhost:5000/api-docs**

## 🔐 Authentication

### Default Users

The migration script creates two default users:

**Admin User:**
- Email: `admin@namoarogya.com`
- Password: `admin123`
- Role: admin

**Doctor User:**
- Email: `doctor@namoarogya.com`
- Password: `doctor123`
- Role: doctor

### Login Flow

1. **POST** `/api/auth/login`
   ```json
   {
     "email": "doctor@namoarogya.com",
     "password": "doctor123",
     "role": "doctor"
   }
   ```

2. **Response:**
   ```json
   {
     "success": true,
     "data": {
       "user": { ... },
       "token": "eyJhbGc...",
       "refreshToken": "eyJhbGc..."
     }
   }
   ```

3. **Use token in subsequent requests:**
   ```
   Authorization: Bearer eyJhbGc...
   ```

## 🗄️ Database Schema

### PostgreSQL Tables

- **users** - Doctor and admin accounts
- **patients** - Patient demographic data
- **diagnoses** - Diagnosis records with NAMASTE/ICD-11 codes
- **dual_coding_mappings** - Code mappings with confidence scores
- **audit_logs** - Complete audit trail

### MongoDB Collections

- **fhir_patients** - FHIR R4 Patient resources
- **fhir_conditions** - FHIR R4 Condition resources
- **namaste_codes** - AYUSH medical codes
- **icd11_codes** - ICD-11 codes

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/me` - Get current user

### Patients
- `GET /api/patients` - List patients
- `GET /api/patients/:id` - Get patient
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `GET /api/patients/:id/fhir` - Get FHIR Patient resource

### Diagnosis
- `GET /api/diagnosis` - List diagnoses
- `GET /api/diagnosis/:id` - Get diagnosis
- `GET /api/diagnosis/patient/:patientId` - Get patient diagnoses
- `POST /api/diagnosis` - Create diagnosis
- `PUT /api/diagnosis/:id` - Update diagnosis

### NAMASTE Codes
- `GET /api/namaste/search?q=query` - Search codes
- `GET /api/namaste/:code` - Get code details
- `POST /api/namaste` - Create code (admin only)

### ICD-11 Codes
- `GET /api/icd11/search?q=query` - Search codes
- `GET /api/icd11/:code` - Get code details
- `POST /api/icd11` - Create code (admin only)

### Dual Coding
- `GET /api/dual-coding` - List mappings
- `POST /api/dual-coding` - Create mapping
- `GET /api/dual-coding/mapping` - Get specific mapping
- `PUT /api/dual-coding/:id` - Update mapping
- `POST /api/dual-coding/suggest` - AI-powered suggestions (placeholder)

### Analytics
- `GET /api/analytics/overview` - Dashboard statistics
- `GET /api/analytics/patients` - Patient analytics
- `GET /api/analytics/diagnosis` - Diagnosis distribution

## 🔒 Security Features

- **JWT Authentication** with access and refresh tokens
- **Password Hashing** using bcrypt (10 rounds)
- **Rate Limiting** to prevent abuse
- **Helmet** for security headers
- **CORS** configuration
- **Data Encryption** for sensitive fields
- **Audit Logging** for all clinical actions
- **Input Validation** using Joi schemas

## 📊 FHIR Compliance

The backend implements FHIR R4 resources:

- **Patient** - Demographics and identifiers
- **Condition** - Diagnoses and clinical conditions
- **Observation** - Clinical observations (ready for extension)
- **Bundle** - Grouped resources (ready for extension)

All FHIR resources are stored in MongoDB and linked to PostgreSQL records via `fhir_id`.

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed sample data

### Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `POSTGRES_*` - PostgreSQL connection
- `MONGODB_URI` - MongoDB Atlas connection
- `REDIS_*` - Redis connection (optional)
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret

## 🚀 Deployment

### Production Checklist

1. ✅ Set strong JWT secrets
2. ✅ Configure production database credentials
3. ✅ Enable HTTPS
4. ✅ Set `NODE_ENV=production`
5. ✅ Configure proper CORS origins
6. ✅ Set up log rotation
7. ✅ Enable Redis for production caching
8. ✅ Review rate limiting settings
9. ✅ Set up database backups
10. ✅ Configure monitoring and alerts

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

## 📝 Audit Logging

All clinical actions are automatically logged to the `audit_logs` table:

- User who performed the action
- Action type (CREATE, READ, UPDATE, DELETE)
- Resource type and ID
- IP address and user agent
- Timestamp

## 🔮 Future Enhancements

- [ ] AI/NLP service for automatic NAMASTE ↔ ICD-11 mapping
- [ ] FHIR Observation resource implementation
- [ ] FHIR Bundle support for bulk operations
- [ ] Integration with external EMR systems
- [ ] ABDM (Ayushman Bharat Digital Mission) integration
- [ ] Real-time notifications using WebSockets
- [ ] Advanced analytics and reporting
- [ ] Multi-language support for medical codes

## 📄 License

Proprietary - NAMOAROGYA Healthcare Platform

## 🤝 Support

For technical support:
- Email: support@namoarogya.com
- Documentation: http://localhost:5000/api-docs

---

**Built for better healthcare with AYUSH and ICD-11 integration** 🏥
