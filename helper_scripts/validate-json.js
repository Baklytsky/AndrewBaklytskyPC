#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');

/**
 * Recursively walk a directory and collect all files that match a predicate
 * @param {string} dir
 * @param {(filePath: string) => boolean} predicate
 * @param {string[]} acc
 */
function walk(dir, predicate, acc) {
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, predicate, acc);
    } else if (predicate(fullPath)) {
      acc.push(fullPath);
    }
  }
}

function isJsonFile(filePath) {
  return filePath.toLowerCase().endsWith('.json');
}

function validateJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    const data = JSON.parse(stripLeadingBlockComments(raw));
    const structuralErrors = validateShopifyStructure(data, filePath);
    return structuralErrors.length ? structuralErrors : null;
  } catch (err) {
    // Include file path and error message
    return [`${filePath}: ${err.message}`];
  }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateShopifyStructure(json, filePath) {
  const errs = [];

  if (!isObject(json)) return errs;

  const hasSections = Object.prototype.hasOwnProperty.call(json, 'sections');
  const hasOrder = Object.prototype.hasOwnProperty.call(json, 'order');

  if (hasSections && hasOrder && isObject(json.sections) && Array.isArray(json.order)) {
    const sectionIds = Object.keys(json.sections);
    const orderIds = json.order;

    // Sections present but missing in order
    for (const sid of sectionIds) {
      if (!orderIds.includes(sid)) {
        errs.push(`${filePath}: section '${sid}' is missing from order`);
      }
    }

    // Order references sections that don't exist
    for (const oid of orderIds) {
      if (!json.sections[oid]) {
        errs.push(`${filePath}: order references missing section '${oid}'`);
      }
    }

    // Validate blocks and block_order per section
    for (const [sid, section] of Object.entries(json.sections)) {
      if (!isObject(section)) continue;
      const hasBlocks = isObject(section.blocks);
      const hasBlockOrder = Array.isArray(section.block_order);

      if (hasBlocks && !hasBlockOrder) {
        errs.push(`${filePath}: section '${sid}' has blocks but is missing block_order`);
      }
      if (!hasBlocks && hasBlockOrder) {
        errs.push(`${filePath}: section '${sid}' has block_order but is missing blocks`);
      }
      if (hasBlocks && hasBlockOrder) {
        const blockIds = Object.keys(section.blocks);
        const orderBlockIds = section.block_order;

        for (const bid of blockIds) {
          if (!orderBlockIds.includes(bid)) {
            errs.push(`${filePath}: section '${sid}' block '${bid}' is missing from block_order`);
          }
        }
        for (const obid of orderBlockIds) {
          if (!section.blocks[obid]) {
            errs.push(`${filePath}: section '${sid}' block_order references missing block '${obid}'`);
          }
        }
      }
    }
  }

  return errs;
}

function stripLeadingBlockComments(text) {
  // Remove BOM
  let remaining = text.replace(/^\uFEFF/, '');
  // Repeatedly remove leading block comments and surrounding whitespace/newlines
  const blockCommentRegex = /^\s*\/\*[\s\S]*?\*\/\s*/;
  while (blockCommentRegex.test(remaining)) {
    remaining = remaining.replace(blockCommentRegex, '');
  }
  return remaining;
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`Source directory not found: ${SRC_DIR}`);
    process.exit(1);
  }

  const files = [];
  walk(SRC_DIR, isJsonFile, files);

  const errors = [];
  for (const file of files) {
    const result = validateJsonFile(file);
    if (Array.isArray(result) && result.length) {
      errors.push(...result);
    }
  }

  if (errors.length > 0) {
    console.error('\nJSON validation failed for the following files:\n');
    for (const e of errors) console.error(`- ${e}`);
    console.error(`\n${errors.length} invalid JSON file(s) found.`);
    process.exit(1);
  } else {
    console.log(`Validated ${files.length} JSON file(s) in src/ ✔`);
  }
}

main();
