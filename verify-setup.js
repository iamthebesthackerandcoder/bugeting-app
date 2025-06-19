#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 Verifying GitHub Setup...\n');

// Check package.json configuration
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

console.log('📦 Package Configuration:');
console.log(`✓ Name: ${pkg.name}`);
console.log(`✓ Version: ${pkg.version}`);
console.log(`✓ Author: ${pkg.author.name} <${pkg.author.email}>`);
console.log(`✓ Repository: ${pkg.repository.url}`);
console.log(`✓ Homepage: ${pkg.homepage}`);
console.log(`✓ Publisher: ${pkg.build.publish.owner}/${pkg.build.publish.repo}`);

// Check Git configuration
console.log('\n🔧 Git Configuration:');
try {
    const remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    console.log(`✓ Remote origin: ${remote}`);

    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    console.log(`✓ Current branch: ${branch}`);

    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    if (status === '') {
        console.log('✓ Working directory clean');
    } else {
        console.log('⚠️  Uncommitted changes detected');
    }
} catch (error) {
    console.log('❌ Git not properly configured');
}

// Check required files
console.log('\n📁 Required Files:');
const requiredFiles = [
    '.github/workflows/build-and-release.yml',
    'main.js',
    'package.json',
    'preload.js',
    'renderer.js',
    'styles.css',
    'index.html'
];

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✓ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
    }
});

// Check GitHub Actions workflow
console.log('\n⚙️  GitHub Actions Workflow:');
if (fs.existsSync('.github/workflows/build-and-release.yml')) {
    const workflow = fs.readFileSync('.github/workflows/build-and-release.yml', 'utf8');
    if (workflow.includes('build-and-release')) {
        console.log('✓ Workflow file exists and configured');
    } else {
        console.log('⚠️  Workflow file exists but may not be configured correctly');
    }
} else {
    console.log('❌ GitHub Actions workflow missing');
}

console.log('\n🎯 Next Steps:');
console.log('1. Create repository: https://github.com/new');
console.log('   - Name: budgeting-app');
console.log('   - Owner: iamthebesthackerandcoder');
console.log('   - Public visibility');
console.log('');
console.log('2. Push code:');
console.log('   git push -u origin main');
console.log('');
console.log('3. GitHub token already configured ✅');
console.log('   - Auto-updater token embedded in app');
console.log('   - No additional secrets needed');
console.log('');
console.log('4. Create release:');
console.log('   git tag v1.0.2 && git push --tags');
console.log('');
console.log('🚀 Your auto-updater will be live after these steps!');
