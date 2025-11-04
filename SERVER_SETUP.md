# Server Setup Guide - Running PHP & Django Projects Together

This guide shows how to run your PHP project on port 80 and Django project on port 81 on the same server.

## Architecture

- **PHP Project**: Port 80 (default HTTP)
- **Django Project**: Port 81 (also accessible via domain with HTTPS on port 443)
- **Nginx**: Routes traffic to both projects

## Step 1: Update Nginx Configuration

1. **Backup your current nginx config:**
   ```bash
   sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
   ```

2. **Copy the new configuration:**
   ```bash
   sudo cp backend/nginx.conf /etc/nginx/nginx.conf
   ```

3. **Edit the configuration to match your paths:**
   ```bash
   sudo nano /etc/nginx/nginx.conf
   ```

   **Important settings to update:**
   - PHP project root: Change `/var/www/html` to your PHP project path
   - PHP-FPM socket: Change `php8.1-fpm.sock` to your PHP version (e.g., `php8.2-fpm.sock`)
   - Django static files path: Update `/home/salem/project/backend/config/staticfiles/` to your actual path
   - Django media files path: Update `/home/salem/project/backend/media/` to your actual path

4. **Test nginx configuration:**
   ```bash
   sudo nginx -t
   ```

5. **Reload nginx:**
   ```bash
   sudo systemctl reload nginx
   ```

## Step 2: Deploy Django Project

### Option A: Using Docker (Recommended)

1. **Navigate to your project directory:**
   ```bash
   cd /path/to/fx-global-landing-page
   ```

2. **Build and run:**
   ```bash
   docker-compose up -d --build
   ```

   This will:
   - Build the Docker image
   - Run Django on port 81 inside the container
   - Map it to port 81 on your server

3. **Check if it's running:**
   ```bash
   docker ps
   docker-compose logs -f
   ```

### Option B: Running Django Directly (Without Docker)

1. **Install dependencies:**
   ```bash
   cd /path/to/fx-global-landing-page/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Run migrations:**
   ```bash
   python manage.py migrate
   python manage.py collectstatic --noinput
   ```

3. **Run with Gunicorn:**
   ```bash
   gunicorn --bind 0.0.0.0:81 --workers 3 --timeout 120 config.wsgi:application
   ```

   **Or create a systemd service:**

   Create `/etc/systemd/system/fx-global.service`:
   ```ini
   [Unit]
   Description=FX Global Django App
   After=network.target

   [Service]
   User=www-data
   Group=www-data
   WorkingDirectory=/path/to/fx-global-landing-page/backend
   Environment="PATH=/path/to/fx-global-landing-page/backend/venv/bin"
   ExecStart=/path/to/fx-global-landing-page/backend/venv/bin/gunicorn \
       --workers 3 \
       --bind 0.0.0.0:81 \
       --timeout 120 \
       config.wsgi:application

   [Install]
   WantedBy=multi-user.target
   ```

   Then enable and start:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable fx-global
   sudo systemctl start fx-global
   ```

## Step 3: Update Nginx Proxy for Docker

If using Docker, you need to update the nginx `proxy_pass` URL:

**Option 1: Use Docker network (Recommended)**
- Create a docker network and update nginx config to use container name

**Option 2: Use localhost (Current setup)**
- Keep `proxy_pass http://127.0.0.1:81;` if Django container maps to host port 81

## Step 4: Firewall Configuration

Make sure ports are open:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 81/tcp
```

## Step 5: Verify Everything Works

1. **Test PHP project:**
   ```bash
   curl http://your-server-ip/
   # Or visit in browser: http://your-server-ip/
   ```

2. **Test Django project:**
   ```bash
   curl http://your-server-ip:81/
   # Or visit in browser: http://your-server-ip:81/
   # Or via domain: https://info.fxglobals.co/
   ```

3. **Check nginx status:**
   ```bash
   sudo systemctl status nginx
   ```

## Troubleshooting

### Django not accessible via port 81
- Check if Django is running: `docker ps` or `sudo systemctl status fx-global`
- Check if port 81 is open: `sudo netstat -tlnp | grep 81`
- Check Django logs: `docker-compose logs -f` or `journalctl -u fx-global -f`

### PHP not working
- Check PHP-FPM status: `sudo systemctl status php8.1-fpm` (adjust version)
- Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- Verify PHP-FPM socket path matches nginx config

### 502 Bad Gateway
- Django/Gunicorn might not be running
- Check if the proxy_pass URL in nginx is correct
- Check if the port is correct (81)

### Static files not loading
- Run: `python manage.py collectstatic --noinput`
- Check if static files path in nginx matches actual location
- Check file permissions: `sudo chown -R www-data:www-data /path/to/staticfiles`

## Directory Structure

```
/path/to/fx-global-landing-page/
├── backend/
│   ├── config/
│   │   ├── staticfiles/    # Generated static files
│   │   └── templates/
│   ├── media/              # Uploaded media files
│   └── db.sqlite3
└── docker-compose.yml
```

## Quick Commands Reference

```bash
# Django Docker
docker-compose up -d --build          # Start Django
docker-compose down                   # Stop Django
docker-compose logs -f                # View logs
docker-compose restart                # Restart

# Nginx
sudo nginx -t                         # Test config
sudo systemctl reload nginx          # Reload config
sudo systemctl restart nginx         # Restart nginx

# PHP-FPM
sudo systemctl restart php8.1-fpm    # Restart PHP (adjust version)

# Check services
sudo systemctl status nginx
sudo systemctl status php8.1-fpm
docker ps                             # If using Docker
```

## Notes

- Make sure your PHP project paths in nginx config match your actual server setup
- Update Django static/media file paths in nginx to match your deployment
- If using Docker, ensure the container exposes port 81 correctly
- Both projects can run simultaneously without conflicts
