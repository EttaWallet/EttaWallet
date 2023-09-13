#!/usr/bin/env node

const { execSync } = require('child_process');

try {
  execSync('yarn commitlint --edit $1', { stdio: 'inherit' });
} catch (error) {
  process.exit(1);
}
