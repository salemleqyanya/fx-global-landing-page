# Ramadan Campaign Landing Page - Web Version

This is the vanilla HTML/CSS/JavaScript version of the Ramadan Campaign Landing Page.

## Files Structure

```
web/
├── index.html          # Landing page (redirects to phase1.html)
├── phase1.html         # Phase 1: Teasing page
├── phase2.html         # Phase 2: Main Campaign page
├── phase1.js           # JavaScript for Phase 1
├── phase2.js           # JavaScript for Phase 2
├── styles.css          # All CSS styles
├── script.js           # Original combined script (for reference)
├── assets/             # Images and other assets
└── README.md           # This file
```

## Features

### Phase 1: Teasing Phase
- Night sky background with animated stars
- Decorative lanterns and crescent moon
- Islamic pattern overlays
- Mosque silhouette
- Countdown timer to Ramadan
- Registration form with validation
- Success message after submission

### Phase 2: Main Campaign
- Enhanced night sky with gold dust particles
- Dual prizes display (iPhone 17 Pro Max & $100K Funded Account)
- How it works section
- Membership and Bundle plans
- VIP Telegram channel section
- Trust section with draw details
- Final CTA buttons

### Phase Toggle
- Toggle button in the top-left corner
- Switch between Phase 1 and Phase 2
- Smooth transitions

## How to Use

1. **Open the website:**
   - Simply open `phase1.html` or `phase2.html` in a web browser
   - Or serve it using a local web server

2. **Using a local server (recommended):**
   ```bash
   cd web
   # Using Python 3
   python -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js (with http-server)
   npx http-server
   ```
   Then open `http://localhost:8000` in your browser

3. **Navigation:**
   - **Phase 1** (`phase1.html`): Teasing phase with registration form
   - **Phase 2** (`phase2.html`): Main campaign with prizes and plans
   - Use the navigation button in the top-left corner to switch between pages
   - `index.html` automatically redirects to `phase1.html`

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- RTL (Right-to-Left) support for Arabic text

## Customization

### Changing Dates
Edit the dates in `script.js`:
- `ramadanStartDate`: Phase 1 countdown target
- `drawDate`: Phase 2 countdown target

### Styling
All styles are in `styles.css`. You can customize:
- Colors
- Fonts
- Spacing
- Animations

### Content
Edit the HTML in `index.html` or modify the content dynamically in `script.js` for Phase 2.

## Notes

- All images should be placed in the `assets/` folder
- The form submission is currently simulated (shows success message after 1.5 seconds)
- To connect to a real backend, modify the form submission handler in `script.js`
- The countdown timers update every second automatically

## Assets

Make sure all image assets are in the `assets/` folder:
- iPhone images (for Phase 2)
- FTMO image (for VIP section)
- Any other images referenced in the code

## Support

For issues or questions, refer to the original React project structure for reference.
