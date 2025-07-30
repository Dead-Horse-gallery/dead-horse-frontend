#!/usr/bin/env node

/**
 * Console Log Cleanup Script - Dead Horse Gallery
 * 
 * This script replaces console.error statements with proper logging
 * while preserving console statements in the logger itself.
 */

import fs from 'fs';
import path from 'path';

// Files that should keep console statements (logger implementation)
const LOGGER_FILES = [
  'src/lib/logger.ts',
  'test-security.js' // Test file
];

// Directories to scan
const SCAN_DIRS = [
  'src/app',
  'src/components', 
  'src/contexts',
  'src/lib',
  'src/hooks'
];

function replaceConsoleStatements(filePath, content) {
  let updated = content;
  let hasChanges = false;
  
  // Skip if this is a logger file
  if (LOGGER_FILES.some(loggerFile => filePath.includes(loggerFile))) {
    return { content: updated, hasChanges: false };
  }
  
  // Add logger import if not present and we need to replace console statements
  const hasConsoleStatements = /console\.(error|warn|info|log|debug)/g.test(content);
  const hasLoggerImport = /import.*log.*from.*['"'].*logger['"']/g.test(content);
  
  if (hasConsoleStatements && !hasLoggerImport) {
    // Add logger import after other imports
    const importRegex = /(import.*from.*['"][^'"]+['"];?\s*\n)/g;
    const imports = content.match(importRegex) || [];
    
    if (imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertIndex = lastImportIndex + lastImport.length;
      
      updated = content.slice(0, insertIndex) + 
                "import { log } from '@/lib/logger';\n" + 
                content.slice(insertIndex);
      hasChanges = true;
    }
  }
  
  // Replace console.error statements
  updated = updated.replace(
    /console\.error\s*\(\s*(['"`][^'"]*['"`])\s*,\s*([^)]+)\s*\)/g,
    (match, message, data) => {
      hasChanges = true;
      return `log.error(${message}, { error: ${data} })`;
    }
  );
  
  // Replace simple console.error statements  
  updated = updated.replace(
    /console\.error\s*\(\s*(['"`][^'"]*['"`])\s*\)/g,
    (match, message) => {
      hasChanges = true;
      return `log.error(${message})`;
    }
  );
  
  // Replace console.warn statements
  updated = updated.replace(
    /console\.warn\s*\(\s*(['"`][^'"]*['"`])\s*,\s*([^)]+)\s*\)/g,
    (match, message, data) => {
      hasChanges = true;
      return `log.warn(${message}, { data: ${data} })`;
    }
  );
  
  return { content: updated, hasChanges };
}

function processFile(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
    return;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: updated, hasChanges } = replaceConsoleStatements(filePath, content);
    
    if (hasChanges) {
      fs.writeFileSync(filePath, updated);
      console.log(`✅ Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return;
  }
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      processDirectory(itemPath);
    } else {
      processFile(itemPath);
    }
  }
}

console.log('🧹 Starting console log cleanup...\n');

// Process each directory
for (const dir of SCAN_DIRS) {
  console.log(`📁 Processing ${dir}...`);
  processDirectory(dir);
}

console.log('\n✨ Console log cleanup complete!');
