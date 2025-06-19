#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get username and email from command line arguments
const username = process.argv[2];
const email = process.argv[3];
const name = process.argv[4];

if (!username || !email) {
    console.error('Usage: node setup-github.js <username> <email> [name]');
    console.error('Example: node setup-github.js johndoe john@example.com "John Doe"');
    process.exit(1);
}

console.log(`Setting up GitHub configuration for username: ${username}`);

// Files to update
const filesToUpdate = [
    {
        file: 'package.json',
        replacements: [
            {
                search: '"homepage": "https://github.com/YOUR_USERNAME/budgeting-app#readme"',
                replace: `"homepage": "https://github.com/${username}/budgeting-app#readme"`
            },
            {
                search: '"url": "https://github.com/YOUR_USERNAME/budgeting-app/issues"',
                replace: `"url": "https://github.com/${username}/budgeting-app/issues"`
            },
            {
                search: '"url": "git+https://github.com/YOUR_USERNAME/budgeting-app.git"',
                replace: `"url": "git+https://github.com/${username}/budgeting-app.git"`
            },
            {
                search: '"owner": "YOUR_USERNAME"',
                replace: `"owner": "${username}"`
            },
            {
                search: '"email": "your.email@example.com"',
                replace: `"email": "${email}"`
            },
            {
                search: '"name": "Your Name"',
                replace: `"name": "${name || username}"`
            }
        ]
    }
];

// Update files
filesToUpdate.forEach(({ file, replacements }) => {
    const filePath = path.join(__dirname, file);

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${file}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    replacements.forEach(({ search, replace }) => {
        if (content.includes(search)) {
            content = content.replace(search, replace);
            updated = true;
            console.log(`✓ Updated ${file}: ${search} → ${replace}`);
        }
    });

    if (updated) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Saved ${file}`);
    } else {
        console.log(`- No changes needed in ${file}`);
    }
});

console.log('\n🎉 GitHub configuration updated successfully!');
console.log('\nNext steps:');
console.log('1. Create a repository on GitHub named "budgeting-app"');
console.log('2. Run: git init && git add . && git commit -m "Initial commit"');
console.log('3. Run: git branch -M main');
console.log(`4. Run: git remote add origin https://github.com/${username}/budgeting-app.git`);
console.log('5. Run: git push -u origin main');
console.log('6. Add your GitHub token as a secret named GH_TOKEN in repository settings');
console.log('7. Create a release by pushing a tag: git tag v1.0.1 && git push --tags');
