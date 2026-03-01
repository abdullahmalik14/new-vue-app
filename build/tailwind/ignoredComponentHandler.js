// vueApp-main-new/build/tailwind/ignoredComponentHandler.js

import fs from 'fs';
import path from 'path';

/**
 * @file ignoredComponentHandler.js
 * @description Handle components that should be ignored by Tailwind
 * @purpose Detect and exclude components with tailwind-ignore markers
 */

/**
 * @function log
 * @description Simple build-time logging
 * @param {string} file - File name
 * @param {string} method - Method name
 * @param {string} flag - Log flag
 * @param {string} description - Description
 * @param {object} data - Data to log
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
 * @function checkCommentIgnore
 * @description Check if component has  "tailwind-ignore" comment
 * @param {string} content - Component file content
 * @returns {boolean} True if has ignore comment
 */
export function checkCommentIgnore(content) {
  log('ignoredComponentHandler.js', 'checkCommentIgnore', 'check', 'Checking for tailwind-ignore comment', {});

  try {
    const hasIgnoreComment = content.includes('/* tailwind-ignore */') ||
      content.includes('// tailwind-ignore') ||
      content.includes('<!-- tailwind-ignore -->');

    log('ignoredComponentHandler.js', 'checkCommentIgnore', 'result', 'Comment ignore check complete', {
      hasIgnoreComment
    });

    return hasIgnoreComment;
  } catch (error) {
    log('ignoredComponentHandler.js', 'checkCommentIgnore', 'error', 'Error checking comment', {
      error: error.message
    });
    return false;
  }
}

/**
 * @function checkExportIgnore
 * @description Check if component has export const IGNORE_TAILWIND = true
 * @param {string} content - Component file content
 * @returns {boolean} True if has export ignore
 */
export function checkExportIgnore(content) {
  log('ignoredComponentHandler.js', 'checkExportIgnore', 'check', 'Checking for IGNORE_TAILWIND export', {});

  try {
    const hasExportIgnore = /export\s+const\s+IGNORE_TAILWIND\s*=\s*true/i.test(content);

    log('ignoredComponentHandler.js', 'checkExportIgnore', 'result', 'Export ignore check complete', {
      hasExportIgnore
    });

    return hasExportIgnore;
  } catch (error) {
    log('ignoredComponentHandler.js', 'checkExportIgnore', 'error', 'Error checking export', {
      error: error.message
    });
    return false;
  }
}

/**
 * @function shouldIgnoreComponent
 * @description Check if component should be ignored by Tailwind
 * @param {string} filePath - Path to component file
 * @returns {boolean} True if should be ignored
 */
export function shouldIgnoreComponent(filePath) {
  log('ignoredComponentHandler.js', 'shouldIgnoreComponent', 'start', 'Checking if component should be ignored', { filePath });

  try {
    if (!fs.existsSync(filePath)) {
      log('ignoredComponentHandler.js', 'shouldIgnoreComponent', 'not-found', 'File not found', { filePath });
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    const commentIgnore = checkCommentIgnore(content);
    const exportIgnore = checkExportIgnore(content);
    const shouldIgnore = commentIgnore || exportIgnore;

    log('ignoredComponentHandler.js', 'shouldIgnoreComponent', 'result', 'Ignore check complete', {
      filePath,
      commentIgnore,
      exportIgnore,
      shouldIgnore
    });

    return shouldIgnore;
  } catch (error) {
    log('ignoredComponentHandler.js', 'shouldIgnoreComponent', 'error', 'Error checking component', {
      filePath,
      error: error.message,
      stack: error.stack
    });
    return false;
  }
}

/**
 * @function scanDirectoryForIgnoredComponents
 * @description Scan directory for components with ignore markers
 * @param {string} directory - Directory to scan
 * @param {Array<string>} extensions - File extensions to check (default: ['.vue'])
 * @returns {Array<string>} Array of ignored component paths
 */
export function scanDirectoryForIgnoredComponents(directory, extensions = ['.vue']) {
  log('ignoredComponentHandler.js', 'scanDirectoryForIgnoredComponents', 'start', 'Scanning directory for ignored components', { directory });

  try {
    const ignoredComponents = [];

    if (!fs.existsSync(directory)) {
      log('ignoredComponentHandler.js', 'scanDirectoryForIgnoredComponents', 'not-found', 'Directory not found', { directory });
      return ignoredComponents;
    }

    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip node_modules and other common excludes
          if (item === 'node_modules' || item === '.git' || item === 'dist') {
            continue;
          }
          scanDirectory(fullPath);
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            if (shouldIgnoreComponent(fullPath)) {
              ignoredComponents.push(fullPath);
              log('ignoredComponentHandler.js', 'scanDirectoryForIgnoredComponents', 'ignored', 'Component marked for ignore', {
                filePath: fullPath
              });
            }
          }
        }
      }
    };

    scanDirectory(directory);

    log('ignoredComponentHandler.js', 'scanDirectoryForIgnoredComponents', 'success', 'Directory scan complete', {
      directory,
      ignoredCount: ignoredComponents.length
    });

    return ignoredComponents;
  } catch (error) {
    log('ignoredComponentHandler.js', 'scanDirectoryForIgnoredComponents', 'error', 'Error scanning directory', {
      directory,
      error: error.message,
      stack: error.stack
    });
    return [];
  }
}

