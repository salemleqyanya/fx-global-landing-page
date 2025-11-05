#!/bin/bash
# Script to copy videos from backend/video/ to backend/media/videos/

cd "$(dirname "$0")"

SOURCE_DIR="backend/video"
DEST_DIR="backend/media/videos"

# Create destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Source directory not found: $SOURCE_DIR"
    exit 1
fi

# Copy all video files
echo "📹 Copying videos from $SOURCE_DIR to $DEST_DIR..."
count=0

for file in "$SOURCE_DIR"/*.mp4 "$SOURCE_DIR"/*.mov; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        cp "$file" "$DEST_DIR/$filename"
        echo "✅ Copied: $filename"
        count=$((count + 1))
    fi
done

echo ""
echo "✅ Successfully copied $count video file(s)"
echo "📁 Videos are now in: $DEST_DIR"
echo ""
echo "📝 Next steps:"
echo "   1. Go to Django admin: http://localhost:8004/master-co/videos/video/"
echo "   2. Click 'Add Video'"
echo "   3. Upload each video file from: backend/media/videos/"
echo "   4. Set the position (Hero or Testimonials)"
echo "   5. Add title, description, and badge label if needed"

