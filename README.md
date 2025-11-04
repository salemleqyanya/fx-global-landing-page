# FX Global Trading Academy - Landing Page

A modern landing page for FX Global Trading Academy with Django backend and React frontend, fully containerized with Docker.

## 🚀 Features

- **Customer Registration System**: Collect customer information through registration forms
- **Video Management**: Manage videos for the landing page (Vimeo, direct URLs, or file uploads)
- **Django Admin Panel**: Full admin interface for managing content
- **React Frontend**: Modern, responsive landing page
- **Docker Support**: Easy deployment with Docker and Docker Compose
- **REST API**: Complete API for customer registration and video management

## 🛠️ Tech Stack

- **Backend**: Django 4.2, Django REST Framework
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Database**: SQLite (development), PostgreSQL-ready (production)
- **Deployment**: Docker, Gunicorn, WhiteNoise

## 📦 Installation

### Prerequisites

- Python 3.9+
- Node.js 16+
- Docker & Docker Compose (optional)

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/salemleqyanya/fx-global-landing-page.git
cd fx-global-landing-page

# Build and start
docker-compose up --build

# Access at http://localhost:8000
```

### Manual Installation

```bash
# 1. Setup Python environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install Python dependencies
cd backend
pip install -r requirements.txt

# 3. Setup database
python manage.py migrate
python manage.py createsuperuser

# 4. Build React app
cd ..
npm install
npm run build

# 5. Collect static files
cd backend
python manage.py collectstatic --noinput

# 6. Run server
python manage.py runserver
```

## 📁 Project Structure

```
.
├── backend/              # Django backend
│   ├── config/          # Django settings
│   ├── contacts/        # Customer registration app
│   ├── videos/          # Video management app
│   └── manage.py
├── src/                  # React frontend source
│   ├── api/             # API client
│   ├── components/      # React components
│   └── assets/          # Static assets
├── build/                # React build output
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose setup
└── README.md            # This file
```

## 🌐 Access Points

- **Landing Page**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin/
- **API Documentation**: http://localhost:8000/api/

## 🔑 Default Admin Credentials

- Username: `admin`
- Password: `123` (Change in production!)

## 📚 API Endpoints

### Customer Registration
- `POST /api/contacts/register/` - Register a new customer

### Video Management
- `GET /api/videos/hero/` - Get hero video
- `GET /api/videos/active/` - Get all active videos

See `backend/README.md` for complete API documentation.

## 🐳 Docker Commands

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# Rebuild
docker-compose up --build

# View logs
docker-compose logs -f

# Execute commands
docker-compose exec web python manage.py <command>
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Adding Videos

1. Go to Admin Panel → Videos
2. Add a new video with:
   - Vimeo ID (e.g., `1133539416`)
   - Position: "Hero Section"
   - Is Active: ✓

Or use the script:
```bash
cd backend
python add_video.py
```

## 📖 Documentation

- `DOCKER_SETUP.md` - Detailed Docker setup guide
- `BACKEND_SETUP.md` - Backend setup instructions
- `PROJECT_SUMMARY.md` - Project overview
- `CONVERSION_SUMMARY.md` - Backend conversion details

## 🚀 Deployment

### Production Checklist

- [ ] Set `DEBUG = False` in settings
- [ ] Update `ALLOWED_HOSTS` with your domain
- [ ] Use PostgreSQL instead of SQLite
- [ ] Set up proper SSL/HTTPS
- [ ] Configure environment variables
- [ ] Change default admin password
- [ ] Set up static file serving (CDN recommended)
- [ ] Configure database backups

### Docker Production

```bash
# Update docker-compose.yml with production settings
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 👥 Contact

For questions or support, please contact the development team.

## 🙏 Acknowledgments

- Django for the excellent web framework
- React for the frontend library
- Vimeo for video hosting
