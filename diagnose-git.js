#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cwd = process.cwd();

console.log('Current directory:', cwd);
console.log('Node version:', process.version);

// Function to run git commands
function runGit(args) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  if (result.error) {
    console.error('Error running git:', result.error.message);
    return null;
  }
  
  if (result.status !== 0) {
    console.log('Git stderr:', result.stderr);
  }
  
  return result.stdout.trim();
}

console.log('\n=== Checking git status ===');
const status = runGit(['status', '--porcelain']);
console.log('Status output:');
console.log(status || '(clean)');

console.log('\n=== Checking all tracked markdown files ===');
const files = runGit(['ls-files', '--', '*.md', '*.mdx']);
console.log('Tracked files:');
files.split('\n').forEach(f => {
  if (f.includes('demonstrate')) {
    console.log('  ⚠️  ' + f + ' <-- FOUND!');
  }
});

console.log('\n=== Git log for markdown_demonstrate ===');
const log = runGit(['log', '--all', '--full-history', '--', 'src/content/posts/markdown_demonstrate.md']);
if (log) {
  console.log('File history found:');
  console.log(log.slice(0, 300));
} else {
  console.log('No history found for this file');
}

console.log('\n=== Checking if file exists in working tree ===');
const filePath = path.join(cwd, 'src/content/posts/markdown_demonstrate.md');
console.log('File exists locally:', fs.existsSync(filePath));
