#!/usr/bin/env node

/**
 * Pre-Deployment Verification Script
 * Run this before deploying to Render.com to catch common issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 BIMS Backend - Pre-Deployment Verification\n');
console.log('='.repeat(50));

let hasErrors = false;
let hasWarnings = false;

// Check 1: package.json exists and has correct scripts
console.log('\n✓ Checking package.json...');
try {
    const packageJson = require('./package.json');

    if (!packageJson.scripts || !packageJson.scripts.start) {
        console.error('❌ ERROR: package.json missing "start" script');
        hasErrors = true;
    } else if (packageJson.scripts.start !== 'node server.js') {
        console.warn('⚠️  WARNING: start script should be "node server.js"');
        hasWarnings = true;
    } else {
        console.log('   ✓ Start script is correct');
    }

    // Check dependencies
    const requiredDeps = ['express', 'mongoose', 'dotenv', 'cors', 'jsonwebtoken'];
    const missing = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

    if (missing.length > 0) {
        console.error(`❌ ERROR: Missing dependencies: ${missing.join(', ')}`);
        hasErrors = true;
    } else {
        console.log('   ✓ All required dependencies present');
    }
} catch (error) {
    console.error('❌ ERROR: Cannot read package.json');
    hasErrors = true;
}

// Check 2: server.js exists
console.log('\n✓ Checking server.js...');
if (!fs.existsSync('./server.js')) {
    console.error('❌ ERROR: server.js not found');
    hasErrors = true;
} else {
    console.log('   ✓ server.js exists');

    // Check if it uses process.env.PORT
    const serverContent = fs.readFileSync('./server.js', 'utf8');
    if (!serverContent.includes('process.env.PORT')) {
        console.warn('⚠️  WARNING: server.js should use process.env.PORT');
        hasWarnings = true;
    } else {
        console.log('   ✓ Uses process.env.PORT');
    }
}

// Check 3: .env.example exists
console.log('\n✓ Checking .env.example...');
if (!fs.existsSync('./.env.example')) {
    console.warn('⚠️  WARNING: .env.example not found (recommended)');
    hasWarnings = true;
} else {
    console.log('   ✓ .env.example exists');
}

// Check 4: .gitignore exists and includes .env
console.log('\n✓ Checking .gitignore...');
if (!fs.existsSync('./.gitignore')) {
    console.error('❌ ERROR: .gitignore not found');
    hasErrors = true;
} else {
    const gitignore = fs.readFileSync('./.gitignore', 'utf8');
    if (!gitignore.includes('.env')) {
        console.error('❌ ERROR: .gitignore should include .env');
        hasErrors = true;
    } else {
        console.log('   ✓ .gitignore includes .env');
    }

    if (!gitignore.includes('node_modules')) {
        console.error('❌ ERROR: .gitignore should include node_modules');
        hasErrors = true;
    } else {
        console.log('   ✓ .gitignore includes node_modules');
    }
}

// Check 5: Required directories exist
console.log('\n✓ Checking directory structure...');
const requiredDirs = ['config', 'routes', 'models', 'controllers'];
requiredDirs.forEach(dir => {
    if (!fs.existsSync(`./${dir}`)) {
        console.warn(`⚠️  WARNING: ${dir}/ directory not found`);
        hasWarnings = true;
    } else {
        console.log(`   ✓ ${dir}/ exists`);
    }
});

// Check 6: uploads directory
if (!fs.existsSync('./uploads')) {
    console.warn('⚠️  WARNING: uploads/ directory not found');
    hasWarnings = true;
} else {
    console.log('   ✓ uploads/ exists');
}

// Check 7: Environment variables (if .env exists)
console.log('\n✓ Checking environment variables...');
if (fs.existsSync('./.env')) {
    require('dotenv').config();

    const requiredEnvVars = [
        'MONGO_URI_ATLAS',
        'JWT_SECRET',
        'CHAPA_SECRET_KEY'
    ];

    requiredEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
            console.warn(`⚠️  WARNING: ${envVar} not set in .env`);
            hasWarnings = true;
        } else {
            console.log(`   ✓ ${envVar} is set`);
        }
    });
} else {
    console.log('   ℹ️  .env not found (will use Render environment variables)');
}

// Check 8: render.yaml exists
console.log('\n✓ Checking Render configuration...');
if (!fs.existsSync('./render.yaml')) {
    console.warn('⚠️  WARNING: render.yaml not found (optional but recommended)');
    hasWarnings = true;
} else {
    console.log('   ✓ render.yaml exists');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 VERIFICATION SUMMARY\n');

if (hasErrors) {
    console.error('❌ ERRORS FOUND - Please fix before deploying!');
    process.exit(1);
} else if (hasWarnings) {
    console.warn('⚠️  WARNINGS FOUND - Review before deploying');
    console.log('\n✅ No critical errors - You can proceed with deployment');
    process.exit(0);
} else {
    console.log('✅ ALL CHECKS PASSED - Ready to deploy!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Push code to GitHub');
    console.log('   2. Create Web Service on Render.com');
    console.log('   3. Add environment variables');
    console.log('   4. Deploy!');
    console.log('\n📚 See QUICK_DEPLOY.md for instructions');
    process.exit(0);
}
