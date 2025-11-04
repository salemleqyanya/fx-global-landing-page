# Docker Setup Guide

This project is now configured to run entirely through Django backend with Docker support.

## Installing Docker on Your Server

### For Ubuntu/Debian

1. **Update your system:**
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```

2. **Install required packages:**
   ```bash
   sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
   ```

3. **Add Docker's official GPG key:**
   ```bash
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
   ```

4. **Add Docker repository:**
   ```bash
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   ```

5. **Install Docker Engine:**
   ```bash
   sudo apt update
   sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   ```

6. **Start and enable Docker:**
   ```bash
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

7. **Add your user to docker group (to run Docker without sudo):**
   ```bash
   sudo usermod -aG docker $USER
   ```
   **Note:** You'll need to log out and log back in for this to take effect.

8. **Verify installation:**
   ```bash
   docker --version
   docker compose version
   ```

### For CentOS/RHEL/Fedora

1. **Remove old versions (if any):**
   ```bash
   sudo yum remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine
   ```

2. **Install required packages:**
   ```bash
   sudo yum install -y yum-utils
   ```

3. **Add Docker repository:**
   ```bash
   sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
   ```

4. **Install Docker:**
   ```bash
   sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   ```

5. **Start and enable Docker:**
   ```bash
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

6. **Add your user to docker group:**
   ```bash
   sudo usermod -aG docker $USER
   ```

7. **Verify installation:**
   ```bash
   docker --version
   docker compose version
   ```

### Alternative: Quick Install Script (Ubuntu/Debian)

If you prefer a quick one-liner:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**Remember to log out and log back in after adding your user to the docker group.**

### Verify Docker Installation

Test that Docker is working correctly:

```bash
docker run hello-world
```

You should see a message indicating Docker is working properly.

---

## Quick Start

### 1. Build and Run with Docker Compose

```bash
# Build and start the container
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

The application will be available at: **http://localhost:81**

### 2. Access Points

- **Landing Page**: http://localhost:81
- **Admin Panel**: http://localhost:81/admin/
- **API Endpoints**: http://localhost:81/api/

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

- Maps port 81 from container to host
- Persists database and media files in volumes
- Automatically runs migrations on startup
- Uses Gunicorn with 3 workers on port 81

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

The app will be available at http://localhost:81

## Troubleshooting

### Port Already in Use

If port 81 is already in use, change it in `docker-compose.yml`:

```yaml
ports:
  - "82:81"  # Use 82 on host, 81 in container
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

