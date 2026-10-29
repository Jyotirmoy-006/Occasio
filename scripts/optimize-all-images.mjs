import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

async function optimizeDir(dir) {
  const files = fs.readdirSync(dir, { recursive: true, withFileTypes: true });
  for (const f of files) {
    if (!f.isFile() || !f.name.endsWith('.webp')) continue;
    const fullPath = path.join(f.parentPath || dir, f.name);
    let stat = fs.statSync(fullPath);

    if (stat.size > 140 * 1024) {
      console.log(`Optimizing ${fullPath} (current: ${(stat.size / 1024).toFixed(1)} KB)...`);
      const buffer = fs.readFileSync(fullPath);
      let quality = 76;
      let optimized = await sharp(buffer).webp({ quality, effort: 5 }).toBuffer();
      
      while (optimized.length > 140 * 1024 && quality > 50) {
        quality -= 5;
        optimized = await sharp(buffer).webp({ quality, effort: 5 }).toBuffer();
      }

      fs.writeFileSync(fullPath, optimized);
      stat = fs.statSync(fullPath);
      console.log(`-> Reduced to ${(stat.size / 1024).toFixed(1)} KB (quality: ${quality})`);
    }
  }
}

async function checkTotals() {
  const imageDir = path.resolve('public/images');
  await optimizeDir(imageDir);

  let totalBytes = 0;
  let fileCount = 0;
  const files = fs.readdirSync(imageDir, { recursive: true, withFileTypes: true });

  console.log('\n--- PUBLIC/IMAGES AUDIT ---');
  for (const f of files) {
    if (!f.isFile()) continue;
    const fullPath = path.join(f.parentPath || imageDir, f.name);
    const stat = fs.statSync(fullPath);
    totalBytes += stat.size;
    fileCount++;
    console.log(`${path.relative('public', fullPath)}: ${(stat.size / 1024).toFixed(1)} KB`);
    if (stat.size > 150 * 1024) {
      throw new Error(`FILE EXCEEDS 150 KB LIMIT: ${fullPath} (${(stat.size / 1024).toFixed(1)} KB)`);
    }
  }

  const totalMb = totalBytes / (1024 * 1024);
  console.log(`\nTotal Images: ${fileCount} files, ${totalMb.toFixed(2)} MB (Limit: 2.50 MB)`);
  if (totalMb > 2.5) {
    throw new Error(`TOTAL IMAGES DIRECTORY EXCEEDS 2.5 MB: ${totalMb.toFixed(2)} MB`);
  }
}

checkTotals().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

