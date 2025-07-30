#!/usr/bin/env node

/**
 * Alert Cleanup Script for Dead Horse Gallery
 * This script replaces alert() statements with proper logging or toast notifications
 */

import fs from 'fs';
import path from 'path';

// Directory paths to process
const directoriesToProcess = [
  'src/components',
  'src/app',
  'src/lib',
  'src/contexts',
  'src/hooks'
];

/**
 * Replacements for alert statements
 */
const replacements = [
  // Replace simple alert statements with log.info
  {
    pattern: /alert\('([^']+)'\);/g,
    replacement: "log.info('Demo action', { message: '$1' });"
  },
  {
    pattern: /alert\("([^"]+)"\);/g,
    replacement: 'log.info("Demo action", { message: "$1" });'
  },
  // Replace template literal alerts with log.info
  {
    pattern: /alert\(`([^`]+)`\);/g,
    replacement: 'log.info("Demo action", { message: `$1` });'
  },
  // Replace alerts with variables
  {
    pattern: /alert\(([^)]+)\);/g,
    replacement: 'log.info("Demo action", { message: $1 });'
  }
];

/**
 * Process a single file and apply replacements
 * @param {string} filePath - Path to the file to process
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Apply each replacement
    for (const { pattern, replacement } of replacements) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    }

    // Ensure log import is present if we made changes
    if (modified && !content.includes("import { log }")) {
      // Add import if it doesn't exist
      const importPattern = /^import.*from ['"]@\/lib\/logger['"];?$/m;
      if (!importPattern.test(content)) {
        // Find the last import statement
        const lastImportMatch = content.match(/^import.*from.*['"];?$/gm);
        if (lastImportMatch) {
          const lastImport = lastImportMatch[lastImportMatch.length - 1];
          const lastImportIndex = content.lastIndexOf(lastImport);
          const insertIndex = lastImportIndex + lastImport.length;
          content = content.slice(0, insertIndex) + 
                   '\nimport { log } from \'@/lib/logger\';' + 
                   content.slice(insertIndex);
        } else {
          // No imports found, add at the top after 'use client' if present
          const useClientMatch = content.match(/^['"]use client['"];?\s*$/m);
          if (useClientMatch) {
            const insertIndex = useClientMatch.index + useClientMatch[0].length;
            content = content.slice(0, insertIndex) + 
                     '\n\nimport { log } from \'@/lib/logger\';' + 
                     content.slice(insertIndex);
          } else {
            content = 'import { log } from \'@/lib/logger\';\n\n' + content;
          }
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Process all files in a directory recursively
 * @param {string} dirPath - Directory path to process
 */
function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

// Main execution
console.log('🧹 Starting alert cleanup...\n');

for (const dir of directoriesToProcess) {
  console.log(`📁 Processing ${dir}...`);
  processDirectory(dir);
}

console.log('\n✨ Alert cleanup complete!');
console.log('📝 Note: All alert() calls have been replaced with log.info() statements.');
console.log('🔄 Consider replacing with toast notifications where appropriate for better UX.');
