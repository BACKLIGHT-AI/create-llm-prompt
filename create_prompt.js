#!/usr/bin/env node
/**
 * This script scans your project directory and generates a Markdown file (output.txt)
 * that includes:
 *   1. An ASCII tree representation of your project's structure.
 *   2. The contents of code files (after filtering out unwanted file types).
 *
 * This is useful for providing an overview of your project to an AI or a human reviewer.
 *
 * Usage:
 *   - Ensure Node.js is installed.
 *   - Run this script with: node create_prompt.js
 *   - The output file "output.txt" will be created in the current directory.
 *
 * Configuration:
 *   - EXCLUDED_DIRS: Directories to ignore (e.g., .git, node_modules).
 *   - EXCLUDED_FILES: Specific files to ignore.
 *   - EXCLUDED_EXTENSIONS: File extensions to ignore (e.g., images, JSON, etc.).
 */


/**
 * Do you like it? Add me on LinkedIn (Piet Jonker) 
 * Do you know about opportunities for AI/LLM development? --> email to piet@backlight.ai
 */

const fs = require('fs');
const path = require('path');

// --- Configuration Section ---
// Define directories that should be skipped.
const EXCLUDED_DIRS = new Set(['.git', '.next', 'node_modules']);
// Define files that should be skipped.
const EXCLUDED_FILES = new Set(['package.json', 'package-lock.json', 'create_prompt.js', '.DS_Store', 'README.md']);
// Define file extensions to ignore.
const EXCLUDED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico',
  '.pdf', '.zip', '.tar', '.gz', '.mp3', '.mp4', '.csv',
  '.xlsx', '.json', '.enc'
]);
// Set the base directory for scanning.
const BASE_DIRECTORY = '.';

/**
 * Recursively generate a tree representation of the directory structure.
 * Uses ASCII connectors ("├── " and "└── ") to display hierarchy.
 *
 * @param {string} directory - The directory to scan.
 * @param {string} prefix - Indentation prefix for the current level.
 * @returns {string[]} Array of strings representing each line of the tree.
 */
function generateTree(directory, prefix = "") {
  let lines = [];
  let entries;
  try {
    // Read entries from the directory.
    entries = fs.readdirSync(directory);
  } catch (err) {
    // If the directory can't be read, return an empty list.
    return lines;
  }
  // Sort the entries alphabetically.
  entries.sort();

  // Filter out unwanted directories and files.
  let filteredEntries = entries.filter(entry => {
    const fullPath = path.join(directory, entry);
    let stat;
    try {
      stat = fs.lstatSync(fullPath);
    } catch (err) {
      return false;
    }
    if (stat.isDirectory()) {
      return !EXCLUDED_DIRS.has(entry);
    } else {
      if (EXCLUDED_FILES.has(entry)) return false;
      const ext = path.extname(entry).toLowerCase();
      return !EXCLUDED_EXTENSIONS.has(ext);
    }
  });

  // Build the tree lines using appropriate connectors.
  filteredEntries.forEach((entry, index) => {
    const isLast = index === filteredEntries.length - 1;
    const connector = isLast ? "└── " : "├── ";
    lines.push(prefix + connector + entry);
    const fullPath = path.join(directory, entry);
    // If the entry is a directory, recursively generate its subtree.
    if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory()) {
      const extension = isLast ? "    " : "│   ";
      lines = lines.concat(generateTree(fullPath, prefix + extension));
    }
  });
  return lines;
}

// --- Build the Directory Tree ---
// Inform the user about the script's purpose.
console.log("Welcome! This script scans your project and generates a Markdown overview.");
const baseName = path.basename(path.resolve(BASE_DIRECTORY));
// Initialize the Markdown content with a header and the base directory name.
let markdownLines = [`# Project file structure`, `📁 ${baseName}`];
// Generate the tree structure and append it.
markdownLines = markdownLines.concat(generateTree(BASE_DIRECTORY));

// --- Collect Code File Contents ---
// This object will map relative file paths to their content.
let codeContent = {};

/**
 * Recursively collects code files that pass filtering from the given directory.
 *
 * @param {string} directory - The directory to scan.
 */
function collectCodeFiles(directory) {
  let entries;
  try {
    entries = fs.readdirSync(directory);
  } catch (err) {
    return;
  }
  entries.forEach(entry => {
    const fullPath = path.join(directory, entry);
    let stat;
    try {
      stat = fs.lstatSync(fullPath);
    } catch (err) {
      return;
    }
    if (stat.isDirectory()) {
      // Recursively process subdirectories if not excluded.
      if (!EXCLUDED_DIRS.has(entry)) {
        collectCodeFiles(fullPath);
      }
    } else {
      // Process the file if it's not excluded.
      if (!EXCLUDED_FILES.has(entry)) {
        const ext = path.extname(entry).toLowerCase();
        if (!EXCLUDED_EXTENSIONS.has(ext)) {
          try {
            // Read the file content.
            const content = fs.readFileSync(fullPath, 'utf-8');
            const relativePath = path.relative(BASE_DIRECTORY, fullPath);
            codeContent[relativePath] = content;
          } catch (err) {
            console.error(`Warning: Could not read file ${fullPath}. Error: ${err}`);
          }
        }
      }
    }
  });
}
collectCodeFiles(BASE_DIRECTORY);

// --- Write the Output to a Markdown File ---
console.log("Writing output to 'output.txt'...");
let output = markdownLines.join('\n');
output += '\n\n# Code files\n';
// Append each file's content in a separate section.
for (const [relativePath, content] of Object.entries(codeContent)) {
  output += `\n## ${relativePath}\n\`\`\`\n${content}\n\`\`\`\n`;
}
try {
  fs.writeFileSync('output.txt', output, 'utf-8');
  console.log("Output successfully written to 'output.txt'.");
} catch (err) {
  console.error(`Error: Failed to write output file. ${err}`);
}