/**
 * @function generateExclusionPatterns
 * @description Generate glob exclusion patterns for ignored components
 * @param {Array<string>} ignoredComponents - Array of ignored component paths
 * @returns {Array<string>} Array of exclusion patterns
 */
export function generateExclusionPatterns(ignoredComponents) {
  log('ignoredComponentHandler.js', 'generateExclusionPatterns', 'start', 'Generating exclusion patterns', {
    count: ignoredComponents.length
  });

  try {
    const patterns = ignoredComponents.map(filePath => {
      // Convert absolute path to relative glob pattern
      const normalized = filePath.replace(/\\/g, '/');
      return `!${normalized}`;
    });

    log('ignoredComponentHandler.js', 'generateExclusionPatterns', 'success', 'Exclusion patterns generated', {
      patternCount: patterns.length
    });

    return patterns;
  } catch (error) {
    log('ignoredComponentHandler.js', 'generateExclusionPatterns', 'error', 'Error generating patterns', {
      error: error.message
    });
    return [];
  }
}

/**
 * @function filterContentPathsWithIgnores
 * @description Filter content paths to exclude ignored components
 * @param {Array<string>} contentPaths - Original content paths
 * @param {string} baseDirectory - Base directory to scan
 * @returns {Array<string>} Filtered content paths
 */
export function filterContentPathsWithIgnores(contentPaths, baseDirectory) {
  log('ignoredComponentHandler.js', 'filterContentPathsWithIgnores', 'start', 'Filtering content paths', {
    originalCount: contentPaths.length,
    baseDirectory
  });

  try {
    const ignoredComponents = scanDirectoryForIgnoredComponents(baseDirectory);
    const exclusionPatterns = generateExclusionPatterns(ignoredComponents);

    const filteredPaths = [...contentPaths, ...exclusionPatterns];

    log('ignoredComponentHandler.js', 'filterContentPathsWithIgnores', 'success', 'Content paths filtered', {
      originalCount: contentPaths.length,
      ignoredCount: ignoredComponents.length,
      filteredCount: filteredPaths.length
    });

    return filteredPaths;
  } catch (error) {
    log('ignoredComponentHandler.js', 'filterContentPathsWithIgnores', 'error', 'Error filtering paths', {
      error: error.message,
      stack: error.stack
    });
    return contentPaths;
  }
}

/**
 * @function getIgnoredComponentsReport
 * @description Generate report of ignored components
 * @param {string} baseDirectory - Base directory to scan
 * @returns {object} Report with ignored components and statistics
 */
export function getIgnoredComponentsReport(baseDirectory) {
  log('ignoredComponentHandler.js', 'getIgnoredComponentsReport', 'start', 'Generating ignored components report', { baseDirectory });

  try {
    const ignoredComponents = scanDirectoryForIgnoredComponents(baseDirectory);

    const report = {
      baseDirectory,
      totalIgnored: ignoredComponents.length,
      components: ignoredComponents.map(filePath => ({
        path: filePath,
        relativePath: path.relative(baseDirectory, filePath),
        reason: determineIgnoreReason(filePath)
      })),
      timestamp: new Date().toISOString()
    };

    log('ignoredComponentHandler.js', 'getIgnoredComponentsReport', 'success', 'Report generated', {
      totalIgnored: report.totalIgnored
    });

    return report;
  } catch (error) {
    log('ignoredComponentHandler.js', 'getIgnoredComponentsReport', 'error', 'Error generating report', {
      error: error.message,
      stack: error.stack
    });
    return {
      baseDirectory,
      totalIgnored: 0,
      components: [],
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * @function determineIgnoreReason
 * @description Determine why a component is being ignored
 * @param {string} filePath - Component file path
 * @returns {string} Reason for ignoring
 */
function determineIgnoreReason(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    if (checkCommentIgnore(content)) {
      return 'Has /* tailwind-ignore */ comment';
    }
    if (checkExportIgnore(content)) {
      return 'Has export const IGNORE_TAILWIND = true';
    }
    return 'Unknown reason';
  } catch (error) {
    return `Error reading file: ${error.message}`;
  }
}

