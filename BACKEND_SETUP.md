# Complete Setup Guide

This guide will help you set up both the React frontend and Django backend.

## Prerequisites

- Python 3.9+ installed
- Node.js and npm installed
- Virtual environment support

## Step 1: Backend Setup (Django)

### 1.1 Create and Activate Virtual Environment

```bash
cd "/Users/salemleq/Downloads/Landing Page Design"
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 1.2 Install Django Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 1.3 Run Migrations

```bash
python manage.py migrate
```

### 1.4 Create Admin User

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

## Step 2: Frontend Setup (React)

### 2.1 Install Node Dependencies

```bash
# From project root
npm install
```

### 2.2 Build React App

```bash
npm run build
```

This creates a `build` directory that Django will serve.

## Step 3: Run the Application

### Option A: Development Mode (Separate Servers)

**Terminal 1 - Django Backend:**
```bash
cd backend
source ../venv/bin/activate
python manage.py runserver
```
Backend runs on: `http://localhost:8000`

**Terminal 2 - React Frontend:**
```bash
npm run dev
```
Frontend runs on: `http://localhost:3000`

### Option B: Production Mode (Django Serves React)

**Build React first:**
```bash
npm run build
```

**Run Django:**
```bash
cd backend
source ../venv/bin/activate
python manage.py runserver
```

Access the app at: `http://localhost:8000`

## Step 4: Configure API URL (Optional)

If running in separate servers, create a `.env` file in the project root:

```
VITE_API_URL=http://localhost:8000/api
```

Then rebuild:
```bash
npm run build
```

## Step 5: Add Initial Video

1. Go to `http://localhost:8000/admin/`
2. Login with your superuser credentials
3. Navigate to **Videos**
4. Click **Add Video**
5. Fill in:
   - Title: "Hero Video"
   - Vimeo ID: "1133539416" (or your video ID)
   - Position: "Hero Section"
   - Is Active: ✓
   - Order: 0
6. Click **Save**

## API Testing

### Test Customer Registration

```bash
curl -X POST http://localhost:8000/api/contacts/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "whatsapp": "0599123456",
    "goal": "income",
    "city": "Ramallah"
  }'
```

### Test Video API

```bash
curl http://localhost:8000/api/videos/hero/
```

## Troubleshooting

### Issue: Static files not found
- Make sure you've run `npm run build` before starting Django
- Check that the `build` directory exists in the project root

### Issue: CORS errors
- Ensure `django-cors-headers` is installed
- Check `CORS_ALLOWED_ORIGINS` in `backend/config/settings.py`

### Issue: Module not found
- Make sure virtual environment is activated
- Run `pip install -r backend/requirements.txt` again

### Issue: Database errors
- Run `python manage.py migrate` again
- Check that `db.sqlite3` file exists in the `backend` directory

## Project Structure

```
Landing Page Design/
├── backend/              # Django backend
│   ├── config/           # Django settings
│   ├── contacts/         # Customer registration app
│   ├── videos/           # Video management app
│   └── manage.py
├── src/                  # React frontend source
│   ├── api/              # API client
│   └── components/       # React components
├── build/                # React build output (generated)
├── package.json
└── vite.config.ts
```

## Next Steps

1. **Customize Django Admin**: Add more fields or filters as needed
2. **Add Email Notifications**: Send confirmation emails on registration
3. **Add Video Upload**: Implement file upload for videos
4. **Deploy**: Set up for production deployment

