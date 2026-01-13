# NamoArogya - Quick Start Guide

## ✅ Setup Complete!

Your NamoArogya project is now fully configured and ready to use.

## 🚀 Starting the Project

You need **3 terminal windows** running simultaneously:

### Terminal 1: Backend Server
```bash
cd /Users/pragunisanotra/Desktop/NamoArogya/backend
npm run dev
```
**Status:** ✅ Running on http://localhost:5000

### Terminal 2: Frontend Application  
```bash
cd /Users/pragunisanotra/Desktop/NamoArogya
npm run dev
```
**Status:** ✅ Running on http://localhost:5173

### Terminal 3: AI Service (Optional)
```bash
cd /Users/pragunisanotra/Desktop/NamoArogya/ai-service
source venv/bin/activate
uvicorn app.main:app --reload
```
**Status:** ✅ Running on http://localhost:8000

---

## 🔐 Login Credentials

### Admin Account
- **Email:** `admin@namoarogya.com`
- **Password:** `admin123`
- **Access:** Full admin dashboard with system management

### Doctor Account
- **Email:** `doctor@namoarogya.com`
- **Password:** `doctor123`
- **Access:** Doctor dashboard with patient management

---

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend App** | http://localhost:5173 | Main application interface |
| **Backend API** | http://localhost:5000 | REST API server |
| **Backend Docs** | http://localhost:5000/api-docs | Swagger API documentation |
| **AI Service** | http://localhost:8000 | ML/NLP service for code mapping |
| **AI Service Docs** | http://localhost:8000/api/v1/docs | AI API documentation |

---

## 📊 System Status

### Database Configuration
- ✅ **PostgreSQL:** Connected (Primary database)
- ⚠️ **MongoDB:** Optional (Not required for basic functionality)
- ⚠️ **Redis:** Optional (Caching layer)

### Authentication
- ✅ Uses PostgreSQL for user authentication
- ✅ JWT-based token system
- ✅ Role-based access control (Admin/Doctor)

---

## 🔧 Maintenance Commands

### Reset User Passwords
If you need to reset the default user passwords:
```bash
cd /Users/pragunisanotra/Desktop/NamoArogya/backend
/Users/pragunisanotra/.nvm/versions/node/v18.20.8/bin/node setup-users.js
```

### Check Database
```bash
# List all tables
psql -d namoarogya -c "\dt"

# View users
psql -d namoarogya -c "SELECT id, email, name, role FROM users;"
```

### Restart Services
If any service crashes, simply restart it in its terminal:
- Press `Ctrl + C` to stop
- Run the start command again

---

## 🎯 Features Available

1. **Patient Management**
   - Add, edit, view, and delete patient records
   - Complete patient history tracking

2. **Dual Medical Coding**
   - NAMASTE (AYUSH) code management
   - ICD-11 international standard codes
   - AI-powered semantic mapping between systems

3. **Analytics Dashboard**
   - Real-time statistics
   - Interactive charts and visualizations
   - Patient and diagnosis trends

4. **Role-Based Access**
   - Admin: Full system access
   - Doctor: Patient management and diagnosis

5. **Progressive Web App (PWA)**
   - Installable on desktop and mobile
   - Offline capability
   - Responsive design

---

## 🐛 Troubleshooting

### Login Not Working
- ✅ **Fixed:** Users table created with default accounts
- Verify backend is running on port 5000
- Check browser console for errors

### Backend Won't Start
- Ensure PostgreSQL is running: `brew services list`
- Check if port 5000 is available
- Review backend terminal for error messages

### Frontend Can't Connect
- Verify `.env` has `VITE_API_URL=http://localhost:5000/api`
- Ensure backend is running
- Clear browser cache and reload

### AI Service Errors
- Activate virtual environment: `source venv/bin/activate`
- Reinstall dependencies: `pip install -r requirements.txt`
- Download models: `python -m spacy download en_core_web_sm`

---

## 📝 Development Notes

### Recent Changes
1. ✅ Made MongoDB optional for development
2. ✅ Created PostgreSQL-based authentication fallback
3. ✅ Set up users table with default admin and doctor accounts
4. ✅ Configured hybrid auth service (MongoDB/PostgreSQL)

### File Structure
```
NamoArogya/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── services/
│   │   │   ├── authService.js           # Hybrid auth (MongoDB/PostgreSQL)
│   │   │   └── authService.postgres.js  # PostgreSQL-only auth
│   │   └── config/
│   │       └── database.js              # Database connections
│   └── setup-users.js          # User setup script
├── src/                        # React Frontend
└── ai-service/                 # Python AI/NLP Service
```

---

## 🎉 You're All Set!

Open http://localhost:5173 in your browser and login with the credentials above.

**Happy Coding!** 🚀
