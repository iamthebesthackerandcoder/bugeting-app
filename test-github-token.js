#!/usr/bin/env node

/**
 * Test script to verify GitHub token configuration
 * Run this locally to test if your token works
 */

const https = require('https');
require('dotenv').config();

const token = process.env.GH_TOKEN;
const owner = 'iamthebesthackerandcoder';
const repo = 'bugeting-app';

console.log('🔍 Testing GitHub Token Configuration...\n');

if (!token) {
    console.error('❌ No GH_TOKEN found in .env file');
    console.log('Please add your GitHub token to the .env file:');
    console.log('GH_TOKEN=your_github_token_here');
    process.exit(1);
}

console.log('✅ GH_TOKEN found in .env file');
console.log(`Token: ${token.substring(0, 20)}...${token.substring(token.length - 10)}`);

// Test API access
const options = {
    hostname: 'api.github.com',
    path: `/repos/${owner}/${repo}`,
    method: 'GET',
    headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Budgeting-App-Test',
        'Accept': 'application/vnd.github.v3+json'
    }
};

console.log(`\n🌐 Testing API access to: ${owner}/${repo}`);

const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        if (res.statusCode === 200) {
            const repoData = JSON.parse(data);
            console.log('✅ GitHub API access successful!');
            console.log(`Repository: ${repoData.full_name}`);
            console.log(`Private: ${repoData.private}`);
            console.log(`Permissions: Push=${repoData.permissions?.push}, Admin=${repoData.permissions?.admin}`);
            
            // Test releases endpoint
            testReleasesAccess();
        } else if (res.statusCode === 404) {
            console.error('❌ Repository not found or token lacks access');
            console.log('Make sure:');
            console.log('1. Repository exists: https://github.com/iamthebesthackerandcoder/bugeting-app');
            console.log('2. Token has "repo" or "public_repo" permissions');
            console.log('3. Token belongs to a user with access to the repository');
        } else if (res.statusCode === 401) {
            console.error('❌ Authentication failed - invalid token');
            console.log('Please check your GitHub token and regenerate if necessary');
        } else {
            console.error(`❌ API request failed with status: ${res.statusCode}`);
            console.log('Response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Network error:', error.message);
});

req.end();

function testReleasesAccess() {
    const releaseOptions = {
        hostname: 'api.github.com',
        path: `/repos/${owner}/${repo}/releases`,
        method: 'GET',
        headers: {
            'Authorization': `token ${token}`,
            'User-Agent': 'Budgeting-App-Test',
            'Accept': 'application/vnd.github.v3+json'
        }
    };

    console.log('\n📦 Testing releases access...');

    const releaseReq = https.request(releaseOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            if (res.statusCode === 200) {
                const releases = JSON.parse(data);
                console.log('✅ Releases access successful!');
                console.log(`Found ${releases.length} releases`);
                if (releases.length > 0) {
                    console.log(`Latest release: ${releases[0].tag_name} (${releases[0].name})`);
                }
            } else {
                console.error(`❌ Releases access failed with status: ${res.statusCode}`);
            }
            
            console.log('\n🎉 Token test complete!');
            console.log('\nNext steps:');
            console.log('1. Add this token as GH_TOKEN secret in your GitHub repository');
            console.log('2. Go to: https://github.com/iamthebesthackerandcoder/bugeting-app/settings/secrets/actions');
            console.log('3. Create new secret: GH_TOKEN');
            console.log('4. Push a new tag to test the workflow');
        });
    });

    releaseReq.on('error', (error) => {
        console.error('❌ Releases test error:', error.message);
    });

    releaseReq.end();
}
