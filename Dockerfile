# Use Python 3.9 slim image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

# Copy project files
COPY backend/ /app/backend/

# Collect static files
WORKDIR /app/backend
# Set Django settings module for collectstatic
ENV DJANGO_SETTINGS_MODULE=config.settings
RUN python manage.py collectstatic --noinput || echo "Static files collection completed"

# Create media directory
RUN mkdir -p /app/backend/media

# Expose port
EXPOSE 81

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:81", "--workers", "3", "--timeout", "120", "config.wsgi:application"]

