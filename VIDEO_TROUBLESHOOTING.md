# Video Troubleshooting Guide

If videos are not showing on your server, follow these steps:

## 1. Check Video Files Exist

SSH into your server and verify videos exist:

```bash
# If using Docker
docker exec -it landing_page_backend ls -la /app/backend/media/videos/

# Or if running directly
ls -la /path/to/fx-global-landing-page/backend/media/videos/
```

## 2. Check File Permissions

Videos need to be readable by nginx:

```bash
# Set correct permissions
sudo chown -R www-data:www-data /path/to/backend/media/
sudo chmod -R 755 /path/to/backend/media/
```

For Docker volumes:
```bash
sudo chown -R www-data:www-data ./backend/media/
sudo chmod -R 755 ./backend/media/
```

## 3. Update Nginx Media Path

Edit nginx config and update the media path to match your actual server path:

```bash
sudo nano /etc/nginx/nginx.conf
```

Find these lines and update the path:
```nginx
location /media/ {
    alias /actual/path/to/backend/media/;  # Update this
    ...
}
```

**Common paths:**
- Docker volume: `/path/to/fx-global-landing-page/backend/media/`
- Direct deployment: `/home/user/project/backend/media/`

## 4. Test Media URL

Check if nginx can serve media files:

```bash
# Test from server
curl -I http://127.0.0.1:81/media/videos/your-video.mp4

# Or check browser console for 404 errors
```

## 5. Check Django Settings

Verify Django is configured correctly. In `backend/config/settings.py`:

```python
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

## 6. Check Video URLs in Database

Access Django shell to check video URLs:

```bash
# Using Docker
docker exec -it landing_page_backend python manage.py shell

# Then in Python shell:
from videos.models import Video
videos = Video.objects.filter(is_active=True)
for v in videos:
    print(f"{v.title}: {v.video_file}")
```

## 7. Test Video URL Directly

Try accessing the video URL directly:
- `http://your-server-ip:81/media/videos/filename.mov`
- `https://info.fxglobals.co/media/videos/filename.mov`

If you get 404, the path is wrong.
If you get 403, it's a permissions issue.
If you get 200, videos should work.

## 8. Check Nginx Error Logs

```bash
sudo tail -f /var/log/nginx/error.log
```

Look for errors when accessing videos.

## 9. Verify Docker Volume Mount

If using Docker, check `docker-compose.yml` has correct volume:

```yaml
volumes:
  - ./backend/media:/app/backend/media
```

Verify it's mounted:
```bash
docker exec -it landing_page_backend ls -la /app/backend/media/
```

## 10. Quick Fix Commands

Run these commands on your server:

```bash
# 1. Find where your media files actually are
find / -name "videos" -type d 2>/dev/null | grep media

# 2. Update nginx config with correct path
sudo nano /etc/nginx/nginx.conf
# Update the alias path in /media/ location block

# 3. Test nginx config
sudo nginx -t

# 4. Reload nginx
sudo systemctl reload nginx

# 5. Set permissions
sudo chown -R www-data:www-data /path/to/backend/media/
sudo chmod -R 755 /path/to/backend/media/
```

## 11. Common Issues

### Issue: Videos show "Your browser does not support the video tag"
**Solution:** The video URL is incorrect or file doesn't exist. Check video_file_url in the response.

### Issue: 404 Not Found
**Solution:** 
- Path in nginx `alias` doesn't match actual file location
- Check the actual path vs nginx config path

### Issue: 403 Forbidden
**Solution:**
- File permissions issue
- Run: `sudo chmod -R 755 /path/to/media/`

### Issue: Videos work on IP:81 but not on domain
**Solution:**
- Make sure HTTPS nginx block also has correct `/media/` location
- Check both HTTP (port 81) and HTTPS (port 443) server blocks

## 12. Debug Video URLs

Add this to your Django template temporarily to see the actual URLs:

```html
<!-- Debug info -->
{% if hero_video %}
    <p>Video URL: {{ hero_video.video_url }}</p>
    <p>Video File URL: {{ hero_video.video_file_url }}</p>
    <p>Vimeo ID: {{ hero_video.vimeo_id }}</p>
{% endif %}
```

Check browser console/network tab to see what URLs are being requested.

## Need Help?

If videos still don't work:
1. Check browser console for errors
2. Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify the exact path where videos are stored
4. Test accessing a video file directly via URL
