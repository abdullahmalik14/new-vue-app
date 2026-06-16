// vueApp-main-new/src/systems/assets/assetScanner.js

import { log } from "../../infrastructure/logging/logHandler.js";
import { trackStep } from "../../infrastructure/logging/performanceTrackerAccess.js";
import { getAssetPreloadEntriesForSection } from "./routeSectionAssetPreloadEntries.js";

/**
 * @file assetScanner.js
 * @description Scan Vue components and templates for asset declarations
 * @purpose Extract asset preload configurations from components
 */

// Performance steps use trackStep() from performanceTrackerAccess.js (B-01)

/**
 * @function extractAssetsFromComponent
 * @description Extract asset preload configuration from Vue component
 * @param {object} component - Vue component definition
 * @returns {Array<object>} Array of asset definitions
 */
export function extractAssetsFromComponent(component) {
  log(
    "assetScanner.js",
    "extractAssetsFromComponent",
    "start",
    "Extracting assets from component",
    {
      hasComponent: !!component,
    },
  );
  trackStep({
    step: "extractAssetsFromComponent_start",
    file: "assetScanner.js",
    method: "extractAssetsFromComponent",
    flag: "start",
    purpose: "Extract assets from component",
  });

  try {
    const assets = [];

    // Check for preloadAssets in component options
    if (component.preloadAssets && Array.isArray(component.preloadAssets)) {
      assets.push(...component.preloadAssets);
      log(
        "assetScanner.js",
        "extractAssetsFromComponent",
        "found",
        "Found preloadAssets array",
        {
          count: component.preloadAssets.length,
        },
      );
    }

    // Do not call component.setup() — requires an active Vue instance (inject/provide/lifecycle).
    // Declare preloadAssets on the component options object or use PRELOAD_ASSETS instead.
    if (
      component.setup &&
      !component.preloadAssets &&
      !component.PRELOAD_ASSETS
    ) {
      log(
        "assetScanner.js",
        "extractAssetsFromComponent",
        "skip-setup",
        "Skipping setup() scan — use static preloadAssets or PRELOAD_ASSETS",
        {},
      );
    }

    // Check for PRELOAD_ASSETS constant
    if (component.PRELOAD_ASSETS && Array.isArray(component.PRELOAD_ASSETS)) {
      assets.push(...component.PRELOAD_ASSETS);
      log(
        "assetScanner.js",
        "extractAssetsFromComponent",
        "found-const",
        "Found PRELOAD_ASSETS constant",
        {
          count: component.PRELOAD_ASSETS.length,
        },
      );
    }

    log(
      "assetScanner.js",
      "extractAssetsFromComponent",
      "success",
      "Assets extracted from component",
      {
        totalCount: assets.length,
      },
    );
    trackStep({
      step: "extractAssetsFromComponent_complete",
      file: "assetScanner.js",
      method: "extractAssetsFromComponent",
      flag: "success",
      purpose: "Asset extraction complete",
    });

    return assets;
  } catch (error) {
    log(
      "assetScanner.js",
      "extractAssetsFromComponent",
      "error",
      "Error extracting assets",
      {
        error: error.message,
        stack: error.stack,
      },
    );
    trackStep({
      step: "extractAssetsFromComponent_error",
      file: "assetScanner.js",
      method: "extractAssetsFromComponent",
      flag: "error",
      purpose: "Asset extraction failed",
    });
    return [];
  }
}

/**
 * @param {string} tag
 * @param {string} attributeName
 * @returns {string|null}
 */
export function extractLiteralBoundAttribute(tag, attributeName) {
  const staticMatch = tag.match(
    new RegExp(`\\s${attributeName}=["']([^"']+)["']`, "i"),
  );

  if (staticMatch?.[1]) {
    return staticMatch[1];
  }

  const boundSingleQuoted = tag.match(
    new RegExp(
      `\\s(?::${attributeName}|v-bind:${attributeName})\\s*=\\s*"'([^']+)'"`,
      "i",
    ),
  );

  if (boundSingleQuoted?.[1]) {
    return boundSingleQuoted[1];
  }

  const boundDoubleQuoted = tag.match(
    new RegExp(
      `\\s(?::${attributeName}|v-bind:${attributeName})\\s*=\\s*'\\"([^"]+)\\"'`,
      "i",
    ),
  );

  if (boundDoubleQuoted?.[1]) {
    return boundDoubleQuoted[1];
  }

  const boundPathLiteral = tag.match(
    new RegExp(
      `\\s(?::${attributeName}|v-bind:${attributeName})\\s*=\\s*"([/@][^"]+)"`,
      "i",
    ),
  );

  if (boundPathLiteral?.[1]) {
    return boundPathLiteral[1];
  }

  return null;
}

