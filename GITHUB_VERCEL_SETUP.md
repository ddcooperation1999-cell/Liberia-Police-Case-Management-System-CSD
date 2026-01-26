# 📌 Git & GitHub Setup for Vercel Deployment

## Prerequisites
- Git installed
- GitHub account
- VS Code or terminal access

---

## Step 1: Initialize Git Repository

```bash
cd c:\Users\user\Desktop\LNPMS

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial LNPMS deployment setup - All 17 features ready"
```

---

## Step 2: Create GitHub Repository

### Option A: Web UI
1. Go to https://github.com/new
2. Create new repository named `lnpms`
3. Do NOT initialize with README (we have one)
4. Click "Create repository"

### Option B: GitHub CLI
```bash
# Install GitHub CLI: https://cli.github.com
gh repo create lnpms --public

# Follow prompts and choose:
# ? This will add an 'origin' remote to the local repository
# ? Authenticate with: HTTPS
```

---

## Step 3: Connect Local Repository to GitHub

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/lnpms.git

# Verify connection
git remote -v
# Output should show:
# origin  https://github.com/YOUR_USERNAME/lnpms.git (fetch)
# origin  https://github.com/YOUR_USERNAME/lnpms.git (push)

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 4: Create .gitignore

Already created, but verify it includes:
```
node_modules/
.env
.env.local
*.db
*.db-shm
*.db-wal
.DS_Store
.vscode/
.idea/
logs/
dist/
build/
*.log
```

---

## Step 5: Configure GitHub for Vercel Integration

### Connect Vercel to GitHub:
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Click "Import Git Repository"
4. Select your GitHub account
5. Search for and select `lnpms` repository
6. Click "Import"

### Configure Build Settings:
- **Framework**: Node.js
- **Build Command**: `npm install`
- **Output Directory**: Leave blank
- **Install Command**: `npm install`

### Environment Variables:
Add in Vercel Project Settings:
```
JWT_SECRET=your_secret_here
DATABASE_URL=postgresql://...
FRONTEND_URL=https://your-app.vercel.app
```

---

## Step 6: Push Changes to Deploy

Every time you push to GitHub, Vercel automatically:
1. ✅ Triggers a new build
2. ✅ Runs npm install
3. ✅ Starts backend server
4. ✅ Deploys to staging
5. ✅ (Optional) Deploy to production with `--prod`

```bash
# Make changes
echo "Added feature X" >> CHANGELOG.md

# Commit changes
git add .
git commit -m "feat: added feature X"

# Push to GitHub (triggers Vercel deployment)
git push origin main

# Check deployment status at https://vercel.com/dashboard
```

---

## Step 7: Managing Branches for Staging

```bash
# Create staging branch
git checkout -b staging

# Push staging branch
git push -u origin staging

# In Vercel Dashboard:
# - Connect `main` branch to Production
# - Connect `staging` branch to Staging environment
```

---

## Useful Git Commands

```bash
# Check status
git status

# View commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# View current branches
git branch -a

# Switch branch
git checkout branch-name

# Delete branch locally
git branch -d branch-name

# Delete branch on GitHub
git push origin --delete branch-name

# Pull latest changes
git pull origin main

# View changes before committing
git diff
```

---

## CI/CD Pipeline with GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Deploy to Vercel
        run: npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## Deployment Workflow Summary

```
┌─────────────────┐
│ Make Changes    │
│ Locally         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ git add .       │
│ git commit      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ git push        │ ◄────── Automatically triggers Vercel build
│ to GitHub       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │ ◄────── Optional: Run tests
│ (Optional)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Vercel Build    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Deploy to       │
│ Production      │
└─────────────────┘
```

---

## Security Best Practices

### ✅ DO:
- Use `git status` before committing
- Review changes with `git diff`
- Use meaningful commit messages
- Push frequently
- Keep .env in .gitignore

### ❌ DON'T:
- Commit sensitive data (passwords, keys)
- Commit large files (database backups)
- Force push to main branch
- Commit without testing first
- Share GitHub tokens publicly

---

## Troubleshooting Git Issues

### Issue: "fatal: not a git repository"
```bash
cd c:\Users\user\Desktop\LNPMS
git init
```

### Issue: "Permission denied (publickey)"
```bash
# Generate new SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to GitHub: https://github.com/settings/ssh/new
```

### Issue: Merge conflicts
```bash
# View conflicts
git diff

# Resolve manually, then:
git add .
git commit -m "Resolved merge conflict"
git push origin main
```

---

## Status Check

Run to verify setup:

```bash
cd c:\Users\user\Desktop\LNPMS

# Check git status
git status

# Check remote configuration
git remote -v

# Check recent commits
git log --oneline -5

# Verify .gitignore
cat .gitignore

# Check for uncommitted changes
git diff
```

---

## Next Steps

1. ✅ Initialize Git: `git init`
2. ✅ Create GitHub repository
3. ✅ Connect: `git remote add origin https://...`
4. ✅ Push: `git push -u origin main`
5. ✅ Connect to Vercel
6. ✅ Set environment variables
7. ✅ Monitor deployment

---

**Setup Date:** January 26, 2026  
**Status:** Ready for GitHub & Vercel Integration  
**LNPMS Version:** 4.0 Professional Edition
