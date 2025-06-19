# GitHub Repository Setup Instructions

## 1. Repository Configuration

Replace `YOUR_USERNAME` in the following files with your actual GitHub username:

### package.json
- Line 5: `"homepage": "https://github.com/YOUR_USERNAME/budgeting-app#readme"`
- Line 7: `"url": "https://github.com/YOUR_USERNAME/budgeting-app/issues"`
- Line 11: `"url": "git+https://github.com/YOUR_USERNAME/budgeting-app.git"`
- Line 69: `"owner": "YOUR_USERNAME"`

## 2. GitHub Repository Setup

1. Create a new repository on GitHub named `budgeting-app`
2. Push your code to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/budgeting-app.git
   git push -u origin main
   ```

## 3. GitHub Token Configuration

Your provided token: `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`

### Required Token Permissions:
- Contents: Read and write
- Metadata: Read
- Actions: Read
- Issues: Read and write
- Pull requests: Read and write

## 4. GitHub Actions Secrets

Add the following secret to your repository:
1. Go to your repository on GitHub
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `GH_TOKEN`
5. Value: Your personal access token (provided above)

## 5. Automatic Builds

The GitHub Actions workflow will automatically:
- Build for Windows, Mac, and Linux when you push to main branch
- Create releases when you push tags (e.g., `git tag v1.0.2 && git push --tags`)
- Upload all build artifacts to the release

## 6. Creating a Release

To create a new release:
1. Update version in `package.json`
2. Commit changes: `git commit -am "Version 1.0.2"`
3. Create and push tag: `git tag v1.0.2 && git push --tags`
4. GitHub Actions will automatically build and create the release

## 7. Auto-Updater Features

- ✅ Checks for updates on app startup
- ✅ Checks for updates every 4 hours
- ✅ Manual update check via Help menu
- ✅ Cross-platform support (Windows, Mac, Linux)
- ✅ User-friendly update notifications
- ✅ Background downloads
- ✅ One-click installation

## 8. Testing Updates

1. Build current version: `npm run build:all`
2. Install the built app
3. Update version in package.json
4. Create new release on GitHub
5. The installed app will detect and offer the update

## Next Steps

1. Replace `YOUR_USERNAME` with your actual GitHub username
2. Create the GitHub repository
3. Push your code
4. Set up the GitHub token as a secret
5. Test the workflow by creating a release
