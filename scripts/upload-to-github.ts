import { getUncachableGitHubClient } from '../server/github-utils';
import * as fs from 'fs';
import * as path from 'path';

const REPO_OWNER = '15augustjon-tech';
const REPO_NAME = 'atlas-technical-assessment';

// Files and directories to include
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
  'replit.nix',
  'replit.md',
  'README.md'
];

// Directories to exclude
const excludeDirs = ['node_modules', 'dist', '.git', 'tmp', '.cache', 'attached_assets'];

async function getAllFiles(dir: string, baseDir: string = dir): Promise<{ path: string; content: string }[]> {
  const files: { path: string; content: string }[] = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativePath = path.relative(baseDir, fullPath);
      
      // Skip excluded directories
      if (excludeDirs.some(excluded => relativePath.includes(excluded))) {
        continue;
      }
      
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...await getAllFiles(fullPath, baseDir));
      } else if (stat.isFile()) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        files.push({ path: relativePath, content });
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
  
  return files;
}

async function uploadToGitHub() {
  try {
    console.log('🚀 Starting upload to GitHub...\n');
    
    const octokit = await getUncachableGitHubClient();
    
    // Collect all files to upload
    const allFiles: { path: string; content: string }[] = [];
    
    for (const includePath of includePaths) {
      const fullPath = path.join(process.cwd(), includePath);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Skipping ${includePath} (not found)`);
        continue;
      }
      
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        console.log(`📁 Processing directory: ${includePath}`);
        const dirFiles = await getAllFiles(fullPath);
        allFiles.push(...dirFiles);
      } else if (stat.isFile()) {
        console.log(`📄 Processing file: ${includePath}`);
        const content = fs.readFileSync(fullPath, 'utf-8');
        allFiles.push({ path: includePath, content });
      }
    }
    
    console.log(`\n✅ Found ${allFiles.length} files to upload\n`);
    
    // Create initial commit with all files
    // First, check if repository is empty
    const { data: repo } = await octokit.rest.repos.get({
      owner: REPO_OWNER,
      repo: REPO_NAME,
    });
    
    let baseTreeSha: string | undefined;
    let isEmptyRepo = false;
    
    try {
      // Try to get the latest commit
      const { data: ref } = await octokit.rest.git.getRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: `heads/main`,
      });
      const { data: commit } = await octokit.rest.git.getCommit({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        commit_sha: ref.object.sha,
      });
      baseTreeSha = commit.tree.sha;
    } catch (error) {
      // Repository is empty
      console.log('Repository is empty, creating initial commit...');
      isEmptyRepo = true;
    }
    
    // Create tree with inline blobs (works for empty repos)
    console.log('📤 Creating tree with files...');
    const treeItems = allFiles.map((file) => {
      console.log(`  ✓ ${file.path}`);
      return {
        path: file.path,
        mode: '100644' as const,
        type: 'blob' as const,
        content: file.content,
      };
    });
    
    // Create tree
    const { data: newTree } = await octokit.rest.git.createTree({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      tree: treeItems,
      base_tree: baseTreeSha,
    });
    
    // Create commit
    const { data: commit } = await octokit.rest.git.createCommit({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      message: 'Initial commit: Atlas Technical Assessment platform\n\nComplete professional assessment platform with:\n- 4 open-ended software engineering questions\n- 45-minute auto-starting timer with auto-submit\n- Text-based answer submission\n- Professional branding (scored out of 2,000 points)\n- Results page with comprehensive response tracking',
      tree: newTree.sha,
      parents: baseTreeSha ? [baseTreeSha] : [],
    });
    
    // Update or create reference
    if (isEmptyRepo) {
      await octokit.rest.git.createRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: `refs/heads/main`,
        sha: commit.sha,
      });
    } else {
      await octokit.rest.git.updateRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: `heads/main`,
        sha: commit.sha,
      });
    }
    
    console.log('\n✅ Successfully uploaded to GitHub!');
    console.log(`\n🔗 Repository URL: https://github.com/${REPO_OWNER}/${REPO_NAME}`);
    console.log(`📊 Commit: ${commit.sha.substring(0, 7)}`);
    
  } catch (error: any) {
    console.error('\n❌ Error uploading to GitHub:', error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

uploadToGitHub()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
