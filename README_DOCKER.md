# Landing Page - Backend Only with Docker

This project has been converted to run entirely through Django backend with Docker support. The React frontend is built and served by Django.

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Build and start
docker-compose up --build

# Access at http://localhost:8000
```

### Without Docker

```bash
# 1. Build React app
npm run build

# 2. Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# 3. Run migrations
cd backend
python manage.py migrate
python manage.py collectstatic --noinput

# 4. Start server
python manage.py runserver
```

## 📁 Project Structure

```
.
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose setup
├── .dockerignore           # Docker ignore patterns
├── backend/                # Django backend
│   ├── config/            # Django settings
│   ├── contacts/          # Registration API
│   ├── videos/            # Video management API
│   └── manage.py
├── build/                  # React build (served by Django)
└── src/                    # React source code
```

## 🔧 Key Changes

1. **Backend-Only**: React app is built and served entirely through Django
2. **Docker Support**: Full Docker setup with docker-compose
3. **API Integration**: API calls use relative paths (`/api/`)
4. **Static Files**: Served by WhiteNoise middleware
5. **Production Ready**: Gunicorn configured for production

## 🌐 Access Points

- **Landing Page**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin/
- **API**: http://localhost:8000/api/

## 📝 Admin Credentials

Default superuser:
- Username: `admin`
- Password: `123`

Create new superuser:
```bash
docker-compose exec web python manage.py createsuperuser
```

## 🔄 Development Workflow

### Update React App

```bash
# 1. Make changes to React code
# 2. Rebuild
npm run build

# 3. Restart Docker
docker-compose restart
```

### Update Django Backend

```bash
# Just restart (no rebuild needed)
docker-compose restart
```

### View Logs

```bash
docker-compose logs -f
```

## 📦 Docker Commands

```bash
# Start
docker-compose up

# Start in background
docker-compose up -d

# Stop
docker-compose down

# Rebuild
docker-compose up --build

# View logs
docker-compose logs -f

# Execute commands
docker-compose exec web python manage.py <command>
```

## 🐛 Troubleshooting

### Port Already in Use
Change port in `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"
```

### Static Files Not Loading
```bash
docker-compose exec web python manage.py collectstatic --noinput
docker-compose restart
```

### Database Reset
```bash
docker-compose down -v
docker-compose up --build
```

## 📚 Documentation

- `DOCKER_SETUP.md` - Detailed Docker setup guide
- `BACKEND_SETUP.md` - Backend setup instructions
- `PROJECT_SUMMARY.md` - Project overview

## 🎯 Features

- ✅ Customer registration API
- ✅ Video management API
- ✅ Django admin interface
- ✅ React frontend served by Django
- ✅ Docker containerization
- ✅ Production-ready configuration

