import { getUncachableGitHubClient } from '../server/github-utils';
import * as fs from 'fs';
import * as path from 'path';

const REPO_OWNER = '15augustjon-tech';
const REPO_NAME = 'atlas-technical-assessment';

async function initializeRepo() {
  const octokit = await getUncachableGitHubClient();
  
  // Create a simple README to initialize the repo
  const readmeContent = '# Atlas Technical Assessment\n\nInitializing repository...';
  
  try {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: 'README.md',
      message: 'Initialize repository',
      content: Buffer.from(readmeContent).toString('base64'),
    });
    console.log('✅ Repository initialized with README');
  } catch (error: any) {
    if (error.status === 422) {
      console.log('✅ Repository already has content');
    } else {
      throw error;
    }
  }
}

async function uploadFile(octokit: any, filePath: string, content: string) {
  try {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
      message: `Add ${filePath}`,
      content: Buffer.from(content).toString('base64'),
    });
    console.log(`  ✓ ${filePath}`);
  } catch (error: any) {
    console.error(`  ✗ ${filePath}: ${error.message}`);
  }
}

async function uploadAllFiles() {
  console.log('🚀 Uploading to GitHub...\n');
  
  await initializeRepo();
  
  const octokit = await getUncachableGitHubClient();
  
  const includePaths = [
    'server',
    'client',
    'shared',
    'scripts',
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'drizzle.config.ts',
    'tailwind.config.ts',
    'postcss.config.js',
    '.replit',
    'replit.md',
    'README.md'
  ];
  
  const excludeDirs = ['node_modules', 'dist', '.git', 'tmp', '.cache', 'attached_assets'];
  
  async function processPath(itemPath: string, basePath: string = '') {
    const fullPath = path.join(process.cwd(), itemPath);
    
    if (!fs.existsSync(fullPath)) {
      return;
    }
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      const items = fs.readdirSync(fullPath);
      for (const item of items) {
        const relPath = path.join(itemPath, item);
        if (excludeDirs.some(ex => relPath.includes(ex))) {
          continue;
        }
        await processPath(relPath, basePath);
      }
    } else if (stat.isFile()) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      await uploadFile(octokit, itemPath, content);
    }
  }
  
  console.log('\n📤 Uploading files...\n');
  
  for (const includePath of includePaths) {
    await processPath(includePath);
  }
  
  console.log('\n✅ Upload complete!');
  console.log(`\n🔗 Repository: https://github.com/${REPO_OWNER}/${REPO_NAME}`);
}

uploadAllFiles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
