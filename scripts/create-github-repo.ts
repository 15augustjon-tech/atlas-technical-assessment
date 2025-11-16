import { getUncachableGitHubClient } from '../server/github-utils';

async function createGitHubRepository() {
  try {
    console.log('Creating GitHub repository...');
    
    const octokit = await getUncachableGitHubClient();
    
    // Get authenticated user info
    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log(`Authenticated as: ${user.login}`);
    
    // Create repository
    const repoName = 'atlas-technical-assessment';
    const repoDescription = 'Atlas Technical Assessment - Professional software engineering evaluation platform with 4 open-ended questions, 45-minute timer, and comprehensive response tracking';
    
    try {
      const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
        name: repoName,
        description: repoDescription,
        private: false,
        auto_init: false,
      });
      
      console.log('\n✅ Repository created successfully!');
      console.log(`Repository URL: ${repo.html_url}`);
      console.log(`Clone URL: ${repo.clone_url}`);
      console.log(`\nTo push your code to GitHub, run these commands:`);
      console.log(`\ngit remote add origin ${repo.clone_url}`);
      console.log(`git branch -M main`);
      console.log(`git push -u origin main`);
      
      return repo;
    } catch (error: any) {
      if (error.status === 422 && error.message.includes('already exists')) {
        console.log('\n⚠️  Repository already exists!');
        const { data: repo } = await octokit.rest.repos.get({
          owner: user.login,
          repo: repoName,
        });
        console.log(`Repository URL: ${repo.html_url}`);
        console.log(`Clone URL: ${repo.clone_url}`);
        return repo;
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error creating GitHub repository:', error.message);
    throw error;
  }
}

createGitHubRepository()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
