#!/usr/bin/env node

// This file ensures each commit has a meaningful commit message.
const { execSync } = require('child_process');

try {
  execSync('yarn commitlint --edit $1', { stdio: 'inherit' });
} catch (error) {
  process.exit(1);
}
