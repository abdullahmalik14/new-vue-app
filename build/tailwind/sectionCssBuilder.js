// vueApp-main-new/build/tailwind/sectionCssBuilder.js

import { scanRouteConfigForSections, generateContentPathsForSection } from './sectionScanner.js';
import { filterContentPathsWithIgnores, getIgnoredComponentsReport } from './ignoredComponentHandler.js';

/**
 * @file sectionCssBuilder.js
 * @description Build section-specific Tailwind CSS configurations
 * @purpose Generate Tailwind configs for each section at build time
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
 * @function buildSectionTailwindConfig
 * @description Build Tailwind config for a specific section
 * @param {string} sectionName - Section name
 * @param {object} sectionMetadata - Section metadata
 * @param {string} baseDir - Base directory
 * @returns {object} Tailwind config object for section
 */
export function buildSectionTailwindConfig(sectionName, sectionMetadata, baseDir = 'src') {
  log('sectionCssBuilder.js', 'buildSectionTailwindConfig', 'start', 'Building section Tailwind config', { 
    sectionName 
  });

  try {
    // Generate content paths
    let contentPaths = generateContentPathsForSection(sectionName, sectionMetadata, baseDir);

    // Filter out ignored components
    contentPaths = filterContentPathsWithIgnores(contentPaths, baseDir);

    const config = {
      section: sectionName,
      content: contentPaths,
      cssOutput: `dist/assets/section-${sectionName}.css`,
      componentCount: sectionMetadata.components.length,
      routeCount: sectionMetadata.routes.length
    };

    log('sectionCssBuilder.js', 'buildSectionTailwindConfig', 'success', 'Section config built', { 
      sectionName, 
      contentPathCount: contentPaths.length 
    });

    return config;
  } catch (error) {
    log('sectionCssBuilder.js', 'buildSectionTailwindConfig', 'error', 'Error building section config', { 
      sectionName, 
      error: error.message, 
      stack: error.stack 
    });
    throw error;
  }
}

/**
 * @function buildAllSectionConfigs
 * @description Build Tailwind configs for all sections
 * @param {string} routeConfigPath - Path to routeConfig.json
 * @param {string} baseDir - Base directory
 * @returns {Map<string, object>} Map of section to Tailwind config
 */
export function buildAllSectionConfigs(routeConfigPath, baseDir = 'src') {
  log('sectionCssBuilder.js', 'buildAllSectionConfigs', 'start', 'Building all section configs', {});

  try {
    const sections = scanRouteConfigForSections(routeConfigPath);
    const sectionConfigs = new Map();

    for (const [sectionName, metadata] of sections.entries()) {
      const config = buildSectionTailwindConfig(sectionName, metadata, baseDir);
      sectionConfigs.set(sectionName, config);
    }

    log('sectionCssBuilder.js', 'buildAllSectionConfigs', 'success', 'All section configs built', { 
      sectionCount: sectionConfigs.size 
    });

    return sectionConfigs;
  } catch (error) {
    log('sectionCssBuilder.js', 'buildAllSectionConfigs', 'error', 'Error building all configs', { 
      error: error.message, 
      stack: error.stack 
    });
    throw error;
  }
}

/**
 * @function generateSectionCssBuildReport
 * @description Generate build report for section CSS
 * @param {string} routeConfigPath - Path to routeConfig.json
 * @param {string} baseDir - Base directory
 * @returns {object} Build report
 */
export function generateSectionCssBuildReport(routeConfigPath, baseDir = 'src') {
  log('sectionCssBuilder.js', 'generateSectionCssBuildReport', 'start', 'Generating section CSS build report', {});

  try {
    const sectionConfigs = buildAllSectionConfigs(routeConfigPath, baseDir);
    const ignoredReport = getIgnoredComponentsReport(baseDir);

    const report = {
      timestamp: new Date().toISOString(),
      totalSections: sectionConfigs.size,
      sections: Array.from(sectionConfigs.entries()).map(([name, config]) => ({
        name,
        contentPathCount: config.content.length,
        componentCount: config.componentCount,
        routeCount: config.routeCount,
        cssOutput: config.cssOutput
      })),
      ignoredComponents: {
        total: ignoredReport.totalIgnored,
        components: ignoredReport.components
      },
      statistics: {
        totalContentPaths: Array.from(sectionConfigs.values())
          .reduce((sum, config) => sum + config.content.length, 0),
        totalComponents: Array.from(sectionConfigs.values())
          .reduce((sum, config) => sum + config.componentCount, 0),
        totalRoutes: Array.from(sectionConfigs.values())
          .reduce((sum, config) => sum + config.routeCount, 0),
        averageComponentsPerSection: Math.round(
          Array.from(sectionConfigs.values())
            .reduce((sum, config) => sum + config.componentCount, 0) / sectionConfigs.size
        )
      }
    };

    log('sectionCssBuilder.js', 'generateSectionCssBuildReport', 'success', 'Build report generated', { 
      totalSections: report.totalSections,
      totalIgnored: report.ignoredComponents.total
    });

    return report;
  } catch (error) {
    log('sectionCssBuilder.js', 'generateSectionCssBuildReport', 'error', 'Error generating report', { 
      error: error.message, 
      stack: error.stack 
    });
    return {
      timestamp: new Date().toISOString(),
      error: error.message,
      sections: [],
      ignoredComponents: { total: 0, components: [] },
      statistics: {}
    };
  }
}

