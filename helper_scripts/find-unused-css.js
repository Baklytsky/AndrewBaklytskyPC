const fs = require('fs');
const path = require('path');

// Directories to search
const CSS_DIR = path.join(__dirname, '../src/css');
const SOURCE_DIRS = [
  path.join(__dirname, '../src/sections'),
  path.join(__dirname, '../src/snippets'),
  path.join(__dirname, '../src/templates'),
  path.join(__dirname, '../src/blocks'),
  path.join(__dirname, '../src/js'),
  path.join(__dirname, '../src/layout'),
  path.join(__dirname, '../dist/sections'),
  path.join(__dirname, '../dist/snippets'),
  path.join(__dirname, '../dist/templates'),
  path.join(__dirname, '../dist/blocks'),
  path.join(__dirname, '../dist/layout'),
];

// Extract class names from SCSS files (only top-level definitions)
function extractClassesFromSCSS() {
  const classes = new Set();
  const scssFiles = getAllFiles(CSS_DIR, ['.scss']);

  console.log(`Scanning ${scssFiles.length} SCSS files...`);

  scssFiles.forEach((file) => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Match class selectors at the start of a line (or after whitespace/comment)
        // Pattern: .class-name { or .class-name, or .class-name:
        if (line.match(/^\.([a-zA-Z0-9_-]+(?:\-[a-zA-Z0-9_-]+)*)(?:\s*[,:{]|$)/)) {
          const match = line.match(/^\.([a-zA-Z0-9_-]+(?:\-[a-zA-Z0-9_-]+)*)/);
          if (match) {
            const className = match[1];

            // Skip if it's a pseudo-class or special case
            if (className !== 'root' && !className.startsWith('is-') && !className.startsWith('has-') && className.length > 1) {
              classes.add(className);
            }
          }
        }

        // Also match classes that are part of selectors like ".class-name " or ".class-name,"
        // but only if they appear to be definitions (followed by { or , or :)
        const classInSelector = line.match(/\.([a-zA-Z0-9_-]+(?:\-[a-zA-Z0-9_-]+)*)(?:\s*[,:{&]|$)/g);
        if (classInSelector) {
          classInSelector.forEach((selector) => {
            const match = selector.match(/\.([a-zA-Z0-9_-]+(?:\-[a-zA-Z0-9_-]+)*)/);
            if (match) {
              const className = match[1];
              // Only add if it looks like a definition (has { or , after it in the line)
              if ((line.includes('{') || line.includes(',')) && className !== 'root' && !className.startsWith('is-') && !className.startsWith('has-') && className.length > 1) {
                classes.add(className);
              }
            }
          });
        }
      }
    } catch (e) {
      console.error(`Error reading ${file}:`, e.message);
    }
  });

  return Array.from(classes).sort();
}

// Get all files recursively
function getAllFiles(dirPath, extensions = []) {
  let results = [];

  if (!fs.existsSync(dirPath)) {
    return results;
  }

  try {
    const list = fs.readdirSync(dirPath);

    list.forEach((file) => {
      const filePath = path.join(dirPath, file);
      try {
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
          results = results.concat(getAllFiles(filePath, extensions));
        } else {
          const ext = path.extname(file);
          if (extensions.length === 0 || extensions.includes(ext)) {
            results.push(filePath);
          }
        }
      } catch (e) {
        // Skip files we can't read
      }
    });
  } catch (e) {
    // Skip directories we can't read
  }

  return results;
}

