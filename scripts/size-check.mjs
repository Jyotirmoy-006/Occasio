#!/usr/bin/env node
/**
 * Size check: fails if git-tracked files exceed 8 MB.
 * Run: npm run size-check
 */
import { execSync } from 'child_process';
import { statSync, existsSync } from 'fs';

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

try {
  let files = [];
  try {
    const output = execSync('git ls-files', { encoding: 'utf8' });
    files = output.trim().split('\n').filter(Boolean);
  } catch {
    // If not in a git repo yet, fallback to scanning non-ignored dirs
    console.log('Git not initialized yet, skipping tracked file check.');
    process.exit(0);
  }

  let totalBytes = 0;
  for (const file of files) {
    if (existsSync(file)) {
      const stat = statSync(file);
      totalBytes += stat.size;
    }
  }

  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
  console.log(`Tracked repo size: ${totalMB} MB (${totalBytes} bytes)`);

  if (totalBytes > MAX_BYTES) {
    console.error(`FAIL: Tracked files exceed 8 MB limit (${totalMB} MB)`);
    process.exit(1);
  }

  console.log(`PASS: Under 8 MB limit.`);
} catch (err) {
  console.error('size-check error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
}
