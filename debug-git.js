const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Check git status
  console.log('=== Git Status ===');
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  console.log(status || 'No changes');
  
  // Check if file exists
  const filePath = path.join(__dirname, 'src/content/posts/markdown_demonstrate.md');
  console.log('\n=== File Existence ===');
  console.log(`File exists: ${fs.existsSync(filePath)}`);
  
  // List files in posts
  console.log('\n=== Files in src/content/posts ===');
  const postsDir = path.join(__dirname, 'src/content/posts');
  const files = execSync(`git ls-files "src/content/posts/**/*.md"`, { encoding: 'utf8' });
  console.log(files);
  
  // Check recent commits
  console.log('\n=== Recent commits ===');
  const commits = execSync('git log --oneline -10', { encoding: 'utf8' });
  console.log(commits);
  
} catch (error) {
  console.error('Error:', error.message);
}
