/**
 * Individual Component CSS Generator
 * 
 * Generates separate Tailwind CSS files for components marked with tailwind-ignore.
 * Each ignored component gets its own CSS file co-located next to the component.
 */

import fs from 'fs';
import path from 'path';
import { shouldIgnoreComponent, scanDirectoryForIgnoredComponents } from './ignoredComponentHandler.js';

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
 * Generate Tailwind config for a single component
 * Creates a minimal Tailwind config that only processes this component
 * 
 * @param {string} componentPath - Path to component file
 * @param {string} outputPath - Where to write the generated CSS
 * @returns {object} Tailwind config object
 */
export function generateComponentTailwindConfig(componentPath, outputPath) {
  log('individualCssGenerator.js', 'generateComponentTailwindConfig', 'start', 'Generating Tailwind config for component', { 
    componentPath 
  });

  try {
    const config = {
      content: [componentPath], // Only scan this component
      output: outputPath,
      theme: {
        extend: {} // Inherits from main Tailwind config
      },
      plugins: []
    };

    log('individualCssGenerator.js', 'generateComponentTailwindConfig', 'success', 'Component Tailwind config generated', { 
      componentPath,
      outputPath
    });

    return config;
  } catch (error) {
    log('individualCssGenerator.js', 'generateComponentTailwindConfig', 'error', 'Error generating config', { 
      componentPath,
      error: error.message
    });
    throw error;
  }
}

/**
 * Get output CSS path for a component
 * Co-locates the CSS file next to the component
 * 
 * @param {string} componentPath - Path to component .vue file
 * @returns {string} Path where CSS should be written
 */
export function getComponentCssPath(componentPath) {
  log('individualCssGenerator.js', 'getComponentCssPath', 'start', 'Getting CSS output path', { componentPath });

  try {
    // Replace .vue extension with .css
    const cssPath = componentPath.replace(/\.vue$/, '.css');

    log('individualCssGenerator.js', 'getComponentCssPath', 'success', 'CSS path determined', { 
      componentPath,
      cssPath
    });

    return cssPath;
  } catch (error) {
    log('individualCssGenerator.js', 'getComponentCssPath', 'error', 'Error determining CSS path', { 
      componentPath,
      error: error.message
    });
    throw error;
  }
}

/**
 * Generate CSS for a single ignored component
 * Creates a Tailwind CSS file containing only the styles used by this component
 * 
 * @param {string} componentPath - Path to component file
 * @returns {Promise<string>} Path to generated CSS file
 */
