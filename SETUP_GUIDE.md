# NAMOAROGYA - Complete Setup Guide

Step-by-step instructions to run the entire NAMOAROGYA Healthcare Platform.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** 14+
- **Git**
- **Docker** (optional, for AI service)

---

## Part 1: Database Setup

### Step 1: Start PostgreSQL

```bash
# Check if PostgreSQL is running
brew services list

# Start PostgreSQL if not running
brew services start postgresql@14
```

### Step 2: Create Database

```bash
# Create the database
createdb namoarogya

# Verify it was created
psql -l | grep namoarogya
```

### Step 3: Run Database Migrations

```bash
cd /Users/pragunisanotra/Desktop/NamoArogya/backend

# Run the schema migration
psql -d namoarogya -f src/config/schema.sql
```

### Step 4: Set Up User Passwords

```bash
# Generate password hashes
node fix-passwords.js

# Copy the two psql commands from the output and run them
# They will look like:
psql -d namoarogya -f update-passwords.sql
```

---

## Part 2: Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd /Users/pragunisanotra/Desktop/NamoArogya/backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

Your `.env` file should already be configured. Verify it has:

```env
PORT=5000
NODE_ENV=development
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=namoarogya
POSTGRES_USER=pragunisanotra
POSTGRES_PASSWORD=
```

### Step 4: Start Backend Server

```bash
npm run dev
```

**Expected Output:**
```
✅ PostgreSQL connected
🚀 NAMOAROGYA Backend running on port 5000
📚 API Documentation: http://localhost:5000/api-docs
```

**Keep this terminal open!**

---

## Part 3: Frontend Setup

### Step 1: Open New Terminal

Open a new terminal window (keep backend running).

### Step 2: Navigate to Frontend Directory

```bash
cd /Users/pragunisanotra/Desktop/NamoArogya
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Configure Environment

Your `.env` file should have:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 5: Start Frontend

```bash
npm run dev
```

**Expected Output:**
```
VITE v5.4.21 ready in 639 ms
➜  Local:   http://localhost:5173/
```

**Keep this terminal open!**

---

## Part 4: AI Service Setup (Optional)

### Step 1: Open New Terminal

Open a third terminal window.

### Step 2: Navigate to AI Service Directory

```bash
cd /Users/pragunisanotra/Desktop/NamoArogya/ai-service
```

### Step 3: Create Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # You should see (venv) in your prompt
```

### Step 4: Install Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm
```

This will take a few minutes as it downloads the transformer model (~80MB).

### Step 5: Configure Environment

```bash
# Copy environment file
cp env.example .env
```

### Step 6: Start AI Service

```bash
# Start the service
uvicorn app.main:app --reload
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Loading embedding model: sentence-transformers/all-MiniLM-L6-v2
INFO:     Model loaded successfully
INFO:     Loaded 15 ICD-11 codes
INFO:     Loaded 10 NAMASTE codes
INFO:     Mapping Service initialized successfully
```

**Keep this terminal open!**

---

## Part 5: Access the Application

Now you have all three services running:

1. **Backend**: http://localhost:5000
2. **Frontend**: http://localhost:5173
3. **AI Service**: http://localhost:8000

### Access Points:

**Frontend Application:**
- URL: http://localhost:5173
- Login with:
  - **Admin**: `admin@namoarogya.com` / `admin123`
  - **Doctor**: `doctor@namoarogya.com` / `doctor123`

**Backend API Documentation:**
- Swagger UI: http://localhost:5000/api-docs
- Health Check: http://localhost:5000/health

**AI Service API Documentation:**
- Swagger UI: http://localhost:8000/api/v1/docs
- Health Check: http://localhost:8000/api/v1/health

---

## Part 6: Testing the AI Service

### Test Mapping Endpoint

```bash
curl -X POST http://localhost:8000/api/v1/map \
  -H "Content-Type: application/json" \
  -d '{
    "namaste_code": "AYU-001",
    "disease_name": "Amlapitta",
    "symptoms": "Acid reflux, heartburn"
  }'
```

**Expected Response:**
```json
{
  "namaste_code": "AYU-001",
  "disease_name": "Amlapitta",
  "suggestions": [
    {
      "icd_code": "DA63",
      "disease_name": "Gastroesophageal reflux disease",
      "confidence": 0.91,
      "confidence_level": "high"
    }
  ]
}
```

---

## Quick Start Summary

```bash
# Terminal 1 - Backend
cd /Users/pragunisanotra/Desktop/NamoArogya/backend
npm run dev

# Terminal 2 - Frontend
cd /Users/pragunisanotra/Desktop/NamoArogya
npm run dev

# Terminal 3 - AI Service (Optional)
cd /Users/pragunisanotra/Desktop/NamoArogya/ai-service
source venv/bin/activate
uvicorn app.main:app --reload
```

Then open: http://localhost:5173

---

## Troubleshooting

### Backend Won't Start

**Issue**: PostgreSQL connection error
```bash
# Check PostgreSQL is running
brew services list

# Restart if needed
brew services restart postgresql@14

# Verify database exists
psql -l | grep namoarogya
```

**Issue**: Invalid credentials
```bash
# Regenerate passwords
cd backend
node fix-passwords.js
psql -d namoarogya -f update-passwords.sql
```

### Frontend Won't Connect

**Issue**: API connection failed
- Check backend is running on port 5000
- Verify `.env` has `VITE_API_URL=http://localhost:5000/api`
- Restart frontend: `npm run dev`

### AI Service Errors

**Issue**: Model download fails
```bash
# Manually download model
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"
```

**Issue**: spaCy model not found
```bash
python -m spacy download en_core_web_sm
```

---

## Stopping the Services

```bash
# In each terminal, press:
Ctrl + C

# Deactivate Python virtual environment (AI service terminal):
deactivate
```

---

## Using Docker (Alternative for AI Service)

Instead of manual setup, you can run the AI service with Docker:

```bash
cd /Users/pragunisanotra/Desktop/NamoArogya/ai-service

# Build and run
docker-compose up -d

# View logs
docker-compose logs -f ai-service

# Stop
docker-compose down
```

---

## Next Steps

1. **Explore the Frontend**: Navigate through patient records, diagnosis, dual coding
2. **Test API Endpoints**: Use Swagger UI to test backend APIs
3. **Try AI Mapping**: Use the dual coding feature to see NAMASTE → ICD-11 mapping
4. **Add Data**: Create new patients and diagnoses
5. **Review Logs**: Check terminal outputs for any errors

---

## Default Login Credentials

**Admin Account:**
- Email: `admin@namoarogya.com`
- Password: `admin123`
- Role: `admin`

**Doctor Account:**
- Email: `doctor@namoarogya.com`
- Password: `doctor123`
- Role: `doctor`

---

## Project Structure

```
NamoArogya/
├── backend/          # Node.js/Express API (Port 5000)
├── src/              # React Frontend (Port 5173)
└── ai-service/       # Python AI/NLP Service (Port 8000)
```

---

## Support

If you encounter issues:

1. Check all services are running
2. Verify environment variables
3. Check terminal logs for errors
4. Ensure PostgreSQL is running
5. Verify ports 5000, 5173, and 8000 are available

---

**Happy Coding! 🚀**
