#!/usr/bin/env node

// Check the current git state using simple file system access
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  // Get list of all markdown files in posts
  const postsPath = path.join(__dirname, 'src/content/posts');
  
  function getFilesRecursive(dir) {
    let files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files = files.concat(getFilesRecursive(fullPath));
      } else if (item.endsWith('.md') || item.endsWith('.mdx')) {
        files.push(path.relative(__dirname, fullPath));
      }
    }
    return files;
  }
  
  const markdownFiles = getFilesRecursive(postsPath);
  console.log('Markdown files in posts:');
  console.log(markdownFiles.join('\n'));
  
  // Check if markdown_demonstrate exists
  if (markdownFiles.some(f => f.includes('markdown_demonstrate'))) {
    console.log('\n⚠️  Found markdown_demonstrate file!');
  } else {
    console.log('\n✅ markdown_demonstrate file not found locally');
  }
  
} catch (error) {
  console.error('Error:', error.message);
}
