# Docker Setup Guide

This project is now configured to run entirely through Django backend with Docker support.

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# Build and start the container
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

The application will be available at: **http://localhost:8000**

### 2. Access Points

- **Landing Page**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin/
- **API Endpoints**: http://localhost:8000/api/

### 3. Create Superuser

```bash
# Run in the container
docker-compose exec web python manage.py createsuperuser

# Or create non-interactively
docker-compose exec web python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.get_or_create(username='admin', defaults={'email': 'admin@example.com', 'is_superuser': True, 'is_staff': True})[0].set_password('123'); User.objects.filter(username='admin').update(is_superuser=True, is_staff=True)"
```

### 4. Stop the Container

```bash
docker-compose down
```

## Development Workflow

### Rebuild After Changes

If you make changes to the React app:

```bash
# 1. Rebuild React app
npm run build

# 2. Rebuild Docker image
docker-compose up --build
```

If you make changes to Django backend:

```bash
# Just restart the container
docker-compose restart
```

### View Logs

```bash
docker-compose logs -f
```

### Run Django Commands

```bash
# Run migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser

# Collect static files
docker-compose exec web python manage.py collectstatic --noinput

# Django shell
docker-compose exec web python manage.py shell
```

## Docker Configuration

### Dockerfile

The Dockerfile:
- Uses Python 3.9 slim image
- Installs all Python dependencies
- Copies backend code and React build files
- Runs migrations and collects static files
- Uses Gunicorn to serve the application

### docker-compose.yml

- Maps port 8000 from container to host
- Persists database and media files in volumes
- Automatically runs migrations on startup
- Uses Gunicorn with 3 workers

## Production Deployment

For production, update `docker-compose.yml`:

```yaml
environment:
  - DEBUG=False
  - ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
  - SECRET_KEY=your-secret-key-here
```

### Environment Variables

Create a `.env` file for sensitive data:

```env
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
DATABASE_URL=postgresql://user:pass@db:5432/dbname
```

## Running Without Docker

If you prefer to run without Docker:

```bash
# 1. Activate virtual environment
source venv/bin/activate

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Build React app (if not already built)
npm run build

# 4. Run migrations
cd backend
python manage.py migrate

# 5. Collect static files
python manage.py collectstatic --noinput

# 6. Run server
python manage.py runserver
```

The app will be available at http://localhost:8000

## Troubleshooting

### Port Already in Use

If port 8000 is already in use, change it in `docker-compose.yml`:

```yaml
ports:
  - "8001:8000"  # Use 8001 on host, 8000 in container
```

### Static Files Not Loading

```bash
# Rebuild and collect static files
docker-compose exec web python manage.py collectstatic --noinput
docker-compose restart
```

### Database Issues

```bash
# Reset database (WARNING: This deletes all data)
docker-compose down -v
docker-compose up --build
```

### Build Errors

```bash
# Clean build
docker-compose down
docker system prune -f
docker-compose up --build
```

## File Structure

```
.
├── Dockerfile              # Docker image configuration
├── docker-compose.yml      # Docker Compose configuration
├── .dockerignore           # Files to exclude from Docker build
├── backend/                # Django backend
│   ├── config/            # Django settings
│   ├── contacts/          # Customer registration app
│   └── videos/            # Video management app
├── build/                  # React build output (served by Django)
└── src/                    # React source code
```

## Notes

- The React app is built and served entirely through Django
- No separate frontend server is needed
- All API calls are made to the same origin (`/api/`)
- Static files are served by WhiteNoise middleware
- Media files are stored in `backend/media/` directory

