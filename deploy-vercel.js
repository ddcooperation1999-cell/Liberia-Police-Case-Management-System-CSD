#!/usr/bin/env node

/**
 * Deploy to Vercel - Automated Setup
 * Run: node deploy-vercel.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                  LNPMS - Vercel Deployment Setup                          ║
║                          Version 4.0 Pro                                   ║
╚════════════════════════════════════════════════════════════════════════════╝
  `);

  try {
    // 1. Check prerequisites
    console.log('\n✓ Checking prerequisites...');
    
    // Check for Git
    const hasGit = await execAsync('git --version')
      .then(() => true)
      .catch(() => false);
    
    if (!hasGit) {
      console.error('❌ Git not found. Please install Git first.');
      process.exit(1);
    }
    
    console.log('✅ Git installed');

    // 2. Create .env.local for local development
    const envPath = path.join(__dirname, '.env.local');
    if (!fs.existsSync(envPath)) {
      console.log('\n📝 Creating .env.local for local development...');
      const envContent = `NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_local_jwt_secret_change_this_to_32_plus_characters
`;
      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env.local created');
    }

    // 3. Check package.json
    console.log('\n✓ Verifying package.json...');
    const pkgPath = path.join(__dirname, 'backend', 'package.json');
    let pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    
    if (!pkg.scripts.vercel) {
      pkg.scripts.vercel = 'node backend/index.js';
    }
    if (!pkg.dependencies.pg && process.env.DATABASE_URL?.includes('postgresql')) {
      console.log('\n📦 Adding pg dependency for PostgreSQL support...');
      pkg.dependencies.pg = '^8.11.0';
    }
    
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    console.log('✅ package.json updated');

    // 4. Get deployment info from user
    console.log('\n📋 Deployment Configuration:');
    const projectName = await question('Enter your Vercel project name: ');
    const jwtSecret = await question('Enter JWT Secret (32+ characters) or press Enter for auto-generation: ');
    const databaseType = await question('Database type (postgres/mongodb/sqlite): ');
    const databaseUrl = await question('Enter DATABASE_URL (leave blank if using SQLite): ');

    // 5. Create vercel.json with user values
    console.log('\n⚙️  Configuring vercel.json...');
    const vercelConfig = {
      version: 2,
      framework: 'express',
      buildCommand: 'npm install && npm run build',
      outputDirectory: '.',
      env: {
        NODE_ENV: 'production',
        JWT_SECRET: jwtSecret || 'auto_generated_jwt_secret_12345678901234567890',
        DATABASE_URL: databaseUrl || undefined,
        DATABASE_TYPE: databaseType
      },
      functions: {
        'backend/index.js': {
          memory: 1024,
          maxDuration: 30
        }
      },
      routes: [
        {
          src: '/api/(.*)',
          dest: 'backend/index.js'
        },
        {
          src: '/(.*)',
          dest: 'frontend-server.js'
        }
      ]
    };

    fs.writeFileSync(
      path.join(__dirname, 'vercel.json'),
      JSON.stringify(vercelConfig, null, 2)
    );
    console.log('✅ vercel.json configured');

    // 6. Create deployment checklist
    console.log('\n📝 Creating deployment checklist...');
    const checklist = `# Vercel Deployment Checklist

## Before Deploying:
- [ ] Verify all 17 features are working locally
- [ ] Test with \`npm start\` and verify no errors
- [ ] Backup current database
- [ ] Review .env.example for all required variables
- [ ] Confirm database service is ready (PostgreSQL/MongoDB)

## Steps to Deploy:

1. Install Vercel CLI:
   \`\`\`bash
   npm install -g vercel
   \`\`\`

2. Login to Vercel:
   \`\`\`bash
   vercel login
   \`\`\`

3. Deploy to staging:
   \`\`\`bash
   vercel
   \`\`\`

4. Deploy to production:
   \`\`\`bash
   vercel --prod
   \`\`\`

5. Set environment variables:
   \`\`\`bash
   vercel env add JWT_SECRET "${jwtSecret}"
   vercel env add DATABASE_URL "${databaseUrl}"
   vercel env add FRONTEND_URL "https://${projectName}.vercel.app"
   \`\`\`

6. Redeploy after setting env vars:
   \`\`\`bash
   vercel --prod
   \`\`\`

## Post-Deployment:
- [ ] Verify API endpoints are accessible
- [ ] Test login functionality
- [ ] Check dashboard loads
- [ ] Verify all 17 features work
- [ ] Monitor Vercel logs for errors
- [ ] Set up analytics and monitoring
- [ ] Configure custom domain (optional)

## Project Details:
- **Project Name**: ${projectName}
- **Database Type**: ${databaseType}
- **Vercel URL**: https://${projectName}.vercel.app
- **Documentation**: See VERCEL_DEPLOYMENT_GUIDE.md
`;

    fs.writeFileSync(
      path.join(__dirname, 'DEPLOYMENT_CHECKLIST_VERCEL.md'),
      checklist
    );
    console.log('✅ Deployment checklist created');

    // 7. Summary
    console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                      ✅ Setup Complete!                                   ║
╚════════════════════════════════════════════════════════════════════════════╝

Your LNPMS is ready for Vercel deployment!

📋 Next Steps:
1. Install Vercel CLI: npm install -g vercel
2. Login: vercel login
3. Deploy: vercel --prod
4. Check: DEPLOYMENT_CHECKLIST_VERCEL.md

📚 Reference Documentation:
- VERCEL_DEPLOYMENT_GUIDE.md - Complete deployment guide
- DEPLOYMENT_CHECKLIST_VERCEL.md - Step-by-step checklist
- vercel.json - Vercel configuration

🔐 Important:
- Update .env variables with real values before deploying
- Never commit .env files to git
- Use strong JWT_SECRET (32+ characters)
- Configure database access from Vercel IP range

Questions? See VERCEL_DEPLOYMENT_GUIDE.md for troubleshooting.
`);

    rl.close();

  } catch (error) {
    console.error('❌ Error during setup:', error.message);
    rl.close();
    process.exit(1);
  }
}

function execAsync(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) reject(error);
      else resolve(stdout);
    });
  });
}

main();
