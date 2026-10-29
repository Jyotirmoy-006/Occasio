#!/usr/bin/env node
/**
 * Size check: fails if git-tracked files exceed 8 MB,
 * or if any single image exceeds 150 KB,
 * or if the public/images directory exceeds 2.5 MB.
 * Run: npm run size-check
 */
import { execSync } from 'child_process';
import { statSync, existsSync, readdirSync } from 'fs';
import path from 'path';

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_SINGLE_IMAGE_BYTES = 150 * 1024; // 150 KB
const MAX_IMAGES_DIR_BYTES = 2.5 * 1024 * 1024; // 2.5 MB

try {
  // 1. Audit Images Directory
  const imageDir = path.resolve('public/images');
  if (existsSync(imageDir)) {
    let imagesTotalBytes = 0;
    const imgFiles = readdirSync(imageDir, { recursive: true, withFileTypes: true });

    for (const f of imgFiles) {
      if (!f.isFile()) continue;
      const fullPath = path.join(f.parentPath || imageDir, f.name);
      const stat = statSync(fullPath);
      imagesTotalBytes += stat.size;

      if (stat.size > MAX_SINGLE_IMAGE_BYTES) {
        console.error(`FAIL: Image ${path.relative('.', fullPath)} exceeds 150 KB limit (${(stat.size / 1024).toFixed(1)} KB)`);
        process.exit(1);
      }
    }

    const imagesMB = (imagesTotalBytes / (1024 * 1024)).toFixed(2);
    console.log(`Images directory size: ${imagesMB} MB (Limit: 2.50 MB, each < 150 KB)`);
    if (imagesTotalBytes > MAX_IMAGES_DIR_BYTES) {
      console.error(`FAIL: Images directory exceeds 2.5 MB limit (${imagesMB} MB)`);
      process.exit(1);
    }
  }

  // 2. Audit Tracked Repo Size
  let files = [];
  try {
    const output = execSync('git ls-files', { encoding: 'utf8' });
    files = output.trim().split('\n').filter(Boolean);
  } catch {
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

  console.log(`PASS: All size guardrails satisfied.`);
} catch (err) {
  console.error('size-check error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
}

