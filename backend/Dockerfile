# Use the official Python image as the base image
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .
RUN pip install --upgrade pip
# Install the required packages
RUN pip install ffmpeg
RUN pip install --no-cache-dir -r requirements.txt

# Install gunicorn and uvicorn
RUN pip install --no-cache-dir gunicorn uvicorn

# Copy the rest of the application into the container
COPY . /app/

# Copy the entrypoint script into the container
COPY entrypoint.sh /app/

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# The command to run the application
CMD ["/app/entrypoint.sh"]

