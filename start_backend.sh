#!/bin/bash

# Script to start Django backend server

cd "$(dirname "$0")"

# Activate virtual environment
source venv/bin/activate

# Navigate to backend directory
cd backend

# Run migrations (in case they haven't been run)
python manage.py migrate

# Start Django server
echo "Starting Django backend server..."
echo "Backend will be available at: http://localhost:8000"
echo "Admin panel: http://localhost:8000/admin/"
echo ""
python manage.py runserver

