#!/bin/sh

# Run Django's collectstatic command
python manage.py collectstatic 

# Start the application using Gunicorn and Uvicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker config.wsgi:application --bind 0.0.0.0:8000

