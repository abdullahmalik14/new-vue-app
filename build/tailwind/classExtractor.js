/**
 * Class Extractor for Tailwind CSS
 * 
 * Extracts all Tailwind classes from Vue components including:
 * - Standard Tailwind utilities
 * - Numeric utilities (pb-678, mt-234, etc.)
 * - Custom utilities
 * - Dynamic class bindings
 */

import fs from 'fs';
import path from 'path';

/**
 * Log helper for build-time logging
 */
function log(file, method, flag, description, data) {
  if (process.env.VITE_ENABLE_LOGGER === 'true') {
    const timestamp = new Date().toISOString();
    const dataStr = data ? JSON.stringify(data) : '{}';
    // eslint-disable-next-line no-console
    console.log(`[${timestamp}] [${file}] [${method}] [${flag}] ${description} ${dataStr}`);
  }
}

/**
 * Extract all Tailwind classes from a file
 * Handles both static and dynamic class bindings
 * 
 * @param {string} filePath - Path to file
 * @returns {Set<string>} Set of unique class names
 */
export function extractClassesFromFile(filePath) {
  log('classExtractor.js', 'extractClassesFromFile', 'start', 'Extracting classes from file', { filePath });

  try {
    if (!fs.existsSync(filePath)) {
      log('classExtractor.js', 'extractClassesFromFile', 'not-found', 'File not found', { filePath });
      return new Set();
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return extractClassesFromContent(content);
  } catch (error) {
    log('classExtractor.js', 'extractClassesFromFile', 'error', 'Error extracting classes', {
      filePath,
      error: error.message
    });
    return new Set();
  }
}

/**
 * Extract all Tailwind classes from content string
 * 
 * @param {string} content - File content
 * @returns {Set<string>} Set of unique class names
 */
export function extractClassesFromContent(content) {
  const classes = new Set();

  // Pattern 1: Standard class attributes
  // Matches: class="..." and :class="..."
  const classMatches = content.matchAll(/(?:class|:class|v-bind:class)=["']([^"']+)["']/g);
  for (const match of classMatches) {
    extractClassesFromString(match[1], classes);
  }

  // Pattern 2: Dynamic class bindings with objects
  // Matches: :class="{ 'class-name': condition }"
  const objectClassMatches = content.matchAll(/:class=["']?\{([^}]+)\}["']?/g);
  for (const match of objectClassMatches) {
    extractClassesFromObjectBinding(match[1], classes);
  }

  // Pattern 3: Dynamic class bindings with arrays
  // Matches: :class="['class1', 'class2']"
  const arrayClassMatches = content.matchAll(/:class=["']?\[([^\]]+)\]["']?/g);
  for (const match of arrayClassMatches) {
    extractClassesFromArrayBinding(match[1], classes);
  }

  // Pattern 4: Classes in template literals
  // Matches: `class-name ${variable}`
  const templateLiteralMatches = content.matchAll(/`([^`]*)`/g);
  for (const match of templateLiteralMatches) {
    extractClassesFromString(match[1], classes);
  }

  // Pattern 5: classList operations
  // Matches: classList.add('class-name')
  const classListMatches = content.matchAll(/classList\.(add|remove|toggle)\(['"]([^'"]+)['"]\)/g);
  for (const match of classMatches) {
    extractClassesFromString(match[2], classes);
  }

  log('classExtractor.js', 'extractClassesFromContent', 'success', 'Classes extracted', {
    count: classes.size
  });

  return classes;
}

/**
 * Extract classes from a string (space-separated)
 * Detects standard Tailwind classes and numeric utilities
 * 
 * @param {string} str - String containing classes
 * @param {Set<string>} classes - Set to add classes to
 */
function extractClassesFromString(str, classes) {
  // Split by spaces and filter valid Tailwind classes
  const tokens = str.split(/\s+/);

  for (const token of tokens) {
    if (isTailwindClass(token)) {
      classes.add(token);
    }
  }
}

/**
 * Extract classes from object binding syntax
 * Example: { 'bg-blue-500': isActive, 'p-4': true }
 * 
 * @param {string} objStr - Object binding string
 * @param {Set<string>} classes - Set to add classes to
 */
function extractClassesFromObjectBinding(objStr, classes) {
  // Match class names in quotes
  const classMatches = objStr.matchAll(/['"]([^'"]+)['"]\s*:/g);

  for (const match of classMatches) {
    extractClassesFromString(match[1], classes);
  }
}

/**
 * Extract classes from array binding syntax
 * Example: ['bg-blue-500', condition && 'p-4', variable]
 * 
 * @param {string} arrStr - Array binding string
 * @param {Set<string>} classes - Set to add classes to
 */
function extractClassesFromArrayBinding(arrStr, classes) {
  // Match strings in quotes
  const classMatches = arrStr.matchAll(/['"]([^'"]+)['"]/g);

  for (const match of classMatches) {
    extractClassesFromString(match[1], classes);
  }
}

/**
 * Check if a token is a valid Tailwind class
 * Includes support for numeric utilities like pb-678
 * 
 * @param {string} token - Token to check
 * @returns {boolean} True if valid Tailwind class
 */
function isTailwindClass(token) {
  if (!token || token.length < 2) {
    return false;
  }

  // Remove leading/trailing special characters
  const cleaned = token.replace(/^[^a-z-]+|[^a-z0-9-]+$/gi, '');

  if (!cleaned) {
    return false;
  }

  // Standard Tailwind prefixes
  const standardPrefixes = [
    'p-', 'm-', 'pt-', 'pr-', 'pb-', 'pl-', 'px-', 'py-',
    'mt-', 'mr-', 'mb-', 'ml-', 'mx-', 'my-',
    'w-', 'h-', 'min-w-', 'min-h-', 'max-w-', 'max-h-',
    'text-', 'font-', 'leading-', 'tracking-', 'line-clamp-',
    'bg-', 'from-', 'via-', 'to-',
    'border-', 'rounded-',
    'flex-', 'grid-', 'gap-', 'space-x-', 'space-y-',
    'justify-', 'items-', 'content-', 'self-', 'place-',
    'overflow-', 'overscroll-',
    'z-', 'opacity-',
    'shadow-', 'ring-', 'outline-',
    'transition-', 'duration-', 'ease-', 'delay-',
    'transform', 'scale-', 'rotate-', 'translate-', 'skew-',
    'cursor-', 'pointer-events-', 'select-', 'resize-',
    'sr-', 'not-sr-',
    'animate-',
    'top-', 'right-', 'bottom-', 'left-', 'inset-',
    'order-',
    'col-', 'row-',
    'auto-', 'break-',
    'decoration-', 'underline-offset-',
    'backdrop-', 'brightness-', 'contrast-', 'grayscale-', 'hue-rotate-',
    'invert-', 'saturate-', 'sepia-', 'blur-', 'drop-shadow-',
    'fill-', 'stroke-',
    'object-',
    'aspect-',
    'columns-', 'break-before-', 'break-after-', 'break-inside-',
    'box-',
    'float-', 'clear-',
    'isolate', 'isolation-',
    'object-', 'mix-blend-', 'bg-blend-',
    'divide-', 'divide-x-', 'divide-y-',
    'ring-offset-',
    'scroll-', 'snap-', 'touch-',
    'will-change-',
    'contain-',
    'appearance-',
    'caret-',
    'accent-',
    'list-'
  ];

  // Check if starts with any standard prefix
  const hasStandardPrefix = standardPrefixes.some(prefix => cleaned.startsWith(prefix));

  // Check for numeric utility pattern (prefix-number)
  const numericPattern = /^[a-z]+-\d+$/i;
  const isNumericUtility = numericPattern.test(cleaned);

  // Check for modifier prefixes (hover:, focus:, lg:, dark:, etc.)
  const modifierPattern = /^(hover|focus|active|visited|disabled|checked|enabled|required|valid|invalid|in-range|out-of-range|placeholder-shown|autofill|read-only|before|after|first-letter|first-line|marker|selection|file|backdrop|placeholder|sm|md|lg|xl|2xl|dark|motion-safe|motion-reduce|first|last|odd|even|group-hover|group-focus|peer-checked|peer-focus):/;
  const hasModifier = modifierPattern.test(cleaned);

  // Check for common standalone classes
  const standaloneClasses = [
    'hidden', 'block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid',
    'flow-root', 'contents', 'table', 'table-row', 'table-cell',
    'static', 'fixed', 'absolute', 'relative', 'sticky',
    'visible', 'invisible', 'collapse',
    'truncate', 'ellipsis', 'break-normal', 'break-words', 'break-all',
    'uppercase', 'lowercase', 'capitalize', 'normal-case',
    'underline', 'overline', 'line-through', 'no-underline',
    'italic', 'not-italic',
    'antialiased', 'subpixel-antialiased',
    'container'
  ];
  const isStandaloneClass = standaloneClasses.includes(cleaned);

  // Check for arbitrary values: [100px], [#ff0000], etc.
  const hasArbitraryValue = cleaned.includes('[') && cleaned.includes(']');

  return hasStandardPrefix || isNumericUtility || hasModifier || isStandaloneClass || hasArbitraryValue;
}

/**
 * Extract all numeric utilities from a set of classes
 * Numeric utilities are custom padding/margin/spacing values like pb-678
 * 
 * @param {Set<string>} classes - Set of all classes
 * @returns {Set<string>} Set of numeric utilities
 */
export function extractNumericUtilities(classes) {
  const numericUtilities = new Set();
  const numericPattern = /^([a-z]+-)\d+$/i;

  for (const cls of classes) {
    if (numericPattern.test(cls)) {
      numericUtilities.add(cls);
    }
  }

  log('classExtractor.js', 'extractNumericUtilities', 'success', 'Numeric utilities extracted', {
    count: numericUtilities.size,
    utilities: Array.from(numericUtilities)
  });

  return numericUtilities;
}

/**
 * Extract classes from multiple files
 * 
 * @param {Array<string>} filePaths - Array of file paths
 * @returns {Set<string>} Set of all unique classes
 */
export function extractClassesFromFiles(filePaths) {
  log('classExtractor.js', 'extractClassesFromFiles', 'start', 'Extracting classes from multiple files', {
    fileCount: filePaths.length
  });

  const allClasses = new Set();

  for (const filePath of filePaths) {
    const classes = extractClassesFromFile(filePath);
    classes.forEach(cls => allClasses.add(cls));
  }

  log('classExtractor.js', 'extractClassesFromFiles', 'success', 'All classes extracted', {
    fileCount: filePaths.length,
    classCount: allClasses.size
  });

  return allClasses;
}

/**
 * Extract classes from content paths (with glob support)
 * Resolves globs and extracts classes from all matching files
 * 
 * @param {Array<string>} contentPaths - Array of file paths or globs
 * @param {string} baseDir - Base directory for resolving paths
 * @returns {Set<string>} Set of all unique classes
 */
export function extractClassesFromContentPaths(contentPaths, baseDir = '.') {
  log('classExtractor.js', 'extractClassesFromContentPaths', 'start', 'Extracting classes from content paths', {
    pathCount: contentPaths.length
  });

  const allClasses = new Set();
  const resolvedFiles = [];

  for (const contentPath of contentPaths) {
    // Skip exclusion patterns (starting with !)
    if (contentPath.startsWith('!')) {
      continue;
    }

    // Check if it's a glob pattern
    if (contentPath.includes('*')) {
      const files = resolveGlobPattern(contentPath, baseDir);
      resolvedFiles.push(...files);
    } else {
      // Direct file path
      const fullPath = path.isAbsolute(contentPath)
        ? contentPath
        : path.join(baseDir, contentPath);

      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        resolvedFiles.push(fullPath);
      }
    }
  }

  // Extract classes from all resolved files
  for (const filePath of resolvedFiles) {
    const classes = extractClassesFromFile(filePath);
    classes.forEach(cls => allClasses.add(cls));
  }

  log('classExtractor.js', 'extractClassesFromContentPaths', 'success', 'Classes extracted from content paths', {
    pathCount: contentPaths.length,
    fileCount: resolvedFiles.length,
    classCount: allClasses.size
  });

  return allClasses;
}

/**
 * Resolve a glob pattern to actual file paths
 * Simple implementation without external dependencies
 * 
 * @param {string} pattern - Glob pattern
 * @param {string} baseDir - Base directory
 * @returns {Array<string>} Array of resolved file paths
 */
function resolveGlobPattern(pattern, baseDir) {
  const files = [];

  // Convert glob pattern to regex
  // Simple support for ** and * patterns
  const regexPattern = pattern
    .replace(/\\/g, '/')
    .replace(/\*\*/g, '<<<DOUBLESTAR>>>')
    .replace(/\*/g, '[^/]*')
    .replace(/<<<DOUBLESTAR>>>/g, '.*')
    .replace(/\./g, '\\.');

  const regex = new RegExp(regexPattern);

  // Recursively scan directory
  function scanDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

        try {
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            // Skip common directories
            if (item === 'node_modules' || item === '.git' || item === 'dist') {
              continue;
            }
            scanDirectory(fullPath);
          } else if (stat.isFile()) {
            // Check if file matches pattern
            const patternToCheck = pattern.startsWith('./') ? './' + relativePath : relativePath;
            if (regex.test(patternToCheck) || regex.test(relativePath)) {
              files.push(fullPath);
            }
          }
        } catch (statError) {
          // Skip files that can't be accessed
          continue;
        }
      }
    } catch (readError) {
      // Skip directories that can't be read
    }
  }

  // Start scanning from base directory
  const scanPath = pattern.startsWith('./') ? baseDir : path.join(baseDir, pattern.split('/')[0]);

  if (fs.existsSync(scanPath)) {
    if (fs.statSync(scanPath).isDirectory()) {
      scanDirectory(scanPath);
    }
  }

  return files;
}

/**
 * Generate safelist entries for numeric utilities
 * Creates Tailwind config safelist entries for custom numeric values
 * 
 * @param {Set<string>} numericUtilities - Set of numeric utilities
 * @returns {Array<string|object>} Safelist entries
 */
export function generateSafelistForNumericUtilities(numericUtilities) {
  const safelist = [];

  for (const utility of numericUtilities) {
    // Extract the numeric value
    const match = utility.match(/^([a-z]+-)?(\d+)$/i);
    if (match) {
      // Add pattern to safelist
      safelist.push({
        pattern: new RegExp(`^${utility.replace(/\d+/, '\\d+')}$`),
        variants: ['hover', 'focus', 'active', 'sm', 'md', 'lg', 'xl', '2xl']
      });
    }
  }

  log('classExtractor.js', 'generateSafelistForNumericUtilities', 'success', 'Safelist generated', {
    count: safelist.length
  });

  return safelist;
}

