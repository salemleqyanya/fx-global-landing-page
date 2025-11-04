# GitHub Setup Guide

Your repository is now ready to push to GitHub! Follow these steps:

## 📤 Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository:
   - Repository name: `fx-global-landing-page` (or your preferred name)
   - Description: "Landing page for FX Global Trading Academy with Django backend"
   - Choose **Private** (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
3. Click **Create repository**

## 📤 Step 2: Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add remote repository (replace with your username and repo name)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

Or if you prefer SSH:

```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## 🔒 Step 3: Secure Your Repository

### Important: Before pushing, verify these are NOT in the repository:

✅ **Already excluded** (in .gitignore):
- `venv/` - Virtual environment
- `node_modules/` - Node packages
- `db.sqlite3` - Database file
- `.env` - Environment variables
- `backend/media/` - Uploaded media files
- `build/` - Build output (optional to exclude)

### If you have sensitive data:

1. **Check for secrets**:
   ```bash
   git log --all --full-history --source -- "*secret*" "*password*" "*key*"
   ```

2. **Remove sensitive files from history** (if needed):
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/sensitive/file" \
     --prune-empty --tag-name-filter cat -- --all
   ```

## 📝 Step 4: Add Repository Description

After pushing, update your GitHub repository:
1. Go to repository Settings
2. Add description: "Django backend with React frontend for FX Global Trading Academy"
3. Add topics: `django`, `react`, `docker`, `trading`, `landing-page`

## 🔐 Step 5: Environment Variables (Important!)

Create a `.env.example` file for documentation:

```bash
# Create .env.example
cat > backend/.env.example << 'EOF'
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
EOF

git add backend/.env.example
git commit -m "Add environment variables example"
git push
```

## 📋 Step 6: Add GitHub Actions (Optional)

Create `.github/workflows/ci.yml` for automated testing:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          python manage.py test
```

## 🚀 Step 7: Deployment (Optional)

### Deploy to Heroku:

```bash
# Install Heroku CLI
heroku create your-app-name

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DEBUG=False
heroku config:set ALLOWED_HOSTS=your-app.herokuapp.com

# Deploy
git push heroku main
```

### Deploy to Railway, Render, or DigitalOcean:

Follow platform-specific documentation.

## ✅ Verification Checklist

Before making repository public:

- [ ] No `.env` files committed
- [ ] No `db.sqlite3` with real data
- [ ] No secrets in code
- [ ] `.gitignore` properly configured
- [ ] README.md is complete
- [ ] All sensitive data removed

## 📞 Quick Commands Reference

```bash
# View what will be pushed
git status

# View remote
git remote -v

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# Create new branch
git checkout -b feature/new-feature

# View commit history
git log --oneline
```

## 🎯 Next Steps

1. ✅ Push to GitHub
2. ✅ Add collaborators (if needed)
3. ✅ Set up branch protection rules
4. ✅ Configure GitHub Actions
5. ✅ Set up deployment pipeline

---

**Note**: Always keep your `.env` file and database files out of version control!