/**
 * @function logSectionBuildInfo
 * @description Log section CSS build information (for development)
 * @param {string} routeConfigPath - Path to routeConfig.json
 * @param {string} baseDir - Base directory
 * @returns {void}
 */
export function logSectionBuildInfo(routeConfigPath, baseDir = 'src') {
  log('sectionCssBuilder.js', 'logSectionBuildInfo', 'start', 'Logging section build information', {});

  try {
    const report = generateSectionCssBuildReport(routeConfigPath, baseDir);

    // eslint-disable-next-line no-console
    console.log('\n========================================');
    // eslint-disable-next-line no-console
    console.log('TAILWIND SECTION BUILD REPORT');
    // eslint-disable-next-line no-console
    console.log('========================================\n');

    // eslint-disable-next-line no-console
    console.log(`Total Sections: ${report.totalSections}`);
    // eslint-disable-next-line no-console
    console.log(`Total Components: ${report.statistics.totalComponents}`);
    // eslint-disable-next-line no-console
    console.log(`Total Routes: ${report.statistics.totalRoutes}`);
    // eslint-disable-next-line no-console
    console.log(`Ignored Components: ${report.ignoredComponents.total}\n`);

    // eslint-disable-next-line no-console
    console.log('Section Details:');
    for (const section of report.sections) {
      // eslint-disable-next-line no-console
      console.log(`  - ${section.name}:`);
      // eslint-disable-next-line no-console
      console.log(`      Components: ${section.componentCount}`);
      // eslint-disable-next-line no-console
      console.log(`      Routes: ${section.routeCount}`);
      // eslint-disable-next-line no-console
      console.log(`      Content Paths: ${section.contentPathCount}`);
    }

    if (report.ignoredComponents.total > 0) {
      // eslint-disable-next-line no-console
      console.log('\nIgnored Components:');
      for (const component of report.ignoredComponents.components) {
        // eslint-disable-next-line no-console
        console.log(`  - ${component.relativePath}`);
        // eslint-disable-next-line no-console
        console.log(`      Reason: ${component.reason}`);
      }
    }

    // eslint-disable-next-line no-console
    console.log('\n========================================\n');

    log('sectionCssBuilder.js', 'logSectionBuildInfo', 'success', 'Build information logged', {});
  } catch (error) {
    log('sectionCssBuilder.js', 'logSectionBuildInfo', 'error', 'Error logging build info', { 
      error: error.message, 
      stack: error.stack 
    });
  }
}

/**
 * @function getSectionContentPaths
 * @description Get content paths for a specific section (for Tailwind config)
 * @param {string} sectionName - Section name
 * @param {string} routeConfigPath - Path to routeConfig.json
 * @param {string} baseDir - Base directory
 * @returns {Array<string>} Content paths for the section
 */
export function getSectionContentPaths(sectionName, routeConfigPath, baseDir = 'src') {
  log('sectionCssBuilder.js', 'getSectionContentPaths', 'start', 'Getting section content paths', { sectionName });

  try {
    const sections = scanRouteConfigForSections(routeConfigPath);
    const sectionMetadata = sections.get(sectionName);

    if (!sectionMetadata) {
      log('sectionCssBuilder.js', 'getSectionContentPaths', 'not-found', 'Section not found', { sectionName });
      return [];
    }

    const config = buildSectionTailwindConfig(sectionName, sectionMetadata, baseDir);

    log('sectionCssBuilder.js', 'getSectionContentPaths', 'success', 'Content paths retrieved', { 
      sectionName, 
      pathCount: config.content.length 
    });

    return config.content;
  } catch (error) {
    log('sectionCssBuilder.js', 'getSectionContentPaths', 'error', 'Error getting content paths', { 
      sectionName, 
      error: error.message, 
      stack: error.stack 
    });
    return [];
  }
}