/**
 * Extract a non-literal Vue binding expression from an attribute (M-09).
 *
 * @param {string} tag
 * @param {string} attributeName
 * @returns {string|null}
 */
export function extractBoundAttributeExpression(tag, attributeName) {
  const match = tag.match(
    new RegExp(
      `\\s(?::${attributeName}|v-bind:${attributeName})\\s*=\\s*"([^"]+)"`,
      "i",
    ),
  );

  if (!match?.[1]) {
    return null;
  }

  const expression = match[1].trim();

  if (extractLiteralBoundAttribute(tag, attributeName)) {
    return null;
  }

  return expression;
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function looksLikeAssetFlag(value) {
  return (
    typeof value === "string" &&
    /^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9-]*)+$/i.test(value)
  );
}

/**
 * Resolve `assets.slot` template bindings to asset flags declared in script literals.
 *
 * @param {string} template
 * @param {string} script
 * @returns {Array<{ flag: string, type: string, auto: boolean, source: string, slot: string }>}
 */
export function resolveAssetSlotFlagsFromScript(template, script) {
  if (!template || !script) {
    return [];
  }

  const assets = [];
  const slotPattern = /:(?:src|bind:src)\s*=\s*"assets\.(\w+)"/gi;
  let slotMatch;

  while ((slotMatch = slotPattern.exec(template)) !== null) {
    const slot = slotMatch[1];
    const flagPattern = new RegExp(
      `['"]?${slot}['"]?\\s*:\\s*['"]([^'"]+)['"]`,
      "i",
    );
    const flagMatch = script.match(flagPattern);

    if (flagMatch?.[1] && looksLikeAssetFlag(flagMatch[1])) {
      assets.push({
        flag: flagMatch[1],
        type: "image",
        auto: true,
        source: "script-slot-map",
        slot,
      });
    }
  }

  return assets;
}

/**
 * Scan script for getAssetUrl/getAssetUrls flag references (M-09).
 *
 * @param {string} script
 * @returns {Array<{ flag: string, type: string, auto: boolean, source: string }>}
 */