// Search for class usage in source files (excluding SCSS definitions)
function searchForClass(className) {
  // Escape the className for regex (escape hyphens)
  const escapedClassName = className.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');

  // Patterns to search for:
  // 1. class="... className ..." (HTML class attribute)
  // 2. className="... className ..." (React/JSX)
  // 3. 'className' or "className" (string literals in JS)
  // 4. .className (in JS querySelector, etc.)
  // 5. className as a word boundary (in variable names, etc.)

  const patterns = [
    new RegExp(`class=["'][^"']*\\b${escapedClassName}\\b[^"']*["']`, 'i'),
    new RegExp(`className=["'][^"']*\\b${escapedClassName}\\b[^"']*["']`, 'i'),
    new RegExp(`["']${escapedClassName}["']`, 'i'),
    new RegExp(`['\`]${escapedClassName}['\`]`, 'i'),
    new RegExp(`\\.${escapedClassName}\\b`, 'i'),
    new RegExp(`\\b${escapedClassName}\\b`, 'i'),
  ];

  // Get all source files
  const sourceFiles = [];
  SOURCE_DIRS.forEach((dir) => {
    if (fs.existsSync(dir)) {
      sourceFiles.push(...getAllFiles(dir, ['.liquid', '.js', '.html', '.json']));
    }
  });

  // Also check dist CSS files for usage (compiled CSS might have the class)
  const distCssFiles = [];
  const distCssDir = path.join(__dirname, '../dist');
  if (fs.existsSync(distCssDir)) {
    distCssFiles.push(...getAllFiles(distCssDir, ['.css']));
  }

  // Search in source files
  for (const file of sourceFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');

      // Skip if this is an SCSS file (we only want usage, not definitions)
      if (file.endsWith('.scss')) {
        continue;
      }

      // Check each pattern
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          // Verify it's not in a comment
          const lines = content.split('\n');
          for (const line of lines) {
            if (pattern.test(line)) {
              const trimmed = line.trim();
              // Skip comments
              if (!trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.match(/^\s*\*/) && !trimmed.startsWith('#')) {
                return true;
              }
            }
          }
        }
      }
    } catch (e) {
      // Skip files we can't read
    }
  }

  // Also check if class is used in other SCSS files (as a nested selector or reference)
  const scssFiles = getAllFiles(CSS_DIR, ['.scss']);
  for (const file of scssFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');

      // Look for usage of the class (not definition)
      // Usage patterns: &__modifier, .parent .className, etc.
      // But we want to exclude the definition line itself
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip the definition line (starts with .className {)
        if (line.trim().match(new RegExp(`^\\.${escapedClassName}\\s*[,\\{:]`))) {
          continue;
        }

        // Check for usage in nested selectors, mixins, etc.
        if (line.includes(className) && (line.includes('&') || line.includes(`.${className}`) || line.includes(`'${className}'`) || line.includes(`"${className}"`))) {
          const trimmed = line.trim();
          // Skip comments
          if (!trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.match(/^\s*\*/)) {
            return true;
          }
        }
      }
    } catch (e) {
      // Skip files we can't read
    }
  }

  return false;
}

// Main execution
console.log('='.repeat(60));
console.log('CSS Class Usage Analyzer');
console.log('='.repeat(60));
console.log('');

console.log('Step 1: Extracting CSS classes from SCSS files...');
const allClasses = extractClassesFromSCSS();
console.log(`Found ${allClasses.length} unique CSS classes\n`);

console.log('Step 2: Checking class usage across codebase...');
console.log(`Scanning ${SOURCE_DIRS.length} source directories...\n`);

const unusedClasses = [];
const usedClasses = [];
let checked = 0;

for (const className of allClasses) {
  checked++;
  if (checked % 100 === 0) {
    process.stdout.write(`\rProgress: ${checked}/${allClasses.length} (${Math.round((checked / allClasses.length) * 100)}%)`);
  }

  const isUsed = searchForClass(className);

  if (!isUsed) {
    unusedClasses.push(className);
  } else {
    usedClasses.push(className);
  }
}

process.stdout.write(`\rProgress: ${checked}/${allClasses.length} (100%)\n\n`);

console.log('='.repeat(60));
console.log('Analysis Results');
console.log('='.repeat(60));
console.log(`Total classes found: ${allClasses.length}`);
console.log(`Used classes: ${usedClasses.length}`);
console.log(`Unused classes: ${unusedClasses.length}`);
console.log('');

// Write results to file
const outputFile = path.join(__dirname, '../unused-css-classes.txt');
fs.writeFileSync(outputFile, '='.repeat(60) + '\n');
fs.appendFileSync(outputFile, 'Unused CSS Classes Report\n');
fs.appendFileSync(outputFile, '='.repeat(60) + '\n');
fs.appendFileSync(outputFile, `Generated: ${new Date().toISOString()}\n`);
fs.appendFileSync(outputFile, `\n`);
fs.appendFileSync(outputFile, `Total classes found: ${allClasses.length}\n`);
fs.appendFileSync(outputFile, `Used classes: ${usedClasses.length}\n`);
fs.appendFileSync(outputFile, `Unused classes: ${unusedClasses.length}\n`);
fs.appendFileSync(outputFile, `\n`);
fs.appendFileSync(outputFile, '='.repeat(60) + '\n');
fs.appendFileSync(outputFile, 'UNUSED CSS CLASSES\n');
fs.appendFileSync(outputFile, '='.repeat(60) + '\n');
fs.appendFileSync(outputFile, '\n');

if (unusedClasses.length > 0) {
  unusedClasses.forEach((className, index) => {
    fs.appendFileSync(outputFile, `${index + 1}. ${className}\n`);
  });
} else {
  fs.appendFileSync(outputFile, 'No unused classes found!\n');
}

console.log(`\nResults written to: ${outputFile}`);
console.log(`\nUnused classes (first 30):`);
if (unusedClasses.length > 0) {
  unusedClasses.slice(0, 30).forEach((className, index) => {
    console.log(`  ${index + 1}. ${className}`);
  });
  if (unusedClasses.length > 30) {
    console.log(`  ... and ${unusedClasses.length - 30} more (see ${outputFile})`);
  }
} else {
  console.log('  None found!');
}

console.log('');
