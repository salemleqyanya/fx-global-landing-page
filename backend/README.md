# Django Backend for Landing Page

This Django backend provides APIs for customer registration and video management for the landing page.

## Features

- **Customer Registration API**: Register customers with name, WhatsApp, goal, and city
- **Video Management API**: Manage videos for the landing page (Vimeo IDs, video URLs, or file uploads)
- **Admin Interface**: Django admin for managing contacts and videos
- **CORS Support**: Configured for React frontend integration

## Setup Instructions

### 1. Install Dependencies

```bash
# Activate virtual environment (if not already activated)
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Database Setup

```bash
# Run migrations
python manage.py migrate

# Create superuser for admin access
python manage.py createsuperuser
```

### 3. Build React Frontend

Before running Django, you need to build the React app:

```bash
# From the project root directory
cd ..
npm install
npm run build
```

This will create a `build` directory that Django will serve.

### 4. Run Development Server

```bash
# From backend directory
python manage.py runserver
```

The Django server will run on `http://localhost:8000`

### 5. Access Admin Panel

- URL: `http://localhost:8000/admin/`
- Login with the superuser credentials you created

## API Endpoints

### Customer Registration

- **POST** `/api/contacts/register/`
  - Register a new customer
  - Body: `{ "name": "string", "whatsapp": "string", "goal": "string (optional)", "city": "string (optional)" }`
  - Response: `{ "success": true, "message": "تم التسجيل بنجاح!", "id": 1 }`

- **GET** `/api/contacts/list/` (Admin only)
  - List all customer contacts

- **GET/POST/PUT/DELETE** `/api/contacts/admin/` (Admin only)
  - Full CRUD operations for contacts

### Video Management

- **GET** `/api/videos/hero/`
  - Get the hero video for the landing page
  - Response: Video object with `vimeo_id`, `video_url`, or `video_file_url`

- **GET** `/api/videos/active/`
  - Get all active videos
  - Query params: `?position=hero` (optional)

- **GET/POST/PUT/DELETE** `/api/videos/admin/` (Admin only)
  - Full CRUD operations for videos

## Adding a Hero Video

1. Go to Django admin: `http://localhost:8000/admin/`
2. Navigate to **Videos** section
3. Click **Add Video**
4. Fill in:
   - **Title**: Video title
   - **Vimeo ID**: If using Vimeo (e.g., "1133539416")
   - **Video URL**: Direct video URL (alternative)
   - **Video File**: Upload video file (alternative)
   - **Position**: Select "Hero Section"
   - **Is Active**: Check this box
   - **Order**: Set to 0 for first video
5. Click **Save**

## Environment Variables

Create a `.env` file in the `backend` directory (optional):

```
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

## Production Deployment

For production:

1. Set `DEBUG = False` in `settings.py`
2. Update `ALLOWED_HOSTS` with your domain
3. Set up proper database (PostgreSQL recommended)
4. Configure static files serving
5. Use environment variables for sensitive data
6. Set up SSL/HTTPS
7. Configure proper CORS origins

## File Structure

```
backend/
├── config/              # Django project settings
├── contacts/            # Customer registration app
│   ├── models.py        # CustomerContact model
│   ├── views.py         # API views
│   ├── serializers.py   # API serializers
│   └── admin.py         # Admin configuration
├── videos/              # Video management app
│   ├── models.py        # Video model
│   ├── views.py         # API views
│   ├── serializers.py   # API serializers
│   └── admin.py         # Admin configuration
├── requirements.txt     # Python dependencies
└── manage.py           # Django management script
```