export async function generateIndividualComponentCss(componentPath) {
  log('individualCssGenerator.js', 'generateIndividualComponentCss', 'start', 'Generating CSS for component', { 
    componentPath 
  });

  try {
    // Verify component exists
    if (!fs.existsSync(componentPath)) {
      throw new Error(`Component file not found: ${componentPath}`);
    }

    // Check if component should be ignored
    const shouldIgnore = shouldIgnoreComponent(componentPath);
    if (!shouldIgnore) {
      log('individualCssGenerator.js', 'generateIndividualComponentCss', 'skip', 'Component not marked for individual CSS', { 
        componentPath 
      });
      return null;
    }

    // Determine output path
    const outputCssPath = getComponentCssPath(componentPath);

    // Read component content
    const componentContent = fs.readFileSync(componentPath, 'utf-8');

    // Extract Tailwind classes from component
    const tailwindClasses = extractTailwindClasses(componentContent);

    // Generate minimal CSS content
    const cssContent = generateMinimalCssContent(tailwindClasses, componentPath);

    // Write CSS file
    fs.writeFileSync(outputCssPath, cssContent, 'utf-8');

    log('individualCssGenerator.js', 'generateIndividualComponentCss', 'success', 'Component CSS generated', { 
      componentPath,
      outputCssPath,
      classCount: tailwindClasses.length
    });

    return outputCssPath;
  } catch (error) {
    log('individualCssGenerator.js', 'generateIndividualComponentCss', 'error', 'Error generating component CSS', { 
      componentPath,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Extract Tailwind classes from component content
 * Parses the template and finds all Tailwind utility classes
 * 
 * @param {string} content - Component file content
 * @returns {Array<string>} Array of Tailwind classes
 */
function extractTailwindClasses(content) {
  log('individualCssGenerator.js', 'extractTailwindClasses', 'start', 'Extracting Tailwind classes', {});

  try {
    const classes = new Set();

    // Match class attributes in template
    // Matches: class="..." and :class="..."
    const classMatches = content.matchAll(/(?:class|:class)=["']([^"']+)["']/g);

    for (const match of classMatches) {
      const classString = match[1];
      
      // Split by spaces and filter Tailwind-like classes
      const individualClasses = classString.split(/\s+/).filter(cls => {
        // Basic check: Tailwind classes typically contain hyphens or start with common prefixes
        return cls.includes('-') || 
               /^(p|m|w|h|text|bg|flex|grid|border|rounded|shadow|opacity|z)/.test(cls);
      });

      individualClasses.forEach(cls => classes.add(cls));
    }

    // Also check for dynamic classes in JavaScript
    const dynamicClassMatches = content.matchAll(/['"`]([a-z-]+(?:-[a-z0-9]+)*)['" `]/g);
    for (const match of dynamicClassMatches) {
      const cls = match[1];
      if (cls.includes('-') && cls.length > 2) {
        classes.add(cls);
      }
    }

    const classArray = Array.from(classes);

    log('individualCssGenerator.js', 'extractTailwindClasses', 'success', 'Classes extracted', { 
      count: classArray.length 
    });

    return classArray;
  } catch (error) {
    log('individualCssGenerator.js', 'extractTailwindClasses', 'error', 'Error extracting classes', { 
      error: error.message 
    });
    return [];
  }
}

/**
 * Generate minimal CSS content for a component
 * Creates CSS that imports Tailwind and applies only the needed utilities
 * 
 * @param {Array<string>} classes - Tailwind classes to include
 * @param {string} componentPath - Path to component (for reference)
 * @returns {string} Generated CSS content
 */
function generateMinimalCssContent(classes, componentPath) {
  log('individualCssGenerator.js', 'generateMinimalCssContent', 'start', 'Generating CSS content', { 
    classCount: classes.length 
  });

  try {
    const componentName = path.basename(componentPath, '.vue');

    const cssContent = `/**
 * Auto-generated Tailwind CSS for ${componentName}
 * This file is generated automatically by the build system.
 * 
 * Component: ${componentPath}
 * Generated: ${new Date().toISOString()}
 * Classes: ${classes.length}
 */

/* Import Tailwind base, components, and utilities */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Component-specific styles */
/* Tailwind will purge unused classes during build */

/* Detected classes: ${classes.join(', ')} */
`;

    log('individualCssGenerator.js', 'generateMinimalCssContent', 'success', 'CSS content generated', { 
      length: cssContent.length 
    });

    return cssContent;
  } catch (error) {
    log('individualCssGenerator.js', 'generateMinimalCssContent', 'error', 'Error generating CSS content', { 
      error: error.message 
    });
    throw error;
  }
}

/**
 * Generate CSS for all ignored components in a directory
 * Scans directory, finds ignored components, generates individual CSS for each
 * 
 * @param {string} baseDirectory - Base directory to scan
 * @returns {Promise<Array<object>>} Array of generation results
 */
export async function generateAllIndividualComponentCss(baseDirectory) {
  log('individualCssGenerator.js', 'generateAllIndividualComponentCss', 'start', 'Generating CSS for all ignored components', { 
    baseDirectory 
  });

  try {
    // Scan for ignored components
    const ignoredComponents = scanDirectoryForIgnoredComponents(baseDirectory);

    log('individualCssGenerator.js', 'generateAllIndividualComponentCss', 'info', 'Found ignored components', { 
      count: ignoredComponents.length 
    });

    const results = [];

    // Generate CSS for each component
    for (const componentPath of ignoredComponents) {
      try {
        const cssPath = await generateIndividualComponentCss(componentPath);
        results.push({
          component: componentPath,
          css: cssPath,
          success: true
        });
      } catch (error) {
        log('individualCssGenerator.js', 'generateAllIndividualComponentCss', 'error', 'Failed to generate CSS for component', { 
          componentPath,
          error: error.message 
        });
        results.push({
          component: componentPath,
          css: null,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    log('individualCssGenerator.js', 'generateAllIndividualComponentCss', 'success', 'CSS generation complete', { 
      total: results.length,
      success: successCount,
      failed: results.length - successCount
    });

    return results;
  } catch (error) {
    log('individualCssGenerator.js', 'generateAllIndividualComponentCss', 'error', 'Error in batch CSS generation', { 
      baseDirectory,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Create a manifest of component CSS files
 * Maps component paths to their generated CSS files
 * 
 * @param {Array<object>} generationResults - Results from generateAllIndividualComponentCss
 * @returns {object} Manifest object
 */
export function createComponentCssManifest(generationResults) {
  log('individualCssGenerator.js', 'createComponentCssManifest', 'start', 'Creating CSS manifest', { 
    resultCount: generationResults.length 
  });

  try {
    const manifest = {
      generated: new Date().toISOString(),
      components: {},
      statistics: {
        total: generationResults.length,
        success: 0,
        failed: 0
      }
    };

    generationResults.forEach(result => {
      if (result.success) {
        manifest.components[result.component] = {
          css: result.css,
          relativeCss: path.relative(process.cwd(), result.css)
        };
        manifest.statistics.success++;
      } else {
        manifest.statistics.failed++;
      }
    });

    log('individualCssGenerator.js', 'createComponentCssManifest', 'success', 'Manifest created', { 
      componentCount: Object.keys(manifest.components).length 
    });

    return manifest;
  } catch (error) {
    log('individualCssGenerator.js', 'createComponentCssManifest', 'error', 'Error creating manifest', { 
      error: error.message 
    });
    throw error;
  }
}

/**
 * Clean up generated CSS files
 * Removes all .css files that were auto-generated for components
 * 
 * @param {string} baseDirectory - Base directory to clean
 * @returns {number} Number of files deleted
 */
export function cleanupGeneratedCss(baseDirectory) {
  log('individualCssGenerator.js', 'cleanupGeneratedCss', 'start', 'Cleaning up generated CSS files', { 
    baseDirectory 
  });

  try {
    let deletedCount = 0;

    const ignoredComponents = scanDirectoryForIgnoredComponents(baseDirectory);

    ignoredComponents.forEach(componentPath => {
      const cssPath = getComponentCssPath(componentPath);
      
      if (fs.existsSync(cssPath)) {
        // Verify it's an auto-generated file by checking content
        const content = fs.readFileSync(cssPath, 'utf-8');
        if (content.includes('Auto-generated Tailwind CSS')) {
          fs.unlinkSync(cssPath);
          deletedCount++;
          log('individualCssGenerator.js', 'cleanupGeneratedCss', 'deleted', 'Deleted generated CSS file', { 
            cssPath 
          });
        }
      }
    });

    log('individualCssGenerator.js', 'cleanupGeneratedCss', 'success', 'Cleanup complete', { 
      deletedCount 
    });

    return deletedCount;
  } catch (error) {
    log('individualCssGenerator.js', 'cleanupGeneratedCss', 'error', 'Error during cleanup', { 
      baseDirectory,
      error: error.message 
    });
    throw error;
  }
}

/**
 * Log generation report to console
 * Pretty-prints the results of CSS generation
 * 
 * @param {Array<object>} results - Generation results
 */
export function logGenerationReport(results) {
  const successResults = results.filter(r => r.success);
  const failedResults = results.filter(r => !r.success);

  // eslint-disable-next-line no-console
  console.log('\n========================================');
  // eslint-disable-next-line no-console
  console.log('INDIVIDUAL COMPONENT CSS GENERATION');
  // eslint-disable-next-line no-console
  console.log('========================================\n');

  // eslint-disable-next-line no-console
  console.log(`Total Components: ${results.length}`);
  // eslint-disable-next-line no-console
  console.log(`Success: ${successResults.length}`);
  // eslint-disable-next-line no-console
  console.log(`Failed: ${failedResults.length}\n`);

  if (successResults.length > 0) {
    // eslint-disable-next-line no-console
    console.log('✅ Generated CSS Files:');
    successResults.forEach(result => {
      const relativePath = path.relative(process.cwd(), result.css);
      // eslint-disable-next-line no-console
      console.log(`  - ${relativePath}`);
    });
  }

  if (failedResults.length > 0) {
    // eslint-disable-next-line no-console
    console.log('\n❌ Failed Components:');
    failedResults.forEach(result => {
      // eslint-disable-next-line no-console
      console.log(`  - ${result.component}`);
      // eslint-disable-next-line no-console
      console.log(`    Error: ${result.error}`);
    });
  }

  // eslint-disable-next-line no-console
  console.log('\n========================================\n');
}

