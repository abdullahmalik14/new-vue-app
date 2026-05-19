/* Version: 2025-10-05T00:37:08.623Z */
DebugLogger?.log?.("chartsUtilities.js", "version", "INFO", {
  version: "2025-10-05T00:37:08.623Z",
});

/**
 * ChartsUtilities
 *
 * Standalone utility functions for chart operations, DOM manipulation, date calculations,
 * color normalization, network requests, and event emission.
 *
 * @namespace ChartsUtilities
 */
window.ChartsUtilities = (function() {
  'use strict';

  /**
   * --------------------------------
   * SECTION: DOM UTILITIES
   * --------------------------------
   */

  /**
   * Safely retrieve a data-* attribute from an element.
   *
   * @param {HTMLElement} element - The element containing the data attribute.
   * @param {string} attributeName - The name of the data attribute (without "data-").
   * @param {string} [defaultValue=""] - Fallback value if the attribute is missing.
   *
   * @returns {string} The attribute value or the provided default.
   */
  function getDataAttribute(element, attributeName, defaultValue = "") {
    // Validate element and attribute name inputs
    if (!element || !attributeName) {
      // Return default value when inputs are invalid
      return defaultValue;
    }

    // Read the data attribute using optional chaining
    const attributeValue = element.getAttribute?.(`data-${attributeName}`);

    // Return default when attribute is null or undefined
    return attributeValue == null ? defaultValue : attributeValue;
  }

  /**
   * Retrieve and parse a JSON configuration from an element attribute.
   *
   * @param {HTMLElement} element - The element containing the configuration attribute.
   * @param {string} [attributeName="data-chart-config"] - The attribute name to read and parse.
   * @param {Object} [options={}] - Options including logPrefix for logging.
   *
   * @returns {Object|Array|null} Parsed configuration object, array, primitive, or null on error.
   */
  function getConfigJSON(element, attributeName = "data-chart-config", options = {}) {
      DebugLogger.log(
        "chartsUtilities.js",
        "getConfigJSON",
        "START",
        {
          attributeName,
          hasElement: !!element,
        },
      );

    // Validate the element and attribute API
    if (!element || typeof element.getAttribute !== "function") {
      // Log invalid element error
        DebugLogger.error(
          "chartsUtilities.js",
          "getConfigJSON",
          "INVALID_ELEMENT",
          {
            message: "Invalid element or getAttribute unavailable",
            attributeName,
          },
          { flags: ["CRITICAL"] },
        );

        DebugLogger.log(
          "chartsUtilities.js",
          "getConfigJSON",
          "END",
          { success: false },
        );

      // Return null on invalid element
      return null;
    }

    // Read the raw attribute value
    const rawValue = element.getAttribute(attributeName);

    // Check for empty or missing attribute
    if (rawValue == null || rawValue === "") {
      // Warn skip due to missing attribute
      DebugLogger.warn(
        "chartsUtilities.js",
        "getConfigJSON",
        "SKIP",
        {
          reason: "missing-or-empty-attribute",
          attributeName,
        },
      );

      DebugLogger.log(
        "chartsUtilities.js",
        "getConfigJSON",
        "END",
        { success: false },
      );

      // Return null when attribute is missing
      return null;
    }

    // Compute raw value length
    const rawLength = rawValue.length;

    // Log attribute read summary
    DebugLogger.log(
      "chartsUtilities.js",
      "getConfigJSON",
      "READ_ATTRIBUTE",
      {
        action: "read-attribute",
        attributeName,
        rawLength,
      },
    );

    // Define maximum inline JSON length
    const MAX_INLINE_LEN = 200000;

    // Warn when inline JSON exceeds threshold
    if (rawLength > MAX_INLINE_LEN) {
      // Log oversized inline JSON warning
      DebugLogger.warn(
        "chartsUtilities.js",
        "getConfigJSON",
        "OVER_SIZE",
        {
          attributeName,
          rawLength,
          MAX_INLINE_LEN,
        },
      );
    }

    // Begin JSON parse block
    try {
      // Parse JSON from attribute
      const parsed = JSON.parse(rawValue);

      // Validate parsed value type
      if (
        parsed === null ||
        (typeof parsed !== "object" && !Array.isArray(parsed))
      ) {
        // Warn parsed value is not object or array
        DebugLogger.warn(
          "chartsUtilities.js",
          "getConfigJSON",
          "PARSE_PRIMITIVE",
          { attributeName, type: typeof parsed },
        );

        DebugLogger.log(
          "chartsUtilities.js",
          "getConfigJSON",
          "END",
          {
            success: true,
            shape: typeof parsed,
          },
        );

        // Return parsed primitive value
        return parsed;
      }

      // Build parsed summary for logging
      const summary = Array.isArray(parsed)
        ? { isArray: true, length: parsed.length }
        : { isArray: false, keys: Object.keys(parsed).slice(0, 12) };

      // Log successful end with summary
      DebugLogger.log(
        "chartsUtilities.js",
        "getConfigJSON",
        "END",
        {
          success: true,
          summary,
        },
      );

      // Return parsed JSON object or array
      return parsed;

      // Catch and log the error
    } catch (error) {
      // Log invalid JSON parsing error
        DebugLogger.error(
          "chartsUtilities.js",
          "getConfigJSON",
          "INVALID_JSON",
          {
            message: "Invalid JSON in attribute",
            attributeName,
            rawLength,
            name: error.name,
          },
          { flags: ["CRITICAL"] },
        );

      DebugLogger.log(
        "chartsUtilities.js",
        "getConfigJSON",
        "END",
        { success: false },
      );

      // Return null on parse failure
      return null;
    }
  }

  /**
   * Retrieve the chart host element from a container.
   *
   * @param {HTMLElement} container - The parent container element for the chart.
   * @param {string} [selector="[amchart]"] - CSS selector for the chart host element.
   *
   * @returns {HTMLElement|null} The chart host element or null if not found.
   */
  function getChartHost(container, selector = "[amchart]") {
    // Validate container argument
    if (!container) {
      // Return null when container is missing
      return null;
    }

    // Return chart host element or container as fallback
    return container.querySelector(selector) || container;
  }

  /**
   * Clear the chart host element's inner HTML.
   *
   * @param {HTMLElement} container - The container element holding the chart host.
   * @param {string} [selector="[amchart]"] - CSS selector for the chart host element.
   *
   * @returns {HTMLElement|null} The cleared chart host element or null if not found.
   */
  function clearChartHost(container, selector = "[amchart]") {
    // Resolve the chart host element for the container
    const host = getChartHost(container, selector);

    // Check that host exists and supports innerHTML
    if (host && typeof host.innerHTML === "string") {
      // Clear the host inner HTML
      host.innerHTML = "";
    }

    // Return the host or null when absent
    return host || null;
  }

  /**
   * Mark or unmark a container as active.
   *
   * @param {HTMLElement} container - The container element to update.
   * @param {boolean} isActive - Whether the container should be marked as active.
   * @param {string} [activeClass="is-scope-target"] - CSS class to toggle for active state.
   *
   * @returns {void} No return value.
   */
  function markActive(container, isActive, activeClass = "is-scope-target") {
    // Validate container supports classList API
    if (!container?.classList) {
      // Return early when container is invalid
      return;
    }

    // Check whether to activate the container
    if (isActive) {
      // Add active class to the container
      container.classList.add(activeClass);

      // Handle the inactive state of the container
    } else {
      // Remove active class from the container
      container.classList.remove(activeClass);
    }
  }

  /**
   * Resolve the root element for a charts section.
   *
   * @param {string} scopeSection - Section identifier used to locate the charts scope element.
   * @param {HTMLElement} [scopeElement] - Optional element used as a starting point for ancestor lookup.
   *
   * @returns {HTMLElement|Document} The resolved charts section root or the document as fallback.
   */
  function getChartsSectionRoot(scopeSection, scopeElement) {
    DebugLogger.log(
      "chartsUtilities.js",
      "getChartsSectionRoot",
      "START",
      {
        scopeSection,
        hasScopeElement: !!scopeElement,
      },
    );

    // Begin guarded root resolution block
    try {
      DebugLogger.log(
        "chartsUtilities.js",
        "getChartsSectionRoot",
        "CHECK_EXPLICIT",
        { action: "Check explicit chartsScopeElement" },
      );

      // Query explicit charts scope element by data attribute
      const chartsScopeElement = document.querySelector(
        `[data-charts-scope="${scopeSection}"]`,
      );

      // Check if explicit charts scope element was found
      if (chartsScopeElement) {
        DebugLogger.log(
          "chartsUtilities.js",
          "getChartsSectionRoot",
          "EXPLICIT_RESOLVED",
          { source: "explicit", success: true },
        );

        // Return the explicitly matched charts scope element
        return chartsScopeElement;
      }

      DebugLogger.log(
        "chartsUtilities.js",
        "getChartsSectionRoot",
        "CHECK_ANCESTOR",
        { action: "Check ancestor chartsScopeElement" },
      );

      // Resolve nearest ancestor charts scope element from provided scopeElement
      const ancestorChartsScopeElement = scopeElement?.closest?.(
        `[data-charts-scope="${scopeSection}"]`,
      );

      // Check if ancestor charts scope element was found
      if (ancestorChartsScopeElement) {
        DebugLogger.log(
          "chartsUtilities.js",
          "getChartsSectionRoot",
          "ANCESTOR_RESOLVED",
          { source: "ancestor", success: true },
        );

        // Return the ancestor charts scope element
        return ancestorChartsScopeElement;
      }

      DebugLogger.log(
        "chartsUtilities.js",
        "getChartsSectionRoot",
        "CHECK_FALLBACK",
        { action: "Check fallback to provided scopeElement" },
      );

      // Check if a scopeElement was provided for fallback
      if (scopeElement) {
        DebugLogger.log(
          "chartsUtilities.js",
          "getChartsSectionRoot",
          "PROVIDED_RESOLVED",
          { source: "provided-scopeElement", success: true },
        );

        // Return the provided scope element as root
        return scopeElement;
      }

      DebugLogger.log(
        "chartsUtilities.js",
        "getChartsSectionRoot",
        "FALLBACK_DOCUMENT",
        { source: "document", success: true },
      );

      // Return the document as the charts scope root
      return document;

      // Catch and log the error
    } catch (error) {
      DebugLogger.error(
        "chartsUtilities.js",
        "getChartsSectionRoot",
        "ERROR",
        {
          message: error.message,
          name: error.name,
          stack: error.stack,
          context: { scopeSection },
        },
        { flags: ["CRITICAL"] },
      );

      DebugLogger.warn(
        "chartsUtilities.js",
        "getChartsSectionRoot",
        "END",
        { success: false },
      );

      throw error;
    }
  }

  /**
   * Retrieve all chart container elements within a scope section.
   *
   * @param {HTMLElement} sectionRoot - The root element containing chart containers.
   * @param {string} scope - The scope key used to match container IDs.
   *
   * @returns {HTMLElement[]} Array of chart container elements found within the scope.
   */
  function getScopeContainers(sectionRoot, scope) {
    // Validate section root and scope inputs
    if (!sectionRoot || !scope) return [];

    // Query and collect chart containers matching the scope prefix
    return Array.from(
      sectionRoot.querySelectorAll(
        `[data-chart-container][data-chart-id^="${scope}-"]`,
      ),
    );
  }

  /**
   * --------------------------------
   * SECTION: DATE & RANGE UTILITIES
   * --------------------------------
   */

  /**
   * Compute reporting window for a named mode.
   *
   * @param {string} mode - Window mode identifier (e.g., "TODAY", "SNAPSHOT", "MONTHLY", "WEEKLY", "YEAR").
   * @param {Date|null} [todayOverride=null] - Optional date to use as "today" instead of current date.
   *
   * @returns {{start: string, end: string}} ISO-like date strings defining the inclusive range
   */
  function getWindowRange(mode, todayOverride = null) {
    // Validate mode parameter and return empty range if invalid
    if (typeof mode !== "string" || !mode) return { start: "", end: "" }

    // Define helper to left pad numbers to two digits
    const pad = (n) => {
      // Convert number to string and pad with leading zero
      return String(n).padStart(2, "0")
    }

    // Define helper to format a Date as YYYY-MM-DD
    const toISO = (d) => {
      // Build ISO-like date string from local date parts
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    }

    // Determine today's date using override or current local date
    const today = (todayOverride instanceof Date)
      // Use provided override date when available
      ? todayOverride
      // Compute normalized local today when no override is provided
      : (() => {
          // Create a new Date for current moment
          const n = new Date()
          // Normalize to local start of day
          return new Date(n.getFullYear(), n.getMonth(), n.getDate())
        })()

    // Define helper to add or subtract whole days from a date
    const addDays = (d, n) => {
      // Create a copy of the provided date
      const x = new Date(d)
      // Adjust the date by the provided day delta
      x.setDate(x.getDate() + n)
      // Normalize to local start of day
      return new Date(x.getFullYear(), x.getMonth(), x.getDate())
    }

    // Determine Monday of the week for a given date
    const startOfWeekMonday = (d) => {
      // Read day of week for the provided date
      const day = d.getDay()
      // Compute offset so Monday is day zero
      const diffToMon = (day + 6) % 7
      // Create a mutable copy of the date
      const res = new Date(d)
      // Move date back to Monday
      res.setDate(d.getDate() - diffToMon)
      // Normalize to local start of day
      return new Date(res.getFullYear(), res.getMonth(), res.getDate())
    }

    // Return the first day of the month for a given date
    const firstOfMonth = (d) => {
      // Create date for the first day of the month
      return new Date(d.getFullYear(), d.getMonth(), 1)
    }

    // Normalize mode to uppercase for comparison
    const M = mode.toUpperCase()

    // Return range for today only
    if (M === "TODAY") {
      // Return start and end as the same day
      return { start: toISO(today), end: toISO(today) }
    }

    // Return rolling seven day snapshot
    if (M === "SNAPSHOT") {
      // Compute start date as six days before today
      const start = addDays(today, -6)
      // Return range covering last seven days inclusive
      return { start: toISO(start), end: toISO(today) }
    }

    // Return range for current month up to today
    if (M === "MONTHLY") {
      // Compute first day of the current month
      const start = firstOfMonth(today)
      // Return range from month start to today
      return { start: toISO(start), end: toISO(today) }
    }

    // Return weekly range aligned to Monday with up to seven days
    if (M === "WEEKLY") {
      // Compute Monday of the current week
      const mon = startOfWeekMonday(today)
      // Compute start candidate as seven day window
      const last7Start = addDays(today, -6)
      // Choose later of Monday or seven day start
      const start = last7Start < mon ? mon : last7Start
      // Return range from chosen start to today
      return { start: toISO(start), end: toISO(today) }
    }

    // Return year to date range
    if (M === "YEAR") {
      // Create date for January first of the current year
      const start = new Date(today.getFullYear(), 0, 1)
      // Return range from year start to today
      return { start: toISO(start), end: toISO(today) }
    }

    // Return empty range for unknown mode
    return { start: "", end: "" }
  }

  /**
   * Filter dataset rows by date range based on period type.
   *
   * @param {Array} rows - Array of data rows to filter.
   * @param {string} period - Period type ("daily", "weekly", "monthly", "yearly").
   * @param {{start: string, end: string}} range - Date range with ISO date strings.
   * @param {string} [periodField="period"] - Field name in rows containing the period label.
   *
   * @returns {Array} Filtered array of rows within the date range.
   */
  function filterByRange(rows, period, range, periodField = "period") {
    // Check for invalid or empty rows input
    if (!Array.isArray(rows) || rows.length === 0) return []
    // Check for invalid range object
    if (!range || !range.start || !range.end) return []

    // Create a date from year month day in local time
    const toDate = (y, m = 0, d = 1) => new Date(y, m, d)

    // Define helper to parse ISO date string
    const parseISO = (s) => {
      // Validate input string format YYYY-MM-DD
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
      // Return null if format does not match
      if (!m) return null
      // Convert captures to a local date
      return toDate(+m[1], +m[2] - 1, +m[3])
    }

    // Define label parser based on period granularity
    const parseLabel = (label, p) => {
      // Return null if label is not a string
      if (typeof label !== "string") return null

      // Handle daily period labels
      if (p === "daily") {
        // Match label pattern for daily format
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(label)
        // Return parsed date or null for invalid daily label
        return m ? toDate(+m[1], +m[2] - 1, +m[3]) : null
      }

      // Handle weekly period labels
      if (p === "weekly") {
        // Match label pattern for ISO week format
        const m = /^(\d{4})-W(\d{2})$/.exec(label)
        // Return null for invalid weekly label
        if (!m) return null
        // Extract year from capture group
        const year = +m[1], week = +m[2]
        // Compute Jan 4th which determines ISO week 1
        const jan4 = new Date(year, 0, 4)
        // Compute day of week shifting Sunday to 7
        const day = jan4.getDay() || 7
        // Compute Monday of ISO week 1
        const mondayW1 = new Date(year, 0, 4 - (day - 1))
        // Compute milliseconds for target week Monday
        const ms = mondayW1.getTime() + (week - 1) * 7 * 24 * 3600 * 1000
        // Create a date from computed milliseconds
        const x = new Date(ms)
        // Normalize to local midnight for comparison
        return new Date(x.getFullYear(), x.getMonth(), x.getDate())
      }

      // Handle monthly period labels
      if (p === "monthly") {
        // Match label pattern for monthly format
        const m = /^(\d{4})-(\d{2})$/.exec(label)
        // Return first day of month or null for invalid monthly label
        return m ? toDate(+m[1], +m[2] - 1, 1) : null
      }

      // Handle yearly period labels
      if (p === "yearly") {
        // Match label pattern for yearly format
        const m = /^(\d{4})$/.exec(label)
        // Return first day of year or null for invalid yearly label
        return m ? toDate(+m[1], 0, 1) : null
      }

      // Return null for unsupported period types
      return null
    }

    // Parse start date from range
    const S = parseISO(range.start)
    // Parse end date from range
    const E = parseISO(range.end)
    // Return empty array for invalid date range
    if (!S || !E || S > E) return []

    // Initialize output array for filtered rows
    const out = []
    // Iterate through each row in the input
    for (let i = 0; i < rows.length; i++) {
      // Get current row reference
      const r = rows[i]
      // Extract label from the row using periodField
      const lbl = r && typeof r[periodField] === "string" ? r[periodField] : ""
      // Parse label into a comparable date
      const t = parseLabel(lbl, period)
      // Push row if label date falls within the range
      if (t && t >= S && t <= E) out.push(r)
    }
    // Return filtered rows
    return out
  }

  /**
   * --------------------------------
   * SECTION: COLOR UTILITIES
   * --------------------------------
   */

  /**
   * Normalize a color value to a CSS hex string.
   *
   * @param {any} colorInput - Color value (may be a string, amCharts color, or object with `toCSSHex()`).
   *
   * @returns {string} A CSS hex color string (e.g., "#RRGGBB").
   */
  function normalizeColorHex(colorInput) {
    DebugLogger.log(
      "chartsUtilities.js",
      "normalizeColorHex",
      "START",
      { hasInput: !!colorInput },
    );

    // Begin guarded normalization block
    try {
      // Check for missing input value
      if (!colorInput) {
        DebugLogger.warn(
          "chartsUtilities.js",
          "normalizeColorHex",
          "NO_INPUT",
          {
            success: true,
            result: "#999",
            reason: "no-input",
          },
        );

        return "#999";
      }

      // Check if input exposes toCSSHex converter
      if (typeof colorInput.toCSSHex === "function") {
        // Convert color using provided toCSSHex
        const result = colorInput.toCSSHex();

        // Log usage of toCSSHex method
        DebugLogger.log(
          "chartsUtilities.js",
          "normalizeColorHex",
          "USED_TO_CSS_HEX",
          {
            action: "Used toCSSHex method",
            result,
          },
        );

        DebugLogger.log(
          "chartsUtilities.js",
          "normalizeColorHex",
          "END",
          {
            success: true,
            result,
          },
        );

        // Return normalized hex from input method
        return result;
      }

      DebugLogger.log(
        "chartsUtilities.js",
        "normalizeColorHex",
        "RESOLVE_AM5",
        { action: "Resolving via am5.Color" },
      );

      // Resolve color using am5 Color helpers
      const resolvedColor =
        am5.Color && am5.Color.fromAny
          ? am5.Color.fromAny(colorInput)
          : am5.color(colorInput);

      // Check if resolved color can convert to CSS hex
      if (resolvedColor?.toCSSHex) {
        // Convert resolved color to hex string
        const result = resolvedColor.toCSSHex();

        DebugLogger.log(
          "chartsUtilities.js",
          "normalizeColorHex",
          "RESOLVED_TO_HEX",
          {
            action: "Resolved with toCSSHex",
            result,
          },
        );

        DebugLogger.log(
          "chartsUtilities.js",
          "normalizeColorHex",
          "END",
          {
            success: true,
            result,
          },
        );

        // Return normalized hex from resolved color
        return result;
      }

      // Compute fallback result as stringified input
      const fallbackResult = String(colorInput);

      DebugLogger.log(
        "chartsUtilities.js",
        "normalizeColorHex",
        "FALLBACK_STRING",
        {
          action: "Fallback to string",
          fallbackResult,
        },
      );

      DebugLogger.log(
        "chartsUtilities.js",
        "normalizeColorHex",
        "END",
        {
          success: true,
          result: fallbackResult,
        },
      );

      // Return fallback string result
      return fallbackResult;

      // Begin error handling block
    } catch (error) {
      DebugLogger.error(
        "chartsUtilities.js",
        "normalizeColorHex",
        "ERROR",
        {
          message: error.message,
          name: error.name,
          stack: error.stack,
          context: { colorInput },
        },
        { flags: ["CRITICAL"] },
      );

      DebugLogger.log(
        "chartsUtilities.js",
        "normalizeColorHex",
        "END",
        {
          success: false,
          result: "#999",
        },
      );

      return "#999";
    }
  }

  /**
   * --------------------------------
   * SECTION: NETWORK UTILITIES
   * --------------------------------
   */

  /**
   * Fetch JSON with timeout and retries.
   *
   * @param {string} jsonUrl - The URL to request JSON from.
   * @param {Object} [options] - Optional fetch controls.
   * @param {number} [options.timeoutMs=10000] - Request timeout in milliseconds.
   * @param {number} [options.retries=1] - Number of retry attempts on failure.
   *
   * @returns {Promise<any>} The parsed JSON payload.
   */
  async function fetchJSON(jsonUrl, { timeoutMs = 10000, retries = 1 } = {}) {
    DebugLogger.log(
      "chartsUtilities.js",
      "fetchJSON",
      "START",
      { jsonUrl },
    );

    // Record start time for elapsed calculations
    const startTime = Date.now();

    // Define exponential backoff function
    const backoff = (i) => Math.min(500 * (i + 1), 1500);

    // Iterate attempts with retry policy
    for (let attempt = 0; attempt <= retries; attempt++) {
      // Create an AbortController for timeout
      const controller = new AbortController();

      // Schedule request timeout abort
      const t = setTimeout(() => controller.abort(), timeoutMs);

      // Begin guarded fetch attempt
      try {
        DebugLogger.log(
          "chartsUtilities.js",
          "fetchJSON",
          "API_REQUEST",
          {
            url: jsonUrl,
            method: "GET",
            options: { cache: "no-store", timeoutMs },
          },
        );

        // Perform HTTP GET request
        const response = await fetch(jsonUrl, {
          cache: "no-store",
          signal: controller.signal,
        });

        // Clear the timeout after response
        clearTimeout(t);

        // Compute elapsed time in milliseconds
        const elapsedMs = Date.now() - startTime;

        // Check HTTP response status
        if (!response.ok) {
          DebugLogger.error(
            "chartsUtilities.js",
            "fetchJSON",
            "HTTP_ERROR",
            {
              message: `Fetch failed for ${jsonUrl}`,
              status: response.status,
              statusText: response.statusText,
              elapsedMs,
            },
            { flags: ["CRITICAL"] },
          );

          DebugLogger.log(
            "chartsUtilities.js",
            "fetchJSON",
            "END",
            { success: false },
          );

          // Check if retry attempts remain
          if (attempt < retries) {
            // Wait before next retry attempt
            await new Promise((r) => setTimeout(r, backoff(attempt)));

            // Continue to the next retry attempt
            continue;
          }

          // Throw error for failed HTTP response
          throw new Error(
            `Fetch failed for ${jsonUrl} (status: ${response.status})`,
          );
        }

        // Parse response body as JSON
        const jsonData = await response.json();

        // Prepare response body sample for logging
        let bodySample;

        // Sample first items when response is array
        if (Array.isArray(jsonData)) bodySample = jsonData.slice(0, 3);

        // Sample object keys when response is object
        else if (jsonData && typeof jsonData === "object")
          bodySample = Object.keys(jsonData).slice(0, 10);

        // Sample string body when response is primitive
        else bodySample = String(jsonData).slice(0, 200);

          DebugLogger.log(
            "chartsUtilities.js",
            "fetchJSON",
            "API_RESPONSE",
            {
              url: jsonUrl,
              status: response.status,
              elapsedMs,
              bodySample,
            },
          );

          DebugLogger.log(
            "chartsUtilities.js",
            "fetchJSON",
            "END",
            { success: true },
          );

        // Return parsed JSON data
        return jsonData;

        // Handle unexpected errors in the request handler
      } catch (error) {
        // Clear the timeout in error path
        clearTimeout(t);

        // Compute elapsed time in error path
        const elapsedMs = Date.now() - startTime;

        // Catch and log the error
        DebugLogger.error(
          "chartsUtilities.js",
          "fetchJSON",
          "ERROR",
          {
            message: error.message,
            name: error.name,
            stack: error.stack,
            url: jsonUrl,
            elapsedMs,
            aborted: error.name === "AbortError",
          },
          { flags: ["CRITICAL"] },
        );

        // Check if retry attempts remain
        if (attempt < retries) {
          // Wait before next retry attempt
          await new Promise((r) => setTimeout(r, backoff(attempt)));

          // Continue to the next retry attempt
          continue;
        }

        // Log end state with failure
        DebugLogger.warn(
          "chartsUtilities.js",
          "fetchJSON",
          "END",
          { success: false },
        );

        // Throw error to caller
        throw error;
      }
    }
  }

  /**
   * --------------------------------
   * SECTION: EVENT UTILITIES
   * --------------------------------
   */

  /**
   * Emit a custom DOM event.
   *
   * @param {string} eventName - The name of the event to emit.
   * @param {Object} [detail={}] - Optional data to include in the event detail.
   * @param {EventTarget} [target=window] - The target element or object to dispatch the event on.
   *
   * @returns {boolean} True if the event was successfully dispatched, otherwise false.
   */
  function emit(eventName, detail = {}, target = window) {
    // Validate event name and target dispatch capability
    if (!eventName || !target?.dispatchEvent) {
      // Return false when inputs are invalid
      return false;
    }

    // Begin guarded event emit block
    try {
      // Dispatch the custom event with provided detail
      target.dispatchEvent(
        // Create the custom event with options
        new CustomEvent(eventName, {
          // Attach detail payload to event
          detail,
          // Disable event bubbling
          bubbles: false,
          // Disable event cancelation
          cancelable: false,
        }),
      );

      // Return true on successful dispatch
      return true;

      // Catch and log the error
    } catch (e) {
      // Log emit failure with message
      DebugLogger.error(
        "chartsUtilities.js",
        "emit",
        "ERROR",
        {
          message: `${e?.message || e}`,
          eventName,
        },
        { flags: ["CRITICAL"] },
      );

      // Return false on error
      return false;
    }
  }

  // Return public API
  return {
    // DOM Utilities
    getDataAttribute,
    getConfigJSON,
    getChartHost,
    clearChartHost,
    markActive,
    getChartsSectionRoot,
    getScopeContainers,

    // Date & Range Utilities
    getWindowRange,
    filterByRange,

    // Color Utilities
    normalizeColorHex,

    // Network Utilities
    fetchJSON,

    // Event Utilities
    emit,
  };
})();