export function scanScriptForAssetFlagReferences(script) {
  if (!script || typeof script !== "string") {
    return [];
  }

  const flags = new Set();
  const assets = [];

  const singleFlagPattern = /getAssetUrl\s*\(\s*['"]([^'"]+)['"]/g;
  let match;

  while ((match = singleFlagPattern.exec(script)) !== null) {
    if (looksLikeAssetFlag(match[1])) {
      flags.add(match[1]);
    }
  }

  const multiFlagPattern = /getAssetUrls\s*\(\s*\[([\s\S]*?)\]\s*\)/g;

  while ((match = multiFlagPattern.exec(script)) !== null) {
    const quotedFlags = match[1].match(/['"]([^'"]+)['"]/g) || [];

    for (const quoted of quotedFlags) {
      const flag = quoted.slice(1, -1);

      if (looksLikeAssetFlag(flag)) {
        flags.add(flag);
      }
    }
  }

  for (const flag of flags) {
    assets.push({
      flag,
      type: "image",
      auto: true,
      source: "script-getAssetUrl",
    });
  }

  return assets;
}

/**
 * @param {string} tag
 * @param {string} tagName
 * @param {'image'|'video'|'audio'} type
 * @returns {Array<object>}
 */
function collectUnresolvedDynamicBindings(tag, tagName, type) {
  const expression = extractBoundAttributeExpression(tag, "src");

  if (!expression) {
    return [];
  }

  return [
    {
      type,
      auto: true,
      unresolved: true,
      expression,
      tag: tagName,
      binding: "src",
    },
  ];
}

/**
 * @param {string} template
 * @param {string} tagName
 * @param {'image'|'video'|'audio'} type
 * @returns {Array<object>}
 */
function collectMediaAssetsFromTemplate(template, tagName, type) {
  const assets = [];
  const tagRegex = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  let tagMatch;

  while ((tagMatch = tagRegex.exec(template)) !== null) {
    const tag = tagMatch[0];
    const src = extractLiteralBoundAttribute(tag, "src");

    if (src && !src.startsWith("data:") && !src.startsWith("blob:")) {
      assets.push({ src, type, auto: true });
      log(
        "assetScanner.js",
        "collectMediaAssetsFromTemplate",
        "found",
        `Found ${type} reference`,
        {
          src,
          binding:
            tag.includes(":src") || tag.includes("v-bind:src")
              ? "dynamic-literal"
              : "static",
        },
      );
      continue;
    }

    assets.push(...collectUnresolvedDynamicBindings(tag, tagName, type));
  }

  return assets;
}

/**
 * @param {Array<object>} assets
 * @returns {Array<object>}
 */
function dedupeScannedAssets(assets) {
  const seen = new Set();
  const deduped = [];

  for (const asset of assets) {
    const key = asset.src
      ? `src:${asset.src}`
      : asset.flag
        ? `flag:${asset.flag}`
        : `expr:${asset.expression}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(asset);
  }

  return deduped;
}

/**
 * @function scanComponentForAssetReferences
 * @description Scan component template for asset URLs (images, etc.)
 * @param {string} template - Component template string
 * @param {string} [script] - Optional component script for flag resolution (M-09)
 * @returns {Array<object>} Array of detected asset references
 */
export function scanComponentForAssetReferences(template, script = "") {
  log(
    "assetScanner.js",
    "scanComponentForAssetReferences",
    "start",
    "Scanning template for assets",
    {
      templateLength: template?.length,
    },
  );
  trackStep({
    step: "scanComponentForAssetReferences_start",
    file: "assetScanner.js",
    method: "scanComponentForAssetReferences",
    flag: "start",
    purpose: "Scan template for asset URLs",
  });

  try {
    const assets = [];

    if (!template || typeof template !== "string") {
      log(
        "assetScanner.js",
        "scanComponentForAssetReferences",
        "invalid",
        "Invalid template provided",
        {},
      );
      trackStep({
        step: "scanComponentForAssetReferences_invalid",
        file: "assetScanner.js",
        method: "scanComponentForAssetReferences",
        flag: "invalid",
        purpose: "Invalid template",
      });
      return assets;
    }

    assets.push(...collectMediaAssetsFromTemplate(template, "img", "image"));
    assets.push(...collectMediaAssetsFromTemplate(template, "video", "video"));
    assets.push(...collectMediaAssetsFromTemplate(template, "audio", "audio"));
    assets.push(...scanScriptForAssetFlagReferences(script));
    assets.push(...resolveAssetSlotFlagsFromScript(template, script));

    const dedupedAssets = dedupeScannedAssets(assets);

    log(
      "assetScanner.js",
      "scanComponentForAssetReferences",
      "success",
      "Template scanning complete",
      {
        totalFound: dedupedAssets.length,
      },
    );
    trackStep({
      step: "scanComponentForAssetReferences_complete",
      file: "assetScanner.js",
      method: "scanComponentForAssetReferences",
      flag: "success",
      purpose: "Template scanning complete",
    });

    return dedupedAssets;
  } catch (error) {
    log(
      "assetScanner.js",
      "scanComponentForAssetReferences",
      "error",
      "Error scanning template",
      {
        error: error.message,
        stack: error.stack,
      },
    );
    trackStep({
      step: "scanComponentForAssetReferences_error",
      file: "assetScanner.js",
      method: "scanComponentForAssetReferences",
      flag: "error",
      purpose: "Template scanning failed",
    });
    return [];
  }
}

/**
 * @function scanSectionComponents
 * @description Scan all components in a section for assets
 * @param {string} sectionName - Section name
 * @returns {Promise<Array<object>>} Array of all assets in section
 */
export async function scanSectionComponents(sectionName) {
  log(
    "assetScanner.js",
    "scanSectionComponents",
    "start",
    "Scanning section components",
    { sectionName },
  );
  trackStep({
    step: "scanSectionComponents_start",
    file: "assetScanner.js",
    method: "scanSectionComponents",
    flag: "start",
    purpose: "Scan all components in section",
  });

  try {
    const { assets: allAssets, routeCount } =
      getAssetPreloadEntriesForSection(sectionName);

    log(
      "assetScanner.js",
      "scanSectionComponents",
      "routes-found",
      "Section routes found",
      {
        sectionName,
        routeCount,
      },
    );

    log(
      "assetScanner.js",
      "scanSectionComponents",
      "success",
      "Section component scanning complete",
      {
        sectionName,
        assetCount: allAssets.length,
      },
    );
    trackStep({
      step: "scanSectionComponents_complete",
      file: "assetScanner.js",
      method: "scanSectionComponents",
      flag: "success",
      purpose: "Section scanning complete",
    });

    return allAssets;
  } catch (error) {
    log(
      "assetScanner.js",
      "scanSectionComponents",
      "error",
      "Error scanning section components",
      {
        sectionName,
        error: error.message,
        stack: error.stack,
      },
    );
    trackStep({
      step: "scanSectionComponents_error",
      file: "assetScanner.js",
      method: "scanSectionComponents",
      flag: "error",
      purpose: "Section scanning failed",
    });
    return [];
  }
}

/**
 * @function shouldIgnoreComponent
 * @description Check if component should be ignored from asset scanning
 * @param {object} component - Vue component
 * @returns {boolean} True if should ignore
 */
export function shouldIgnoreComponent(component) {
  log(
    "assetScanner.js",
    "shouldIgnoreComponent",
    "check",
    "Checking if component should be ignored",
    {},
  );

  try {
    // Check for IGNORE_ASSET_PRELOAD constant
    if (component.IGNORE_ASSET_PRELOAD === true) {
      log(
        "assetScanner.js",
        "shouldIgnoreComponent",
        "ignored",
        "Component has IGNORE_ASSET_PRELOAD=true",
        {},
      );
      return true;
    }

    // Check for ignoreAssetPreload option
    if (component.ignoreAssetPreload === true) {
      log(
        "assetScanner.js",
        "shouldIgnoreComponent",
        "ignored",
        "Component has ignoreAssetPreload option",
        {},
      );
      return true;
    }

    log(
      "assetScanner.js",
      "shouldIgnoreComponent",
      "not-ignored",
      "Component should be scanned",
      {},
    );
    return false;
  } catch (error) {
    log(
      "assetScanner.js",
      "shouldIgnoreComponent",
      "error",
      "Error checking ignore status",
      {
        error: error.message,
        stack: error.stack,
      },
    );
    return false;
  }
}

/**
 * @function normalizeAssetDefinition
 * @description Normalize asset definition to standard format
 * @param {object|string} asset - Asset definition (object or URL string)
 * @returns {object} Normalized asset definition
 */
export function normalizeAssetDefinition(asset) {
  log(
    "assetScanner.js",
    "normalizeAssetDefinition",
    "start",
    "Normalizing asset definition",
    {
      assetType: typeof asset,
    },
  );

  try {
    // If string, convert to object
    if (typeof asset === "string") {
      const normalized = {
        src: asset,
        type: inferAssetType(asset),
        priority: "low",
      };
      log(
        "assetScanner.js",
        "normalizeAssetDefinition",
        "normalized",
        "String converted to object",
        { normalized },
      );
      return normalized;
    }

    // Spread first so computed fallbacks win over null/undefined on the source object
    const src = asset.src || asset.url || asset.path;
    const normalized = {
      ...asset,
      src: src || "",
      type: asset.type || inferAssetType(src),
      priority: asset.priority || "low",
    };

    log(
      "assetScanner.js",
      "normalizeAssetDefinition",
      "normalized",
      "Asset definition normalized",
      { normalized },
    );
    return normalized;
  } catch (error) {
    log(
      "assetScanner.js",
      "normalizeAssetDefinition",
      "error",
      "Error normalizing asset",
      {
        asset,
        error: error.message,
        stack: error.stack,
      },
    );
    return { src: "", type: "unknown", priority: "low" };
  }
}

/**
 * @function inferAssetType
 * @description Infer asset type from URL/path
 * @param {string} url - Asset URL or path
 * @returns {string} Inferred type
 */
function inferAssetType(url) {
  if (!url) return "unknown";

  const ext = url.split(".").pop().toLowerCase().split("?")[0];

  const typeMap = {
    // Images
    jpg: "image",
    jpeg: "image",
    png: "image",
    gif: "image",
    webp: "image",
    svg: "image",
    // Fonts
    woff: "font",
    woff2: "font",
    ttf: "font",
    otf: "font",
    // Media
    mp4: "video",
    webm: "video",
    ogg: "video",
    mp3: "audio",
    wav: "audio",
    // Scripts
    js: "script",
    mjs: "script",
  };

  const type = typeMap[ext] || "unknown";

  log("assetScanner.js", "inferAssetType", "inferred", "Asset type inferred", {
    url,
    ext,
    type,
  });

  return type;
}
