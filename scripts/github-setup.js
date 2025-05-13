#!/usr/bin/env node

/**
 * GitHub Repository Setup Script
 * 
 * This script helps set up a GitHub repository for the Guitar Lessons Chat app.
 * It will:
 *  1. Check if git is installed
 *  2. Initialize a git repository if needed
 *  3. Add all files to git
 *  4. Create a .gitignore file if it doesn't exist
 *  5. Guide the user through creating a repository on GitHub and pushing the code
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

/**
 * Execute a command and return the output
 */
function executeCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`${colors.red}Error executing command: ${command}${colors.reset}`);
    console.error(error.message);
    return null;
  }
}

/**
 * Check if git is installed
 */
function checkGitInstalled() {
  try {
    execSync('git --version', { encoding: 'utf8' });
    console.log(`${colors.green}✓ Git is installed${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Git is not installed. Please install Git to continue.${colors.reset}`);
    console.log('Download Git from: https://git-scm.com/downloads');
    return false;
  }
}

/**
 * Check if the current directory is a git repository
 */
function isGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { encoding: 'utf8', stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Initialize a git repository
 */
function initGitRepository() {
  console.log(`${colors.blue}Initializing Git repository...${colors.reset}`);
  executeCommand('git init');
  console.log(`${colors.green}✓ Git repository initialized${colors.reset}`);
}

/**
 * Create a .gitignore file if it doesn't exist
 */
function createGitignore() {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  
  if (fs.existsSync(gitignorePath)) {
    console.log(`${colors.green}✓ .gitignore file already exists${colors.reset}`);
    return;
  }
  
  console.log(`${colors.blue}Creating .gitignore file...${colors.reset}`);
  
  const gitignoreContent = `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env.local
.env.development.local
.env.test.local
.env.production.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`;
  
  fs.writeFileSync(gitignorePath, gitignoreContent);
  console.log(`${colors.green}✓ .gitignore file created${colors.reset}`);
}

/**
 * Add all files to git
 */
function addFilesToGit() {
  console.log(`${colors.blue}Adding files to git...${colors.reset}`);
  executeCommand('git add .');
  console.log(`${colors.green}✓ Files added to git${colors.reset}`);
}

/**
 * Commit changes
 */
function commitChanges(message) {
  console.log(`${colors.blue}Committing changes...${colors.reset}`);
  executeCommand(`git commit -m "${message}"`);
  console.log(`${colors.green}✓ Changes committed${colors.reset}`);
}

/**
 * Add remote origin
 */
function addRemoteOrigin(repoUrl) {
  console.log(`${colors.blue}Adding remote origin...${colors.reset}`);
  executeCommand(`git remote add origin ${repoUrl}`);
  console.log(`${colors.green}✓ Remote origin added${colors.reset}`);
}

/**
 * Push to GitHub
 */
function pushToGithub(branch = 'main') {
  console.log(`${colors.blue}Pushing to GitHub...${colors.reset}`);
  
  try {
    execSync(`git push -u origin ${branch}`, { encoding: 'utf8', stdio: 'inherit' });
    console.log(`${colors.green}✓ Code pushed to GitHub${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Failed to push to GitHub. Please check your credentials and try again.${colors.reset}`);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`\n${colors.bright}${colors.blue}===== GitHub Repository Setup =====${colors.reset}\n`);
  
  // Check if git is installed
  if (!checkGitInstalled()) {
    rl.close();
    return;
  }
  
  // Check if current directory is a git repository
  if (!isGitRepository()) {
    initGitRepository();
  } else {
    console.log(`${colors.green}✓ Current directory is already a git repository${colors.reset}`);
  }
  
  // Create .gitignore file
  createGitignore();
  
  // Add files to git
  addFilesToGit();
  
  // Ask for commit message
  const commitMessage = await new Promise(resolve => {
    rl.question(`\n${colors.yellow}Enter commit message (default: "Initial commit"): ${colors.reset}`, (answer) => {
      resolve(answer || 'Initial commit');
    });
  });
  
  // Commit changes
  commitChanges(commitMessage);
  
  // Guide user to create a repository on GitHub
  console.log(`\n${colors.bright}${colors.yellow}Next steps:${colors.reset}`);
  console.log(`\n1. Go to ${colors.blue}https://github.com/new${colors.reset} to create a new repository.`);
  console.log(`2. Name your repository (e.g., "guitar-lessons-chat").`);
  console.log(`3. Do NOT initialize the repository with a README, .gitignore, or license.`);
  console.log(`4. Click "Create repository".`);
  
  // Ask for repository URL
  const repoUrl = await new Promise(resolve => {
    rl.question(`\n${colors.yellow}Enter your GitHub repository URL (e.g., https://github.com/username/guitar-lessons-chat.git): ${colors.reset}`, (answer) => {
      resolve(answer);
    });
  });
  
  if (!repoUrl) {
    console.log(`${colors.red}✗ No repository URL provided. Exiting.${colors.reset}`);
    rl.close();
    return;
  }
  
  // Add remote origin
  addRemoteOrigin(repoUrl);
  
  // Ask for branch name
  const defaultBranch = 'main';
  const branch = await new Promise(resolve => {
    rl.question(`\n${colors.yellow}Enter branch name (default: "${defaultBranch}"): ${colors.reset}`, (answer) => {
      resolve(answer || defaultBranch);
    });
  });
  
  // Push to GitHub
  const success = pushToGithub(branch);
  
  if (success) {
    console.log(`\n${colors.bright}${colors.green}Success! Your code has been pushed to GitHub.${colors.reset}`);
    console.log(`\nYou can now view your repository at: ${colors.blue}${repoUrl.replace('.git', '')}${colors.reset}`);
  }
  
  rl.close();
}

// Run the main function
main(); 