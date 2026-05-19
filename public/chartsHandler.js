/* Version: 2025-10-05T00:37:08.623Z */
DebugLogger.log(
  "chartsHandler.js",
  "version",
  "INFO",
  { version: "2025-10-05T00:37:08.623Z" },
  { flags: ["IMPORTANT"] },
);

const normalizeLocalDate = (value) => {
  if (!value) {
    return null;
  }

  if (Object.prototype.toString.call(value) === "[object Date]") {
    if (isNaN(value)) {
      return null;
    }
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const date = new Date(value);
    if (isNaN(date)) {
      return null;
    }
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    const isoMatch = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(trimmed);
    if (isoMatch) {
      return new Date(+isoMatch[1], +isoMatch[2] - 1, +isoMatch[3]);
    }
    const parsed = new Date(trimmed);
    if (isNaN(parsed)) {
      return null;
    }
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  return null;
};

const toIsoDateString = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) return null;
  const pad = (value) => (!value && value !== 0 ? "00" : String(value).padStart(2, "0"));
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/*
 * Contents
   * 
 * ─ LIFECYCLE
 *    initializeCharts() — Initialize charts and related event wiring.
 *    loadChartConfigsAndData() — Load chart configs and datasets.
 *    renderChartInstance() — Render a single chart instance into its host element.
 *    renderContainerChart() — Render a chart for the given container element.
 *    renderSectionDefaultChart() — Render the section's default chart.
 *    applyScopeSelection() — Apply a scope selection to update the active chart.
 *    instantiateChart() — Instantiate and render a chart by type.
   *
 * ─ CLEANUP / DESTROY
 *    destroyChartInstance() — Destroy a chart instance by its ID.
 *    disposeAndClear() — Dispose and clear a chart container.
   * 
 * ─ DATA & CONFIG HELPERS
 *    getConfigJSON() — Retrieve and parse a JSON configuration from an element attribute.
 *    _fetchJSON() — Fetch JSON with timeout and retries.
   *
 * ─ UTILITIES
 *    normalizeColorHex() — Normalize a color value to a CSS hex string.
 *    markActive() — Mark or unmark a container as active.
 *    _seriesColorFromHTML() — Resolve a series color from HTML configuration.
 *    getDataAttribute() — Safely retrieve a data-* attribute from an element.
 *    getChartHost() — Retrieve the chart host element from a container.
 *    clearChartHost() — Clear the chart host element's inner HTML.
 *
 * ─ TOOLTIP & CURSOR
 *    buildTooltip() — Build a styled amCharts tooltip.
 *    enableChartCursor() — Enable and configure an XY cursor for a chart instance.
 *
 * ─ AXES & CHART CREATION
 *    _createXYChart() — Create an amCharts XY chart instance.
 *    _createAxes() — Create and configure X/Y axes for an XY chart.
 *
 * ─ SERIES CREATORS
 *    _createColumnSeries() — Create a configured ColumnSeries for an XY chart.
 *    _createLineSeries() — Create a configured SmoothedXLineSeries for an XY chart.
 *
 * ─ PRIVATE RENDERERS
 *    _renderMap() — Render a choropleth/world map chart.
 *    _renderDonut() — Render a donut (pie) chart.
 *    _renderColumnWithIcons() — Render a column chart with icons.
 *    _renderXY() — Render an XY (bar/line/line-shadow) chart.
 *
 * ─ LEGEND
 *    _renderLegend() — Render a legend for a chart instance.
 *    _removeLegendById() — Remove a legend element by its chart instance ID.
 *
 * ─ LISTENERS & EVENTS
 *    setupEventListeners() — Set up chart scope UI event listeners.
 *    wireGlobalChartEvents() — Wire global chart-related events and readiness bridge.
 *    getChartsSectionRoot() — Resolve the root element for a charts section.
 *    getScopeContainers() — Retrieve all chart container elements within a scope section.
 *    emit() — Emit a custom DOM event.
 *
 * ─ UNSECTIONED
 *    constructor() — Constructor for ChartsHandler.
 */

/**
 * Class ChartsHandler
 *
 * Manages initialization, rendering, and lifecycle operations for charts within the DOM.
 *
 * @link https://docs.example.com/ChartsHandler
 */
class ChartsHandler {
  /**
   * Constructor for ChartsHandler.
   *
   * Initializes configuration, default options, and chart instances.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#constructor
   *
   * @param {Object} [options={}] - Optional configuration object for ChartsHandler.
   *
   * @returns {void} Initializes class properties.
   */
    constructor(options = {}) {
      DebugLogger.log(
        "chartsHandler.js",
        "constructor",
        "START",
        { options },
        { flags: ["CRITICAL"] },
      );

    // Begin guarded initialization block
    try {
      // Create map for chart root instances
      this._rootById = new Map();

      // Merge default options with provided options
      this.options = Object.assign(
        {
          selectors: {
            bodyConfig: '[data-charts="config"]',
            container: "[data-chart-container]",
            chartHost: "[amchart]",
          },
        },
        options,
      );

      // Initialize configuration stores
      this._configs = { base: {}, data: {} };

      // Initialize current toggle root reference
      this.currentToggleRoot = null;

      // Define available chart types
      this.charts = ["bar", "line"];

      // Initialize current index counter
      this.currentIndex = 0;

      // Mark instance as not initialized
      this._isInitialized = false;

      // Set the today override value using a normalized date
      this._todayOverride = normalizeLocalDate(
        this.options && this.options.today,
      )

          DebugLogger.log(
            "chartsHandler.js",
            "constructor",
            "END",
            {
              initialized: true,
              charts: this.charts,
            },
            { flags: ["CRITICAL"] },
          );

      // Handle unexpected errors in the request handler
    } catch (error) {
      // Catch and log the error
          DebugLogger.error(
            "chartsHandler.js",
            "constructor",
            "ERROR",
            {
              message: error.message,
              name: error.name,
              stack: error.stack,
              context: { options },
            },
            { flags: ["CRITICAL"] },
          );

      // Throw error to caller
      throw error;
    }
  }

  /**
   * --------------------------------
   * SECTION: LIFECYCLE
   * --------------------------------
   */

  /**
   * Initialize charts and related event wiring.
   *
   * Loads configs, renders initial chart instances, and wires up listeners for chart lifecycle.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#initializeCharts
   *
   * @returns {Promise<void>} Resolves when initialization completes.
   */
  async initializeCharts() {
    DebugLogger.log(
      "chartsHandler.js",
      "initializeCharts",
      "START",
      {},
      { flags: ["CRITICAL"] },
    );

    // Check initialization flag
    if (this._isInitialized) {
      DebugLogger.log(
        "chartsHandler.js",
        "initializeCharts",
        "SKIP",
        { reason: "already-initialized" },
        { flags: ["IMPORTANT"] },
      );

      // Return early when already initialized
      return;
    }

    // Mark as initialized to prevent reentry
    this._isInitialized = true;

    DebugLogger.log(
      "chartsHandler.js",
      "initializeCharts",
      "START_INIT",
      { reason: "start-init" },
      { flags: ["CRITICAL"] },
    );

    // Begin guarded initialization block
    try {
      DebugLogger.log(
        "chartsHandler.js",
        "initializeCharts",
        "LOAD_CONFIGS",
        { action: "Loading chart configs and data" },
        { flags: ["IMPORTANT"] },
      );

      // Await loading of chart configs and data
      const configsLoaded = await this.loadChartConfigsAndData();

      // Check if configs failed to load
      if (!configsLoaded) {
        // Warn and end due to configs not loaded
          DebugLogger.log(
            "chartsHandler.js",
            "initializeCharts",
            "END",
            { configsLoaded },
            { flags: ["IMPORTANT"] },
          );

        // Return when configs are not available
        return;
      }

      DebugLogger.log(
        "chartsHandler.js",
        "initializeCharts",
        "QUERY_CONTAINERS",
        { action: "Querying initial render containers" },
      );

      // Query DOM for initial render containers
      const initialRenderContainers = document.querySelectorAll(
        '[data-chart-container][data-initial-render="true"]',
      );

      DebugLogger.log(
        "chartsHandler.js",
        "initializeCharts",
        "CONTAINER_COUNT",
        { count: initialRenderContainers.length },
      );

      // Output table of initial render containers
      DebugLogger.table(initialRenderContainers);

      // Iterate over each chart container
      for (const chartContainer of initialRenderContainers) {
        DebugLogger.log(
          "chartsHandler.js",
          "initializeCharts",
          "CONTAINER_HTML",
          { chartContainer: chartContainer.outerHTML },
        );

        // Resolve chart host element for container
        const chartHostElement = this.getChartHost(chartContainer);

        // Check for missing chart host element
        if (!chartHostElement) {
          // Warn and skip when host not found
          DebugLogger.log(
            "chartsHandler.js",
            "initializeCharts",
            "HOST_MISSING",
            { skip: "chartHostElement not found" },
          );

          // Continue to next container when host missing
          continue;
        }

        // Log disposal and clearing action before render
        DebugLogger.log(
          "chartsHandler.js",
          "initializeCharts",
          "DISPOSE_CLEAR",
          {
            action: "Dispose + Clear (safety before initial render)",
            chartInstanceId: chartContainer.getAttribute("data-chart-id") || "",
          },
        );

        // Dispose and clear any stale instance or markup
        this.disposeAndClear(chartContainer);

        // Reveal chart container if hidden
        chartContainer.removeAttribute("hidden");

        // Log rendering of chart instance
        DebugLogger.log(
          "chartsHandler.js",
          "initializeCharts",
          "RENDER_INSTANCE",
          { action: "Rendering chart instance" },
        );

        // Await rendering of the chart instance
        await this.renderChartInstance(chartContainer);
      }

      // Log setup of event listeners
      DebugLogger.log(
        "chartsHandler.js",
        "initializeCharts",
        "SETUP_LISTENERS",
        { action: "Setting up event listeners" },
      );

      // Set up component event listeners
      this.setupEventListeners();

      // Log wiring of global chart events
      DebugLogger.log(
        "chartsHandler.js",
        "initializeCharts",
        "WIRE_EVENTS",
        { action: "Wiring global chart events" },
      );

      // Wire global chart related events
      this.wireGlobalChartEvents();

      // Log successful end of initialization
      DebugLogger.log(
        "chartsHandler.js",
        "initializeCharts",
        "END",
        { initialized: true },
        { flags: ["IMPORTANT"] },
      );
      } catch (error) {
        // Log initialization error details
        DebugLogger.error(
          "chartsHandler.js",
          "initializeCharts",
          "ERROR",
          {
            message: error.message,
            name: error.name,
            stack: error.stack,
          },
          { flags: ["CRITICAL"] },
        );

      // Throw error to caller
      throw error;
    }
  }

  /**
   * Load chart configs and datasets.
   *
   * Reads config sources from the DOM or remote URLs, parses JSON, caches results, and emits a ready event.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#loadChartConfigsAndData
   *
   * @returns {Promise<boolean>} True if configs and data were loaded successfully.
   */
  async loadChartConfigsAndData() {
    DebugLogger.log(
      "chartsHandler.js",
      "loadChartConfigsAndData",
      "START",
      {},
      { flags: ["CRITICAL"] },
    );

    // Begin guarded load block
    try {
      // Query DOM for config script element
      const configElement = document.querySelector(
        this.options.selectors.bodyConfig,
      );

      // Check for missing config element
      if (!configElement) {
        // Log missing config element error
        DebugLogger.error(
          "chartsHandler.js",
          "loadChartConfigsAndData",
          "MISSING_CONFIG",
          {
            message: "Missing charts config element",
            selector: this.options.selectors.bodyConfig,
          },
          { flags: ["CRITICAL"] },
        );

        // Warn end with failure
        DebugLogger.log(
          "chartsHandler.js",
          "loadChartConfigsAndData",
          "END",
          { success: false },
        );

        // Return false when config element is absent
        return false;
      }

      // Declare variable for parsed config JSON
      let configJson;

      // Begin JSON parse attempt
      try {
        // Parse JSON from config element text
        configJson = JSON.parse(configElement.textContent);

        DebugLogger.log(
          "chartsHandler.js",
          "loadChartConfigsAndData",
          "PAYLOAD",
          { parsedConfig: configJson },
          { flags: ["IMPORTANT"] },
        );
      } catch (error) {
        // Log invalid JSON error details
        DebugLogger.log(
          "ChartsHandler",
          "[loadChartConfigsAndData] [ERROR] [CRITICAL]",
          JSON.stringify({
            message: "Invalid JSON in charts config element",
            name: error.name,
            stack: error.stack,
          }),
          { critical: true },
        );

        // Warn end with failure
        DebugLogger.log(
          "ChartsHandler",
          "[loadChartConfigsAndData] [END] [IMPORTANT]",
          JSON.stringify({ success: false }),
          {},
        );

        // Return false when JSON is invalid
        return false;
      }

      // Log preparation of promises
      DebugLogger.log(
        "chartsHandler.js",
        "loadChartConfigsAndData",
        "PREPARE_PROMISES",
        { action: "Preparing promises for configs and datasets" },
      );

      // Prepare base config promise from inline or source
      const baseConfigPromise = configJson.baseConfigs
        ? Promise.resolve(configJson.baseConfigs)
        : configJson.baseConfigsSrc
          ? this._fetchJSON(configJson.baseConfigsSrc)
          : Promise.resolve({});

      // Prepare datasets promise from inline or source
const datasetsPromise = configJson.datasets
  ? Promise.resolve(configJson.datasets)
  : (this.options?.datasetsSrc || configJson.datasetsSrc)
    ? this._fetchJSON(this.options.datasetsSrc || configJson.datasetsSrc)
    : Promise.resolve({});

      DebugLogger.log(
        "chartsHandler.js",
        "loadChartConfigsAndData",
        "PROMISE_CONFIG",
        {
          baseConfigsInline: !!configJson.baseConfigs,
          baseConfigsSrc: configJson.baseConfigsSrc || null,
          datasetsInline: !!configJson.datasets,
          datasetsSrc: configJson.datasetsSrc || null,
        },
      );

      // Await both base and datasets promises
      const [baseConfigResult, datasetsResult] = await Promise.all([
        baseConfigPromise,
        datasetsPromise,
      ]);

      DebugLogger.log(
        "chartsHandler.js",
        "loadChartConfigsAndData",
        "PROMISE_RESULT",
        {
          baseConfigResult,
          datasetsResult,
        },
      );

      // Assign base configs to internal state
      this._configs.base = baseConfigResult || {};

      // Assign dataset configs to internal state
      this._configs.data = datasetsResult || {};

      DebugLogger.log(
        "chartsHandler.js",
        "loadChartConfigsAndData",
        "DISPATCH_READY",
        { action: "Dispatching configs-ready event" },
      );

      // Emit configs ready event to listeners
      this.emit("ChartsHandler:loadChartConfigsAndData:configs-ready");

      // Log successful completion
      DebugLogger.log(
        "chartsHandler.js",
        "loadChartConfigsAndData",
        "END",
        { success: true },
      );

      // Return true on success
      return true;
    } catch (error) {
      // Log unexpected error details
      DebugLogger.error(
        "chartsHandler.js",
        "loadChartConfigsAndData",
        "ERROR",
        {
          message: error.message,
          name: error.name,
          stack: error.stack,
        },
        { flags: ["CRITICAL"] },
      );

      // Log end with failure
      DebugLogger.log(
        "chartsHandler.js",
        "loadChartConfigsAndData",
        "END",
        { success: false },
      );

      // Return false on failure
      return false;
    }
  }

  /**
   * Render a single chart instance into its host element.
   *
   * Resolves config from element/base, fetches dataset, emits lifecycle events, and instantiates the chart.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#renderChartInstance
   *
   * @param {HTMLElement} chartContainerElement - The container element annotated with chart data attributes.
   *
   * @returns {Promise<void>} Completes when the chart has been rendered or skips on validation failure.
   */
  async renderChartInstance(chartContainerElement) {
    DebugLogger.log(
      "ChartsHandler",
      "[renderChartInstance] [START] [IMPORTANT]",
      JSON.stringify({
        hasContainer: !!chartContainerElement,
      }),
      {},
    );

    // Begin guarded render block
    try {
      // Check for missing chart container element
      if (!chartContainerElement) {
        // Log missing container error
        DebugLogger.log(
          "ChartsHandler",
          "[renderChartInstance] [ERROR] [CRITICAL]",
          JSON.stringify({
            message: "chartContainerElement not provided",
          }),
          { critical: true },
        );

        // Log end with failure
        DebugLogger.log(
          "ChartsHandler",
          "[renderChartInstance] [END] [IMPORTANT]",
          JSON.stringify({ success: false }),
          {},
        );

        // Return when container is not provided
        return;
      }

      // Log resolving chart host element
      DebugLogger.log(
        `[ChartsHandler] [renderChartInstance] [Step] ${JSON.stringify({
          action: "Resolving chart host element",
        })}`,
      );

      // Resolve chart host element
      const chartHostElement = this.getChartHost(chartContainerElement);

      // Check for missing chart host element
      if (!chartHostElement) {
        // Warn and skip render due to missing host
        DebugLogger.warn(
          `[ChartsHandler] [renderChartInstance] Missing chart host; skip render`,
          {
            chartId:
              chartContainerElement?.getAttribute?.("data-chart-id") || null,
          },
        );

        // Return when host is missing
        return;
      }

      // Log reading element style configuration
      DebugLogger.log(
        `[ChartsHandler] [renderChartInstance] [Step] ${JSON.stringify({
          action: "Reading element-level styleConfig",
        })}`,
      );

      // Read style configuration from element
      const styleConfig =
        this.getConfigJSON(chartContainerElement, "data-chart-config") || {};

      // Log resolving base configuration
      DebugLogger.log(
        `[ChartsHandler] [renderChartInstance] [Step] ${JSON.stringify({
          action: "Resolving baseConfig (by configKey if provided)",
          configKey: styleConfig.configKey || null,
        })}`,
      );

      // Resolve base configuration by key when provided
      const baseConfig = styleConfig.configKey
        ? this._configs.base?.[styleConfig.configKey] || null
        : null;

      // Log deriving effective parameters
      DebugLogger.log(
        "ChartsHandler",
        "[renderChartInstance] [STEP] [IMPORTANT]",
        JSON.stringify({
          action: "Deriving effective chart parameters",
        }),
        {},
      );

      // Resolve dataset key from style or base config
      const resolvedDatasetKey =
        styleConfig.datasetKey || baseConfig?.datasetKey;

      // Resolve chart type with default
      const chartType = styleConfig.type || baseConfig?.defaultType || "bar";

      // Resolve chart period with default
      const chartPeriod =
        styleConfig.period || baseConfig?.defaultPeriod || "yearly";

      // Resolve field configuration with defaults
      const fieldConfig = styleConfig.fields ||
        baseConfig?.fields || { category: "date", total: "total" };

      // Resolve breakdown keys for series
      const seriesBreakdownKeys =
        styleConfig.breakdownKeys || baseConfig?.breakdownKeys || [];

      // Validate presence of dataset key
      if (!resolvedDatasetKey) {
        // Log missing dataset key error
        DebugLogger.log(
          "ChartsHandler",
          "[renderChartInstance] [ERROR] [CRITICAL]",
          JSON.stringify({
            message: "datasetKey missing (inline or base)",
          }),
          { critical: true },
        );

        // Log end with failure
        DebugLogger.log(
          "ChartsHandler",
          "[renderChartInstance] [END] [IMPORTANT]",
          JSON.stringify({ success: false }),
          {},
        );

        // Return when dataset key is missing
        return;
      }

      // Log fetching dataset configuration
      DebugLogger.log(
        "ChartsHandler",
        "[renderChartInstance] [STEP] [IMPORTANT]",
        JSON.stringify({
          action: "Fetching dataset config",
          resolvedDatasetKey,
        }),
        {},
      );

      // Retrieve dataset configuration from cache
      const datasetConfig = this._configs.data?.[resolvedDatasetKey];

      // Validate presence of dataset configuration
      if (!datasetConfig) {
        // Log missing dataset configuration error
        DebugLogger.log(
          "ChartsHandler",
          "[renderChartInstance] [ERROR] [CRITICAL]",
          JSON.stringify({
            message: "dataset missing for key",
            resolvedDatasetKey,
          }),
          { critical: true },
        );

        // Log end with failure
        DebugLogger.log(
          "ChartsHandler",
          "[renderChartInstance] [END] [IMPORTANT]",
          JSON.stringify({ success: false }),
          {},
        );

        // Return when dataset configuration is missing
        return;
      }

      // Log copying dataset rows for period
      DebugLogger.log(
        "ChartsHandler",
        "[renderChartInstance] [STEP] [IMPORTANT]",
        JSON.stringify({
          action: "Copying dataset rows for period",
          chartPeriod,
        }),
        {},
      );

      // Copy dataset rows for the requested period
      let datasetRows = (datasetConfig?.[chartPeriod] || []).slice();

      // Log dataset rows count
      DebugLogger.log(
        "ChartsHandler",
        "[renderChartInstance] [STEP] [IMPORTANT]",
        JSON.stringify({
          rowsCount: Array.isArray(datasetRows) ? datasetRows.length : 0,
        }),
        {},
      );

      // Output table of dataset rows when array
      if (Array.isArray(datasetRows)) {
      if (Array.isArray(datasetRows)) {
        DebugLogger.table(datasetRows);
      }
      }

      // Log computing chart instance identifier
      DebugLogger.log(
        "chartsHandler.js",
        "renderChartInstance",
        "COMPUTE_INSTANCE_ID",
        { action: "Computing chartInstanceId" },
      );

      // Compute chart instance identifier
      const chartInstanceId =
        chartContainerElement.getAttribute("data-chart-id") ||
        (styleConfig.configKey || resolvedDatasetKey) + "-" + chartPeriod;

      // Log dispatch of chartWillRender event
      DebugLogger.log(
        "chartsHandler.js",
        "renderChartInstance",
        "CHART_WILL_RENDER",
        {
          action: "Dispatch chartWillRender event",
          chartInstanceId,
          chartType,
          chartPeriod,
        },
      );

      // Emit chart will render event
      this.emit("ChartsHandler:chartWillRender", {
        detail: { chartInstanceId, chartType, chartPeriod },
      });

      // Log instantiation of chart
      DebugLogger.log(
        "chartsHandler.js",
        "renderChartInstance",
        "PAYLOAD",
        {
          action: "Instantiate chart",
          payload: {
            chartType,
            fieldConfig,
            seriesBreakdownKeys,
            datasetRowsCount: Array.isArray(datasetRows)
              ? datasetRows.length
              : 0,
          },
        },
        { flags: ["IMPORTANT"] },
      );

      // Get windowMode value from styleConfig
      const mode = styleConfig && styleConfig.windowMode;

      // Check if mode is defined
      if (mode) {
        // Get the corresponding window range based on mode
        const range = this.getWindowRange(mode);

        // Filter datasetRows based on the calculated range and chart period
        datasetRows = this.filterByRange(datasetRows, chartPeriod, range, "period");
      }

      // Instantiate the chart with resolved options
      await this.instantiateChart(chartInstanceId, chartHostElement, {
        styleConfig,
        chartType,
        fieldConfig,
        seriesBreakdownKeys,
        datasetRows,
      });

      // Log successful end of render
      DebugLogger.log(
        "ChartsHandler",
        "[renderChartInstance] [END] [IMPORTANT]",
        JSON.stringify({
          success: true,
          chartInstanceId,
        }),
        {},
      );

      // Catch and log the error
    } catch (error) {
      // Log unexpected error during render
      DebugLogger.log(
        "ChartsHandler",
        "[renderChartInstance] [ERROR] [CRITICAL]",
        JSON.stringify({
          message: error.message,
          name: error.name,
          stack: error.stack,
        }),
        { critical: true },
      );

      // Warn end with failure
      DebugLogger.log(
        "ChartsHandler",
        "[renderChartInstance] [END] [IMPORTANT]",
        JSON.stringify({ success: false }),
        {},
      );

      // Throw error to caller
      throw error;
    }
  }

  /**
   * Render a chart for the given container element.
   *
   * Delegates rendering to `renderChartInstance` and logs the process and outcome.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#renderContainerChart
   *
   * @param {HTMLElement} chartContainerElement - The chart container element to render.
   *
   * @returns {Promise<void>} Resolves when rendering completes or rejects on error.
   */
  async renderContainerChart(chartContainerElement) {
    DebugLogger.log(
      "chartsHandler.js",
      "renderContainerChart",
      "START",
      { hasContainer: !!chartContainerElement },
    );

    // Begin guarded render block
    try {
      // Render the chart instance for container
      const result = await this.renderChartInstance(chartContainerElement);

      // Log successful end of container render
      DebugLogger.log(
        "chartsHandler.js",
        "renderContainerChart",
        "END",
        { success: true },
      );

      // Return the render result
      return result;

      // Handle unexpected errors in the request handler
    } catch (error) {
      // Catch and log the error
      DebugLogger.error(
        "chartsHandler.js",
        "renderContainerChart",
        "ERROR",
        {
          message: error.message,
          name: error.name,
          stack: error.stack,
          context: { hasContainer: !!chartContainerElement },
        },
        { flags: ["CRITICAL"] },
      );

      // Warn end with failure
      DebugLogger.log(
        "chartsHandler.js",
        "renderContainerChart",
        "END",
        { success: false },
      );

      // Throw error to caller
      throw error;
    }
  }

  /**
   * Render the section's default chart.
   *
   * Resolves a section root, selects a default container (preferring `data-initial-render="true"`), resets others, and renders the target.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#renderSectionDefaultChart
   *
   * @param {HTMLElement|string} scopeSection - Section element or identifier used to resolve the charts section root.
   *
   * @returns {Promise<void>} Completes when the default chart for the section is rendered.
   */
  async renderSectionDefaultChart(scopeSection) {
    DebugLogger.log(
      "chartsHandler.js",
      "renderSectionDefaultChart",
      "START",
      { scopeSection },
    );

    // Begin guarded render block
    try {
      // Log resolving section root element
        DebugLogger.log(
          "chartsHandler.js",
          "renderSectionDefaultChart",
          "RESOLVE_ROOT",
          { action: "Resolve section root element" },
        );

      // Resolve the section root element for charts
      const sectionRootElement = this.getChartsSectionRoot(scopeSection);

      // Log section root resolution result
      DebugLogger.log(
        "chartsHandler.js",
        "renderSectionDefaultChart",
        "ROOT_RESOLVED",
        {
          action: "Section root resolved",
          hasSectionRoot: !!sectionRootElement,
        },
      );

      // Check if section root element is missing
      if (!sectionRootElement) {
        // Log missing section root error
        DebugLogger.error(
          "chartsHandler.js",
          "renderSectionDefaultChart",
          "NO_SECTION_ROOT",
          { message: "No section root element" },
          { flags: ["CRITICAL"] },
        );

        // Log end with failure state
        DebugLogger.log(
          "chartsHandler.js",
          "renderSectionDefaultChart",
          "END",
          { success: false },
        );

        // Return early when section root is absent
        return;
      }

      // Collect chart containers within the section
      const allChartContainers =
        this.getScopeContainers(sectionRootElement, scopeSection) || [];

      // Log count of collected chart containers
      DebugLogger.log(
        "chartsHandler.js",
        "renderSectionDefaultChart",
        "COLLECT_CONTAINERS",
        {
          action: "Collected chart containers",
          count: allChartContainers.length,
        },
      );

      // Check if no containers were found
      if (allChartContainers.length === 0) {
        // Warn that no containers were found
        DebugLogger.warn(
          "chartsHandler.js",
          "renderSectionDefaultChart",
          "NO_CONTAINERS",
          { scopeSection, message: "No containers found" },
        );

        // Log end with failure state
        DebugLogger.log(
          "chartsHandler.js",
          "renderSectionDefaultChart",
          "END",
          { success: false },
        );

        // Return when there are no containers
        return;
      }

      // Define the active class name for scope targeting
      const ACTIVE_CLASS = "is-scope-target";

      // Iterate through all chart containers for cleanup
      for (const chartContainerElement of allChartContainers) {
        // Resolve chart instance id from container
        const chartInstanceId =
          chartContainerElement.getAttribute?.("data-chart-id") || "";

        // Check if a chart instance id is present
        if (chartInstanceId) {
          // Begin attempt to destroy existing chart instance
          try {
            // Destroy the existing chart instance by id
            this.destroyChartInstance(chartInstanceId);

            // Catch and log the error
          } catch (e) {
            // Log destroy instance failure details
            DebugLogger.error(
              "chartsHandler.js",
              "renderSectionDefaultChart",
              "DESTROY_ERROR",
              {
                message: e.message,
                action: "dispose",
                chartInstanceId,
              },
              { flags: ["CRITICAL"] },
            );
          }
        }

        // Resolve the chart host element for the container
        const host = this.getChartHost?.(chartContainerElement);

        // Clear the host inner HTML when available
        if (host && typeof host.innerHTML === "string") host.innerHTML = "";

        // Hide the chart container element
        chartContainerElement.setAttribute?.("hidden", "");

        // Unmark the container as active in the scope
        this.markActive?.(chartContainerElement, false, ACTIVE_CLASS);
      }

      // Attempt to resolve explicit initial render target
      let target = sectionRootElement.querySelector?.(
        `[data-chart-container][data-initial-render="true"]`,
      );

      // Fallback to the first container when no explicit target is found
      if (!target) {
        // Assign first container as target
        target = allChartContainers[0];
      }

      // Check if target container could not be resolved
      if (!target) {
        // Log failure to resolve default target container
        DebugLogger.error(
          "chartsHandler.js",
          "renderSectionDefaultChart",
          "NO_TARGET",
          {
            message: "No default target container could be resolved",
          },
          { flags: ["CRITICAL"] },
        );

        // Log end with failure state
        DebugLogger.log(
          "chartsHandler.js",
          "renderSectionDefaultChart",
          "END",
          { success: false },
        );

        // Return when target is not available
        return;
      }

      // Resolve chart instance id for the target container
      const targetChartInstanceId =
        target.getAttribute?.("data-chart-id") || null;

      // Log resolved default target details
      DebugLogger.log(
        "chartsHandler.js",
        "renderSectionDefaultChart",
        "TARGET_RESOLVED",
        {
          action: "Resolved default target",
          targetChartInstanceId,
        },
      );

      // Unhide the target chart container
      target.removeAttribute?.("hidden");

      // Mark the target container as active
      target.classList?.add?.(ACTIVE_CLASS);

      // Render the chart instance for the target container
      await this.renderChartInstance(target);

      // Log successful end of default chart render
      DebugLogger.log(
        "chartsHandler.js",
        "renderSectionDefaultChart",
        "END",
        {
          success: true,
          targetChartInstanceId,
        },
      );

      // Handle unexpected errors in the request handler
    } catch (error) {
      // Catch and log the error
      DebugLogger.error(
        "chartsHandler.js",
        "renderSectionDefaultChart",
        "ERROR",
        {
          message: error.message,
          name: error.name,
          stack: error.stack,
          context: { scopeSection },
        },
        { flags: ["CRITICAL"] },
      );

      // Log end with failure state
      DebugLogger.log(
        "chartsHandler.js",
        "renderSectionDefaultChart",
        "END",
        { success: false },
      );

      // Throw error to caller
      throw error;
    }
  }

  /**
   * Apply a scope selection to update the active chart.
   *
   * Parses the scope key, resolves the section root and target container, resets others, updates config, and renders the chosen chart.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#applyScopeSelection
   *
   * @param {string} scopeKey - Dot-delimited key in the form "section.period.view".
   * @param {HTMLElement|string} scopeElement - Optional explicit scope element to resolve the section root.
   *
   * @returns {Promise<void>} Completes when the target chart is rendered and selection event is emitted.
   */
  async applyScopeSelection(scopeKey, scopeElement) {
    DebugLogger.log(
      "chartsHandler.js",
      "applyScopeSelection",
      "START",
      { scopeKeyProvided: !!scopeKey },
    );

    // Begin guarded apply block
    try {
      // Check if scopeKey is missing
      if (!scopeKey) {
        DebugLogger.log(
          "chartsHandler.js",
          "applyScopeSelection",
          "END",
          {
            success: false,
            reason: "no-scopeKey",
          },
        );

        // Return early when no scopeKey
        return;
      }

      // Parse the scopeKey into section period and view
      const [scopeSection, scopePeriod, scopeView] =
        String(scopeKey).split(".");

      // Emit will apply event for scope selection
      this.emit?.("ChartsHandler:scopeSelectionWillApply", {
        detail: { scopeKey, scopeSection, scopePeriod, scopeView },
      });

      // Resolve the scope root element
      const resolvedScopeElement = this.getChartsSectionRoot(
        scopeSection,
        scopeElement,
      );

      // Define the active class for marking targets
      const ACTIVE_CLASS = "is-scope-target";

      DebugLogger.log(
        "chartsHandler.js",
        "applyScopeSelection",
        "RESOLVED_ROOT",
        {
          action: "Resolved section root element",
          scopeSection,
          hasSectionRoot: !!resolvedScopeElement,
        },
      );

      // Check when no resolved scope element
      if (!resolvedScopeElement) {
        DebugLogger.log(
          "chartsHandler.js",
          "applyScopeSelection",
          "END",
          {
            success: false,
            reason: "no-resolvedScopeElement",
            scopeSection,
          },
        );

        // Return early when no resolved scope element
        return;
      }

      // Collect all chart containers within scope
      const allChartContainers = this.getScopeContainers(
        resolvedScopeElement,
        scopeSection,
      );

      // Check if no containers were found
      if (!allChartContainers || allChartContainers.length === 0) {
        DebugLogger.warn(
          "chartsHandler.js",
          "applyScopeSelection",
          "NO_CONTAINERS",
          {
            scopeSection,
            message: "No chart containers found",
          },
        );

        // Return early when no containers
        return;
      }

      // Begin attempt to log container ids
      try {
        // Build array of container ids for logging
        const ids = Array.from(allChartContainers).map((el) => ({
          chartId: el.getAttribute("data-chart-id") || "",
        }));

        // Output ids in a table for debugging
        DebugLogger.table(ids);

        // Catch and log the error
      } catch (e) {
        // Ignore table errors
        /* ignore table errors */
      }

      // Hide and unmark all containers in scope
      allChartContainers.forEach((chartContainerElement) => {
        // Hide container with hidden attribute
        if (chartContainerElement?.setAttribute)
          chartContainerElement.setAttribute("hidden", "");

        // Unmark active state on the container
        this.markActive?.(chartContainerElement, false, ACTIVE_CLASS);
      });

      // Dispose all charts and clear hosts in scope
      allChartContainers.forEach((chartContainerElement) => {
        // Resolve chart instance id for disposal
        const chartInstanceId =
          chartContainerElement?.getAttribute?.("data-chart-id") || "";

        // Attempt to destroy chart instance when present
        if (chartInstanceId) {
          // Begin dispose attempt
          try {
            // Destroy the chart instance by id
            this.destroyChartInstance(chartInstanceId);

            DebugLogger.log(
              "chartsHandler.js",
              "applyScopeSelection",
              "DISPOSED_INSTANCE",
              {
                action: "Disposed chart instance",
                chartInstanceId,
              },
            );

            // Catch and log the error
          } catch (e) {
            DebugLogger.error(
              "chartsHandler.js",
              "applyScopeSelection",
              "DISPOSE_ERROR",
              {
                message: e.message,
                action: "dispose",
                chartInstanceId,
              },
              { flags: ["CRITICAL"] },
            );
          }
        }

        // Resolve chart host element for clearing
        const chartHostElement = this.getChartHost?.(chartContainerElement);

        // Clear inner HTML of host when available
        if (
          chartHostElement &&
          typeof chartHostElement.innerHTML === "string"
        ) {
          // Empty the host container
          chartHostElement.innerHTML = "";

          DebugLogger.log(
            "chartsHandler.js",
            "applyScopeSelection",
            "CLEARED_HOST",
            {
              action: "Cleared chart host",
              chartInstanceId,
            },
          );
        }
      });

      // Define helper to normalize period names
      const normalizePeriod = (p) =>
        p === "daily"
          ? "day"
          : p === "weekly"
            ? "week"
            : p === "monthly"
              ? "month"
              : p === "yearly"
                ? "year"
                : p;

      // Compute the target chart instance id
      const targetChartInstanceId = `${scopeSection}-${normalizePeriod(
        scopePeriod,
      )}-${scopeView}`;

      DebugLogger.log(
        "chartsHandler.js",
        "applyScopeSelection",
        "COMPUTED_TARGET_ID",
        {
          action: "Computed targetChartInstanceId",
          targetChartInstanceId,
        },
      );

      // Query for the target chart container by id variants
      let targetChartContainer =
        resolvedScopeElement.querySelector?.(
          `[data-chart-container][data-chart-id="${targetChartInstanceId}"]`,
        ) ||
        resolvedScopeElement.querySelector?.(
          `[data-chart-container][data-chart-id="${scopeSection}-${scopeView}"]`,
        );

      // Check when target container is not found
      if (!targetChartContainer) {
        DebugLogger.error(
          "chartsHandler.js",
          "applyScopeSelection",
          "NO_TARGET_CONTAINER",
          {
            message: "No target container found",
            scopeKey,
            tried: targetChartInstanceId,
          },
          { flags: ["CRITICAL"] },
        );

        DebugLogger.log(
          "chartsHandler.js",
          "applyScopeSelection",
          "END",
          { success: false },
        );

        // Return early when target container is missing
        return;
      }

      DebugLogger.log(
        "chartsHandler.js",
        "applyScopeSelection",
        "TARGET_RESOLVED",
        {
          action: "Target container resolved",
          targetChartInstanceId:
            targetChartContainer.getAttribute("data-chart-id") ||
            targetChartInstanceId,
        },
      );

      // Read existing config JSON from target
      const configJson =
        this.getConfigJSON?.(targetChartContainer, "data-chart-config") || {};

      // Update config period with scope value
      configJson.period = scopePeriod;

      // Update config type with scope view
      configJson.type = scopeView;

      // Persist updated config back to element
      targetChartContainer.setAttribute?.(
        "data-chart-config",
        JSON.stringify(configJson),
      );

      DebugLogger.log(
        "chartsHandler.js",
        "applyScopeSelection",
        "UPDATE_CONFIG",
        {
          action: "Updated target config",
          configJson,
        },
      );

      // Unhide the target chart container
      targetChartContainer.removeAttribute?.("hidden");

      // Mark target container as active in scope
      targetChartContainer.classList?.add?.(ACTIVE_CLASS);

      DebugLogger.log(
        "chartsHandler.js",
        "applyScopeSelection",
        "ACTIVATE_TARGET",
        {
          action: "Unhidden + marked active",
          targetChartInstanceId,
        },
      );

      // Render the chart instance for the target container
      await this.renderChartInstance(targetChartContainer);

      DebugLogger.log(
        "chartsHandler.js",
        "applyScopeSelection",
        "RENDER_COMPLETE",
        {
          action: "Render complete",
          targetChartInstanceId,
        },
      );

      // Emit did apply event for scope selection
      this.emit?.("ChartsHandler:scopeSelectionDidApply", {
        detail: {
          scopeKey,
          scopeSection,
          scopePeriod,
          scopeView,
          chartInstanceId:
            targetChartContainer.getAttribute?.("data-chart-id") ||
            targetChartInstanceId,
        },
      });

      DebugLogger.log(
        "chartsHandler.js",
        "applyScopeSelection",
        "END",
        { success: true },
      );

      // Handle unexpected errors in the request handler
    } catch (error) {
      DebugLogger.error(
        "chartsHandler.js",
        "applyScopeSelection",
        "ERROR",
        {
          message: error.message,
          name: error.name,
          stack: error.stack,
          context: { scopeKey },
        },
        { flags: ["CRITICAL"] },
      );

      DebugLogger.log(
        "chartsHandler.js",
        "applyScopeSelection",
        "END",
        { success: false },
      );

      // Throw error to caller
      throw error;
    }
  }

  /**
   * Instantiate and render a chart by type.
   *
   * Destroys any existing instance, creates an amCharts root, applies theme, and dispatches to the appropriate renderer.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#instantiateChart
   *
   * @param {string} chartInstanceId - Unique identifier for the chart instance.
   * @param {HTMLElement} chartHostElement - DOM element that will host the chart.
   * @param {Object} chartContext - Rendering context including styleConfig, chartType, fields, series, and data rows.
   *
   * @returns {Promise<void>} Resolves when the chart is instantiated or rejects on error.
   */
  async instantiateChart(chartInstanceId, chartHostElement, chartContext) {
    DebugLogger.log(
      "chartsHandler.js",
      "instantiateChart",
      "START",
      {
        chartInstanceId,
        hasHost: !!chartHostElement,
        contextKeys: Object.keys(chartContext || {}),
      },
    );

    // Begin guarded instantiation block
    try {
      // Destructure chart context inputs
      const {
        styleConfig,
        chartType,
        fieldConfig,
        seriesBreakdownKeys,
        datasetRows,
      } = chartContext;

      // Log intent to destroy existing instance
      DebugLogger.log(
        "ChartsHandler",
        "[instantiateChart] [STEP] [IMPORTANT]",
        JSON.stringify({
          action: "Destroy existing chart instance if any",
          chartInstanceId,
        }),
        {},
      );

      // Destroy any pre-existing chart instance
      this.destroyChartInstance(chartInstanceId);

      // Log creation of am5 Root and registration
      DebugLogger.log(
        "ChartsHandler",
        "[instantiateChart] [STEP] [IMPORTANT]",
        JSON.stringify({
          action: "Create am5 Root and register in map",
        }),
        {},
      );

      // Create am5 Root for this host
      const chartRoot = am5.Root.new(chartHostElement);

      // Register root by chart instance id
      this._rootById.set(chartInstanceId, chartRoot);

      // Log application of theme and logo toggle
      DebugLogger.log(
        "ChartsHandler",
        "[instantiateChart] [STEP] [IMPORTANT]",
        JSON.stringify({
          action: "Apply theme and hide logo if configured",
          hideLogo: styleConfig.hideLogo !== false,
        }),
        {},
      );

      // Dispose amCharts logo if configured
      if (styleConfig.hideLogo !== false) chartRoot._logo?.dispose?.();

      // Apply animated theme to root
      chartRoot.setThemes([am5themes_Animated.new(chartRoot)]);

      // Dispatch based on chart type
      switch (chartType) {
        // Handle map charts
        case "map": {
          // Log map branch selection
          DebugLogger.log(
            "ChartsHandler",
            "[instantiateChart] [STEP] [IMPORTANT]",
            JSON.stringify({ branch: "map" }),
            {},
          );

          // Render map chart variant
          this._renderMap({
            chartInstanceId,
            chartHostElement,
            chartRoot,
            styleConfig,
            datasetRows,
          });

          // Log successful end for map
          DebugLogger.log(
            "ChartsHandler",
            "[instantiateChart] [END] [IMPORTANT]",
            JSON.stringify({ success: true, chartType }),
            {},
          );

          // Return after map render
          return;
        }

        // Handle donut charts
        case "donut": {
          // Log donut branch selection
          DebugLogger.log(
            "ChartsHandler",
            "[instantiateChart] [STEP] [IMPORTANT]",
            JSON.stringify({ branch: "donut" }),
            {},
          );

          // Render donut chart variant
          this._renderDonut({
            chartInstanceId,
            chartHostElement,
            chartRoot,
            styleConfig,
            fieldConfig,
            datasetRows,
          });

          // Log successful end for donut
          DebugLogger.log(
            `[ChartsHandler] [instantiateChart] [End] ${JSON.stringify({
              success: true,
              chartType,
            })}`,
          );

          // Return after donut render
          return;
        }

        // Handle column-with-icons charts
        case "column-with-icons": {
          // Log column-with-icons branch selection
          DebugLogger.log(
            "ChartsHandler",
            "[instantiateChart] [STEP] [IMPORTANT]",
            JSON.stringify({ branch: "column-with-icons" }),
            {},
          );

          // Render column-with-icons chart variant
          this._renderColumnWithIcons({
            chartInstanceId,
            chartHostElement,
            chartRoot,
            styleConfig,
            fieldConfig,
            datasetRows,
          });

          // Log successful end for column-with-icons
          DebugLogger.log(
            `[ChartsHandler] [instantiateChart] [End] ${JSON.stringify({
              success: true,
              chartType,
            })}`,
          );

          // Return after column-with-icons render
          return;
        }

        // Handle bar chart type
        case "bar":
        // Handle line chart type
        case "line":
        // Handle line-shadow chart type
        case "line-shadow": {
          // Log xy branch selection
          DebugLogger.log(
            "ChartsHandler",
            "[instantiateChart] [STEP] [IMPORTANT]",
            JSON.stringify({ branch: "xy", chartType }),
            {},
          );

          // Render XY chart variant with optional breakdown keys
          this._renderXY({
            chartInstanceId,
            chartHostElement,
            chartRoot,
            styleConfig,
            fieldConfig,
            datasetRows,
            chartType,
            seriesBreakdownKeys,
          });

          // Log successful end for xy
          DebugLogger.log(
            `[ChartsHandler] [instantiateChart] [End] ${JSON.stringify({
              success: true,
              chartType,
            })}`,
          );

          // Return after xy render
          return;
        }

        // Handle unknown chart type
        default: {
          // Log unknown chart type error
          DebugLogger.log(
            "ChartsHandler",
            "[instantiateChart] [ERROR] [CRITICAL]",
            JSON.stringify({
              message: `Unknown chartType "${chartType}"`,
              context: { chartInstanceId, chartType },
            }),
            { critical: true },
          );

          // Throw error for unknown type
          throw new Error(`Unknown chartType "${chartType}"`);
        }
      }

      // Catch and log the error
    } catch (error) {
      // Log instantiation error details
      DebugLogger.log(
        "ChartsHandler",
        "[instantiateChart] [ERROR] [CRITICAL]",
        JSON.stringify({
          message: error.message,
          name: error.name,
          stack: error.stack,
          context: { chartInstanceId },
        }),
        { critical: true },
      );

      // Warn end with failure
      DebugLogger.log(
        "ChartsHandler",
        "[instantiateChart] [END] [IMPORTANT]",
        JSON.stringify({ success: false }),
        {},
      );

      // Throw error to caller
      throw error;
    }
  }

  /**
   * --------------------------------
   * SECTION: CLEANUP / DESTROY
   * --------------------------------
   */

  /**
   * Destroy a chart instance by its ID.
   *
   * Disposes the chart root, removes legend, clears registry, and emits a disposal event.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#destroyChartInstance
   *
   * @param {string} chartInstanceId - The unique ID of the chart instance to destroy.
   *
   * @returns {void} No return value.
   */
  destroyChartInstance(chartInstanceId) {
    // Log start of destroy
    DebugLogger.log(
      "ChartsHandler",
      "[destroyChartInstance] [START] [IMPORTANT]",
      JSON.stringify({ chartInstanceId }),
      {},
    );

    // Begin guarded destroy block
    try {
      // Retrieve chart root instance by id
      const chartRootInstance = this._rootById.get(chartInstanceId);

      // Log whether instance was found
      DebugLogger.log(
        "ChartsHandler",
        "[destroyChartInstance] [STEP] [IMPORTANT]",
        JSON.stringify({ foundInstance: !!chartRootInstance }),
        {},
      );

      // Check if instance is disposable
      if (chartRootInstance?.dispose) {
        // Log disposal action
        DebugLogger.log(
          "ChartsHandler",
          "[destroyChartInstance] [STEP] [IMPORTANT]",
          JSON.stringify({ action: "Disposing chart instance" }),
          {},
        );

        // Dispose the chart root instance
        chartRootInstance.dispose();
      }

      // Remove legend by chart id
      this._removeLegendById(chartInstanceId);

      // Log legend removal
      DebugLogger.log(
        "ChartsHandler",
        "[destroyChartInstance] [STEP] [IMPORTANT]",
        JSON.stringify({ action: "Removed legend from map" }),
        {},
      );

      // Delete root mapping for chart id
      this._rootById.delete(chartInstanceId);

      // Log map removal
      DebugLogger.log(
        "ChartsHandler",
        "[destroyChartInstance] [STEP] [IMPORTANT]",
        JSON.stringify({ action: "Removed instance from map" }),
        {},
      );

      // Dispatch chart disposed custom event
      window.dispatchEvent(
        // Create custom event object
        new CustomEvent("ChartsHandler:chartDisposed", {
          // Attach chart id in event detail
          detail: { chartInstanceId },
        }),
      );

      // Log dispatch of disposed event
      DebugLogger.log(
        "ChartsHandler",
        "[destroyChartInstance] [STEP] [IMPORTANT]",
        JSON.stringify({ action: "Dispatched chartDisposed event" }),
        {},
      );

      // Log successful end
      DebugLogger.log(
        "ChartsHandler",
        "[destroyChartInstance] [END] [IMPORTANT]",
        JSON.stringify({ success: true }),
        {},
      );

      // Handle unexpected errors in the request handler
    } catch (error) {
      // Catch and log the error
      DebugLogger.log(
        "ChartsHandler",
        "[destroyChartInstance] [ERROR] [CRITICAL]",
        JSON.stringify({
          message: error.message,
          name: error.name,
          stack: error.stack,
          context: { chartInstanceId },
        }),
        { critical: true },
      );

      // Warn end with failure
      DebugLogger.log(
        "ChartsHandler",
        "[destroyChartInstance] [END] [IMPORTANT]",
        JSON.stringify({ success: false }),
        {},
      );

      // Throw error to caller
      throw error;
    }
  }

  /**
   * Dispose and clear a chart container.
   *
   * Destroys the chart instance (if any) and clears its host element markup.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#disposeAndClear
   *
   * @param {HTMLElement} container - The chart container element to dispose and clear.
   *
   * @returns {void} No return value.
   */
  disposeAndClear(container) {
    // Validate that a container element is provided
    if (!container) {
      // Return early when no container is provided
      return;
    }

    // Read the chart instance id from data attributes
    const id = this.getDataAttribute(container, "chart-id", "");

    // Dispose existing chart instance when an id is present
    if (id) this.destroyChartInstance(id);

    // Clear the chart host markup for the container
    this.clearChartHost(container);
  }

  /**
   * --------------------------------
   * SECTION: DATA & CONFIG HELPERS
   * --------------------------------
   */

  /**
   * Retrieve and parse a JSON configuration from an element attribute.
   *
   * Reads a data attribute, validates it, safely parses the JSON, and returns the resulting object or array.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#getConfigJSON
   *
   * @param {HTMLElement} element - The element containing the configuration attribute.
   * @param {string} [attributeName="data-chart-config"] - The attribute name to read and parse.
   *
   * @returns {Object|Array|null} Parsed configuration object, array, primitive, or null on error.
   */
  getConfigJSON(element, attributeName = "data-chart-config") {
    // Log start of config read
    DebugLogger.log(
      `[ChartsHandler] [getConfigJSON] [Start] ${JSON.stringify({
        attributeName,
        hasElement: !!element,
      })}`,
    );

    // Validate the element and attribute API
    if (!element || typeof element.getAttribute !== "function") {
      // Log invalid element error
      DebugLogger.error(
        `[ChartsHandler] [getConfigJSON] [Error] ${JSON.stringify({
          message: "Invalid element or getAttribute unavailable",
          attributeName,
        })}`,
      );

      // Log end with failure
      DebugLogger.log(
        `[ChartsHandler] [getConfigJSON] [End] ${JSON.stringify({
          success: false,
        })}`,
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
        `[ChartsHandler] [getConfigJSON] [Skip] ${JSON.stringify({
          reason: "missing-or-empty-attribute",
          attributeName,
        })}`,
      );

      // Log end with failure
      DebugLogger.log(
        `[ChartsHandler] [getConfigJSON] [End] ${JSON.stringify({
          success: false,
        })}`,
      );

      // Return null when attribute is missing
      return null;
    }

    // Compute raw value length
    const rawLength = rawValue.length;

    // Log attribute read summary
    DebugLogger.log(
      `[ChartsHandler] [getConfigJSON] [Step] ${JSON.stringify({
        action: "read-attribute",
        attributeName,
        rawLength,
      })}`,
    );

    // Define maximum inline JSON length
    const MAX_INLINE_LEN = 200000;

    // Warn when inline JSON exceeds threshold
    if (rawLength > MAX_INLINE_LEN) {
      // Log oversized inline JSON warning
      DebugLogger.warn(`[ChartsHandler] [getConfigJSON] Oversized inline JSON`, {
        attributeName,
        rawLength,
        MAX_INLINE_LEN,
      });
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
          `[ChartsHandler] [getConfigJSON] Parsed value not an object/array`,
          { attributeName, type: typeof parsed },
        );

        // Log end with success and shape
        DebugLogger.log(
          `[ChartsHandler] [getConfigJSON] [End] ${JSON.stringify({
            success: true,
            shape: typeof parsed,
          })}`,
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
        `[ChartsHandler] [getConfigJSON] [End] ${JSON.stringify({
          success: true,
          summary,
        })}`,
      );

      // Return parsed JSON object or array
      return parsed;

      // Catch and log the error
    } catch (error) {
      // Log invalid JSON parsing error
      DebugLogger.error(
        `[ChartsHandler] [getConfigJSON] [Error] ${JSON.stringify({
          message: "Invalid JSON in attribute",
          attributeName,
          rawLength,
          name: error.name,
        })}`,
      );

      // Log end with failure
      DebugLogger.log(
        `[ChartsHandler] [getConfigJSON] [End] ${JSON.stringify({
          success: false,
        })}`,
      );

      // Return null on parse failure
      return null;
    }
  }

  /**
   * Fetch JSON with timeout and retries.
   *
   * Performs a GET request with AbortController-based timeout, basic backoff retries, and safe logging of response samples.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated - Linden May - 2025-10-04
   * @link https://docs.example.com/ChartsHandler#_fetchJSON
   *
   * @param {string} jsonUrl - The URL to request JSON from.
   * @param {Object} [options] - Optional fetch controls.
   * @param {number} [options.timeoutMs=10000] - Request timeout in milliseconds.
   * @param {number} [options.retries=1] - Number of retry attempts on failure.
   *
   * @returns {Promise<any>} The parsed JSON payload.
   */
  async _fetchJSON(jsonUrl, { timeoutMs = 10000, retries = 1 } = {}) {
    // Log start of fetch operation
    DebugLogger.log(
      `[ChartsHandler] [_fetchJSON] [Start] ${JSON.stringify({ jsonUrl })}`,
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
        // Log API request details
        DebugLogger.log(
          `[ChartsHandler] [_fetchJSON] [API-Request] ${JSON.stringify({
            url: jsonUrl,
            method: "GET",
            options: { cache: "no-store", timeoutMs },
          })}`,
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
          // Log non-OK response error
          DebugLogger.error(
            `[ChartsHandler] [_fetchJSON] [Error] ${JSON.stringify({
              message: `Fetch failed for ${jsonUrl}`,
              status: response.status,
              statusText: response.statusText,
              elapsedMs,
            })}`,
          );

          // Log end state for failed attempt
          DebugLogger.log(
            `[ChartsHandler] [_fetchJSON] [End] ${JSON.stringify({
              success: false,
            })}`,
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
            `[ChartsHandler] Fetch failed for ${jsonUrl} (status: ${response.status})`,
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

        // Log API response summary
        DebugLogger.log(
          `[ChartsHandler] [_fetchJSON] [API-Response] ${JSON.stringify({
            url: jsonUrl,
            status: response.status,
            elapsedMs,
            bodySample,
          })}`,
        );

        // Log successful end of fetch
        DebugLogger.log(
          `[ChartsHandler] [_fetchJSON] [End] ${JSON.stringify({
            success: true,
          })}`,
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
          `[ChartsHandler] [_fetchJSON] [Error] ${JSON.stringify({
            message: error.message,
            name: error.name,
            stack: error.stack,
            url: jsonUrl,
            elapsedMs,
            aborted: error.name === "AbortError",
          })}`,
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
          `[ChartsHandler] [_fetchJSON] [End] ${JSON.stringify({
            success: false,
          })}`,
        );

        // Throw error to caller
        throw error;
      }
    }
  }

  /**
   * --------------------------------
   * SECTION: UTILITIES
   * --------------------------------
   */

  /**
   * Normalize a color value to a CSS hex string.
   *
   * Attempts to use `toCSSHex`, falls back to amCharts color parsing, or stringifies input; returns "#999" on failure.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#normalizeColorHex
   *
   * @param {any} colorInput - Color value (may be a string, amCharts color, or object with `toCSSHex()`).
   *
   * @returns {string} A CSS hex color string (e.g., "#RRGGBB").
   */
  normalizeColorHex(colorInput) {
    // Log start of normalization
    DebugLogger.log(
      `[ChartsHandler] [normalizeColorHex] [Start] ${JSON.stringify({
        hasInput: !!colorInput,
      })}`,
    );

    // Begin guarded normalization block
    try {
      // Check for missing input value
      if (!colorInput) {
        // Log defaulting due to no input
        DebugLogger.warn(
          `[ChartsHandler] [normalizeColorHex] [End] ${JSON.stringify({
            success: true,
            result: "#999",
            reason: "no-input",
          })}`,
        );

        // Return default hex when input is absent
        return "#999";
      }

      // Check if input exposes toCSSHex converter
      if (typeof colorInput.toCSSHex === "function") {
        // Convert color using provided toCSSHex
        const result = colorInput.toCSSHex();

        // Log usage of toCSSHex method
        DebugLogger.log(
          `[ChartsHandler] [normalizeColorHex] [Step] ${JSON.stringify({
            action: "Used toCSSHex method",
            result,
          })}`,
        );

        // Log successful end with result
        DebugLogger.log(
          `[ChartsHandler] [normalizeColorHex] [End] ${JSON.stringify({
            success: true,
            result,
          })}`,
        );

        // Return normalized hex from input method
        return result;
      }

      // Log resolving color via am5 utilities
      DebugLogger.log(
        `[ChartsHandler] [normalizeColorHex] [Step] ${JSON.stringify({
          action: "Resolving via am5.Color",
        })}`,
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

        // Log successful resolution to hex
        DebugLogger.log(
          `[ChartsHandler] [normalizeColorHex] [Step] ${JSON.stringify({
            action: "Resolved with toCSSHex",
            result,
          })}`,
        );

        // Log successful end with resolved result
        DebugLogger.log(
          `[ChartsHandler] [normalizeColorHex] [End] ${JSON.stringify({
            success: true,
            result,
          })}`,
        );

        // Return normalized hex from resolved color
        return result;
      }

      // Compute fallback result as stringified input
      const fallbackResult = String(colorInput);

      // Log fallback conversion to string
      DebugLogger.log(
        `[ChartsHandler] [normalizeColorHex] [Step] ${JSON.stringify({
          action: "Fallback to string",
          fallbackResult,
        })}`,
      );

      // Log successful end with fallback result
      DebugLogger.log(
        `[ChartsHandler] [normalizeColorHex] [End] ${JSON.stringify({
          success: true,
          result: fallbackResult,
        })}`,
      );

      // Return fallback string result
      return fallbackResult;

      // Begin error handling block
    } catch (error) {
      // Log error details during normalization
      DebugLogger.error(
        `[ChartsHandler] [normalizeColorHex] [Error] ${JSON.stringify({
          message: error.message,
          name: error.name,
          stack: error.stack,
          context: { colorInput },
        })}`,
      );

      // Log end with failure and default result
      DebugLogger.log(
        `[ChartsHandler] [normalizeColorHex] [End] ${JSON.stringify({
          success: false,
          result: "#999",
        })}`,
      );

      // Return default hex on error
      return "#999";
    }
  }

  /**
   * Mark or unmark a container as active.
   *
   * Toggles an active CSS class on the provided container element.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#markActive
   *
   * @param {HTMLElement} container - The container element to update.
   * @param {boolean} isActive - Whether the container should be marked as active.
   * @param {string} [activeClass="is-scope-target"] - CSS class to toggle for active state.
   *
   * @returns {void} No return value.
   */
  markActive(container, isActive, activeClass = "is-scope-target") {
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
   * Resolve a series color from HTML configuration.
   *
   * Attempts to resolve color from seriesStyles, palette, or returns null if unavailable.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#_seriesColorFromHTML
   *
   * @param {Object} styleConfig - The chart's style configuration containing palette or series styles.
   * @param {string} seriesKey - The key identifying the series in the chart.
   * @param {number} seriesIndex - The index of the series for palette lookup.
   *
   * @returns {any|null} amCharts color object or null if not found.
   */
  _seriesColorFromHTML(styleConfig, seriesKey, seriesIndex) {
    // Log start of series color resolution
    DebugLogger.log(
      `[ChartsHandler] [_seriesColorFromHTML] [Start] ${JSON.stringify({
        seriesKey,
        seriesIndex,
      })}`,
    );

    // Begin guarded color resolution block
    try {
      // Read series color from style configuration
      const seriesColorFromConfig =
        styleConfig.seriesStyles?.[seriesKey]?.color;

      // Check if a series-specific color is provided
      if (seriesColorFromConfig) {
        // Log color source as seriesStyles
        DebugLogger.log(
          `[ChartsHandler] [_seriesColorFromHTML] [Step] ${JSON.stringify({
            source: "seriesStyles",
            color: seriesColorFromConfig,
          })}`,
        );

        // Log end with success state
        DebugLogger.log(
          `[ChartsHandler] [_seriesColorFromHTML] [End] ${JSON.stringify({
            success: true,
          })}`,
        );

        // Return am5 color parsed from series-specific value
        return am5.color(seriesColorFromConfig);
      }

      // Resolve palette colors array from style configuration
      const paletteColors = Array.isArray(styleConfig.palette)
        ? styleConfig.palette
        : null;

      // Check if a palette exists and has entries
      if (paletteColors && paletteColors.length) {
        // Resolve color using series index modulo palette length
        const resolvedColor = paletteColors[seriesIndex % paletteColors.length];

        // Log color source as palette
        DebugLogger.log(
          `[ChartsHandler] [_seriesColorFromHTML] [Step] ${JSON.stringify({
            source: "palette",
            resolvedColor,
          })}`,
        );

        // Log end with success state
        DebugLogger.log(
          `[ChartsHandler] [_seriesColorFromHTML] [End] ${JSON.stringify({
            success: true,
          })}`,
        );

        // Return am5 color parsed from palette value
        return am5.color(resolvedColor);
      }

      // Log fallback when no color could be resolved
      DebugLogger.log(
        `[ChartsHandler] [_seriesColorFromHTML] [Step] ${JSON.stringify({
          source: "fallback",
          resolvedColor: null,
        })}`,
      );

      // Log end with success state
      DebugLogger.log(
        `[ChartsHandler] [_seriesColorFromHTML] [End] ${JSON.stringify({
          success: true,
        })}`,
      );

      // Return null when no color is available
      return null;

      // Catch and log the error
    } catch (error) {
      // Catch and log the error
      DebugLogger.error(
        `[ChartsHandler] [_seriesColorFromHTML] [Error] ${JSON.stringify({
          message: error.message,
          name: error.name,
          stack: error.stack,
          context: { seriesKey, seriesIndex },
        })}`,
      );

      // Warn end with failure state
      DebugLogger.warn(
        `[ChartsHandler] [_seriesColorFromHTML] [End] ${JSON.stringify({
          success: false,
        })}`,
      );

      // Throw error to caller
      throw error;
    }
  }

  /**
   * Safely retrieve a data-* attribute from an element.
   *
   * Reads a data attribute and returns its value or a default if missing or invalid.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#getDataAttribute
   *
   * @param {HTMLElement} element - The element containing the data attribute.
   * @param {string} attributeName - The name of the data attribute (without "data-").
   * @param {string} [defaultValue=""] - Fallback value if the attribute is missing.
   *
   * @returns {string} The attribute value or the provided default.
   */
  getDataAttribute(element, attributeName, defaultValue = "") {
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
   * Retrieve the chart host element from a container.
   *
   * Finds the chart host within the container using a configured selector or defaults to "[amchart]".
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#getChartHost
   *
   * @param {HTMLElement} container - The parent container element for the chart.
   *
   * @returns {HTMLElement|null} The chart host element or null if not found.
   */
  getChartHost(container) {
    // Validate container argument
    if (!container) {
      // Return null when container is missing
      return null;
    }

    // Resolve host selector from options or default
    const selector = this.options?.selectors?.chartHost || "[amchart]";

    // Return chart host element or container as fallback
    return container.querySelector(selector) || container;
  }

  /**
   * Clear the chart host element's inner HTML.
   *
   * Retrieves the chart host and removes all inner markup for cleanup or re-rendering.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#clearChartHost
   *
   * @param {HTMLElement} container - The container element holding the chart host.
   *
   * @returns {HTMLElement|null} The cleared chart host element or null if not found.
   */
  clearChartHost(container) {
    // Resolve the chart host element for the container
    const host = this.getChartHost(container);

    // Check that host exists and supports innerHTML
    if (host && typeof host.innerHTML === "string") {
      // Clear the host inner HTML
      host.innerHTML = "";
    }

    // Return the host or null when absent
    return host || null;
  }

  /**
   * --------------------------------
   * SECTION: TOOLTIP & CURSOR
   * --------------------------------
   */

  /**
   * Build a styled amCharts tooltip.
   *
   * Creates a tooltip with rounded background, custom label styles, and an optional text adapter.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#buildTooltip
   *
   * @param {any} chartRoot - amCharts root instance used to create tooltip elements.
   * @param {function|null} [labelTextAdapter=null] - Optional adapter callback to transform tooltip text.
   *
   * @returns {any} The constructed amCharts Tooltip instance.
   */
  buildTooltip(chartRoot, labelTextAdapter = null) {
    // Begin guarded build block
    try {

      // Create tooltip with background configuration
      const tooltipInstance = am5.Tooltip.new(chartRoot, {
        // Create rounded rectangle background
        background: am5.RoundedRectangle.new(chartRoot, {
          // Set white fill color
          fill: am5.color(0xffffff),
          // Set shadow color
          shadowColor: am5.color(0xe2e2e2),
          // Set shadow blur amount
          shadowBlur: 8,
          // Set horizontal shadow offset
          shadowOffsetX: 0,
          // Set vertical shadow offset
          shadowOffsetY: 0,
        }),
      });


      DebugLogger.log(
        "[DEBUG_TOOLTIP] [ChartsHandler] [buildTooltip] Tooltip configured",
        {
          hasLabelTextAdapter: !!labelTextAdapter,
          background: {
            fill: "#ffffff",
            shadowColor: "#e2e2e2",
            shadowBlur: 8,
          },
          label: {
            fill: "#344054",
            fontWeight: 500,
            fontSize: 12,
          },
        },
        { tooltip: true, critical: true },
      );

      // Apply corner radius to background
      tooltipInstance.get("background").setAll({
        // Set top left radius
        cornerRadiusTL: 2,
        // Set top right radius
        cornerRadiusTR: 2,
        // Set bottom left radius
        cornerRadiusBL: 2,
        // Set bottom right radius
        cornerRadiusBR: 2,
      });

      // Apply label style configuration
      tooltipInstance.label.setAll({
        // Enable bbcode text type
        textType: "bbcode",
        // Set font family
        fontFamily: "Poppins, sans-serif",
        // Set font size
        fontSize: "0.75rem",
        // Set text color
        fill: am5.color(0x344054),
        // Align text to the left
        textAlign: "left",
        // Remove left padding
        paddingLeft: 0,
        // Remove right padding
        paddingRight: 0,
        // Remove top padding
        paddingTop: 0,
        // Remove bottom padding
        paddingBottom: 0,
      });

      // Check if label text adapter is provided
      if (labelTextAdapter) {
        // Add label text adapter handler
        tooltipInstance.label.adapters.add("text", labelTextAdapter);
      }

      DebugLogger.log(
        "ChartsHandler",
        "Tooltip built successfully",
        {
          hasLabelTextAdapter: !!labelTextAdapter,
          success: true,
        },
        { tooltip: true },
      );

      // Return the created tooltip instance
      return tooltipInstance;

      // Begin error handling block
    } catch (error) {
      // Log error details for tooltip build
      DebugLogger.error(
        `[ChartsHandler] [buildTooltip] [Error] ${JSON.stringify({
          message: error.message,
          name: error.name,
          stack: error.stack,
          context: { hasLabelTextAdapter: !!labelTextAdapter },
        })}`,
      );

      // Throw error to caller
      throw error;
    }
  }

  /**
   * Enable and configure an XY cursor for a chart instance.
   *
   * Creates an amCharts XYCursor, attaches it to the chart, and hides its X and Y guide lines.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#enableChartCursor
   *
   * @param {any} chartInstance - The amCharts chart instance to attach the cursor to.
   * @param {any} chartRoot - The amCharts root element used for creating the cursor.
   *
   * @returns {any} The created XYCursor instance.
   */
  enableChartCursor(chartInstance, chartRoot) {
    // Log start of enabling chart cursor
    DebugLogger.log(
      `[ChartsHandler] [enableChartCursor] [Start] ${JSON.stringify({})}`,
    );

    // Begin guarded cursor creation block
    try {
      // Log creation of XYCursor instance
      DebugLogger.log(
        `[ChartsHandler] [enableChartCursor] [Step] ${JSON.stringify({
          action: "Creating XYCursor instance",
        })}`,
      );

      // Create and attach XYCursor with no behavior
      const cursorInstance = chartInstance.set(
        "cursor",
        am5xy.XYCursor.new(chartRoot, { behavior: "none" }),
      );

      // Log hiding of Y axis cursor line
      DebugLogger.log(
        `[ChartsHandler] [enableChartCursor] [Step] ${JSON.stringify({
          action: "Hiding Y line",
        })}`,
      );

      // Hide the Y cursor line for cleaner UI
      cursorInstance.lineY.set("visible", false);

      // Log hiding of X axis cursor line
      DebugLogger.log(
        `[ChartsHandler] [enableChartCursor] [Step] ${JSON.stringify({
          action: "Hiding X line",
        })}`,
      );

      // Hide the X cursor line for cleaner UI
      cursorInstance.lineX.set("visible", false);

      // Log successful completion
      DebugLogger.log(
        `[ChartsHandler] [enableChartCursor] [End] ${JSON.stringify({
          success: true,
        })}`,
      );

      // Return the created cursor instance
      return cursorInstance;

      // Handle unexpected errors in the request handler
    } catch (error) {
      // Catch and log the error
      DebugLogger.error(
        `[ChartsHandler] [enableChartCursor] [Error] ${JSON.stringify({
          message: error.message,
          name: error.name,
          stack: error.stack,
        })}`,
      );

      // Warn end with failure
      DebugLogger.warn(
        `[ChartsHandler] [enableChartCursor] [End] ${JSON.stringify({
          success: false,
        })}`,
      );

      // Throw error to caller
      throw error;
    }
  }

  /**
   * --------------------------------
   * SECTION: AXES & CHART CREATION
   * --------------------------------
   */

  /**
   * Create an amCharts XY chart instance.
   *
   * Initializes and returns an XY chart with configured padding and chart options.
   *
   * @author Linden May
   * @version x.y.z
   * @since x.y.z
   * @updated - Linden May - 2025-10-04
   * @link https://docs.example.com/ChartsHandler#_createXYChart
   *
   * @param {any} chartRoot - amCharts root instance for creating the chart.
   * @param {Object} styleConfig - Style configuration including padding and layout options.
   * @param {Object} [chartOptions={ chartType: "XYChart" }] - Additional amCharts chart options.
   *
   * @returns {any} The created amCharts XY chart instance.
   */
  _createXYChart(
    chartRoot,
    styleConfig,
    chartOptions = { chartType: "XYChart" },
  ) {
    // Log start of XY chart creation
    DebugLogger.log(
      `[ChartsHandler] [_createXYChart] [Start] ${JSON.stringify({
        chartOptions,
      })}`,
    );

    // Begin guarded chart creation block
    try {
      // Resolve left padding value from style config
      const paddingLeftValue = styleConfig.padding?.left ?? 0;

      // Resolve top padding value with fallback
      const paddingTopValue =
        styleConfig.padding?.top ?? styleConfig.plotTopPaddingPx ?? 8;

      // Log resolved padding configuration
      DebugLogger.log(
        `[ChartsHandler] [_createXYChart] [Step] ${JSON.stringify({
          resolvedPadding: {
            left: paddingLeftValue,
            right: styleConfig.padding?.right ?? 0,
            top: paddingTopValue,
            bottom: styleConfig.padding?.bottom ?? 60,
          },
        })}`,
      );

      // Create chart instance and push into root container
      const chartInstance = chartRoot.container.children.push(
        // Instantiate the requested XY chart type
        am5xy[chartOptions.chartType].new(chartRoot, {
          // Disable horizontal panning
          panX: false,
          // Disable vertical panning
          panY: false,
          // Disable wheel interaction on X axis
          wheelX: "none",
          // Disable wheel interaction on Y axis
          wheelY: "none",
          // Apply resolved left padding
          paddingLeft: paddingLeftValue,
          // Apply resolved right padding
          paddingRight: styleConfig.padding?.right ?? 0,
          // Apply resolved top padding
          paddingTop: paddingTopValue,
          // Apply resolved bottom padding
          paddingBottom: styleConfig.padding?.bottom ?? 60,
          // Ensure tooltips can appear anywhere
          maxTooltipDistance: -1,
          // Merge provided chart options
          ...chartOptions,
        }),
      );

      // Log successful end of XY chart creation
      DebugLogger.log(
        `[ChartsHandler] [_createXYChart] [End] ${JSON.stringify({
          success: true,
        })}`,
      );

      // Return the created chart instance
      return chartInstance;

      // Handle unexpected errors in the request handler
    } catch (error) {
      // Catch and log the error
      DebugLogger.error(
        `[ChartsHandler] [_createXYChart] [Error] ${JSON.stringify({
          message: error.message,
          name: error.name,
          stack: error.stack,
          context: { chartOptions },
        })}`,
      );

      // Warn end with failure
      DebugLogger.warn(
        `[ChartsHandler] [_createXYChart] [End] ${JSON.stringify({
          success: false,
        })}`,
      );

      // Throw error to caller
      throw error;
    }
  }

  /**
   * Create and configure X/Y axes for an XY chart.
   *
   * Builds category X axis and value Y axis, applies label/grid styles, headroom, and optional Y-axis label.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated --
   * @link https://docs.example.com/ChartsHandler#_createAxes
   *
   * @param {any} chartInstance - The amCharts XY chart instance to add axes to.
   * @param {any} chartRoot - The amCharts root used to construct axis components.
   * @param {Object} fieldConfig - Field configuration containing category/value keys.
   * @param {Object} styleConfig - Styling options including axis labels and padding.
   *
   * @returns {{ xAxis: any, yAxis: any }} The created X and Y axis instances.
   */
  _createAxes(chartInstance, chartRoot, fieldConfig, styleConfig) {
    // Log start of axes creation
    DebugLogger.log(
      `[ChartsHandler] [_createAxes] [Start] ${JSON.stringify({
        fieldConfig,
        styleConfig,
      })}`,
    );

    // Begin guarded axes creation block
    try {
      // Log creation of X axis
      DebugLogger.log(
        `[ChartsHandler] [_createAxes] [Step] ${JSON.stringify({
          action: "Creating X axis",
        })}`,
      );

      // Create and push X axis instance
      const xAxisInstance = chartInstance.xAxes.push(
        am5xy.CategoryAxis.new(chartRoot, {
          categoryField: fieldConfig.category,
          renderer: am5xy.AxisRendererX.new(chartRoot, { 
            minGridDistance: styleConfig.xAxis?.minGridDistance || 30 
          }),
        }),
      );

      // Log creation of Y axis
      DebugLogger.log(
        `[ChartsHandler] [_createAxes] [Step] ${JSON.stringify({
          action: "Creating Y axis",
        })}`,
      );

      // Create and push Y axis instance
      const yAxisInstance = chartInstance.yAxes.push(
        am5xy.ValueAxis.new(chartRoot, {
          renderer: am5xy.AxisRendererY.new(chartRoot, {}),
          min: styleConfig.yAxis?.min,
          strictMinMax: !!styleConfig.yAxis?.strict,
        }),
      );

      // Log configuration of Y axis extra headroom
      DebugLogger.log(
        `[ChartsHandler] [_createAxes] [Step] ${JSON.stringify({
          action: "Configuring Y axis extra headroom",
        })}`,
      );

      // Apply extra headroom to Y axis
      yAxisInstance.setAll({
        extraMax:
          styleConfig.yAxis?.extraHeadroom != null
            ? styleConfig.yAxis.extraHeadroom
            : 0,
      });

      // Resolve axis label fill color
      const axisLabelFillColor = am5.color(
        styleConfig.axisLabelColor || 0x475467,
      );

      // Resolve axis label font size
      const axisLabelFontSize = styleConfig.axisLabelFontSize || "12px";

      // Log application of label and grid styles
      DebugLogger.log(
        `[ChartsHandler] [_createAxes] [Step] ${JSON.stringify({
          action: "Applying label/grid styles",
          fontSize: axisLabelFontSize,
          fillColor: styleConfig.axisLabelColor || "default(0x475467)",
        })}`,
      );

      // Apply renderer label and grid styles for both axes
      [xAxisInstance, yAxisInstance].forEach((axisInstance) => {
        // Set label styles on axis renderer
        axisInstance.get("renderer").labels.template.setAll({
          fontSize: axisLabelFontSize,
          fill: axisLabelFillColor,
        });

        // Hide grid lines on axis renderer
        axisInstance.get("renderer").grid.template.setAll({ visible: false });
      });

      // Check if Y axis label configuration is provided
      if (styleConfig.yAxis?.label) {
        // Log adding Y axis label
        DebugLogger.log(
          `[ChartsHandler] [_createAxes] [Step] ${JSON.stringify({
            action: "Adding Y axis label",
            label: styleConfig.yAxis.label,
          })}`,
        );

        // Insert Y axis title label
        yAxisInstance.children.unshift(
          am5.Label.new(chartRoot, {
            text: styleConfig.yAxis.label.text || "",
            rotation: -90,
            fontSize: styleConfig.yAxis.label.fontSize || 14,
            fontWeight: styleConfig.yAxis.label.fontWeight || "bold",
            fill: axisLabelFillColor,
            y: am5.p50,
            centerX: am5.p50,
          }),
        );
      }

      // Log successful end of axes creation
      DebugLogger.log(
        `[ChartsHandler] [_createAxes] [End] ${JSON.stringify({
          success: true,
        })}`,
      );

      // Return created axis instances
      return { xAxis: xAxisInstance, yAxis: yAxisInstance };

      // Handle unexpected errors in the request handler
    } catch (error) {
      // Catch and log the error
      DebugLogger.error(
        `[ChartsHandler] [_createAxes] [Error] ${JSON.stringify({
          message: error.message,
          name: error.name,
          stack: error.stack,
          context: { fieldConfig, styleConfig },
        })}`,
      );

      // Warn end with failure
      DebugLogger.warn(
        `[ChartsHandler] [_createAxes] [End] ${JSON.stringify({
          success: false,
        })}`,
      );

      // Throw error to caller
      throw error;
    }
  }

  /**
   * --------------------------------
   * SECTION: SERIES CREATORS
   * --------------------------------
   */

  /**
   * Create a configured ColumnSeries for an XY chart.
   *
   * Builds and styles a ColumnSeries using provided axes, fields, colors, and tooltip options.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#_createColumnSeries
   *
   * @param {any} chartInstance - The amCharts XY chart instance to attach the series to.
   * @param {any} chartRoot - The amCharts root used to construct series components.
   * @param {string} seriesKey - Data field key used for the series' valueY field.
   * @param {Object} styleConfig - Style options controlling stacking, widths, colors, and tooltips.
   * @param {Object} fieldConfig - Field configuration including `category` name.
   * @param {any} xAxisInstance - The X axis instance the series will use.
   * @param {any} yAxisInstance - The Y axis instance the series will use.
   * @param {any} seriesColor - Optional amCharts color to apply to the series columns.
   *
   * @returns {any} The created amCharts ColumnSeries instance.
   */
  _createColumnSeries(
    chartInstance,
    chartRoot,
    seriesKey,
    styleConfig,
    fieldConfig,
    xAxisInstance,
    yAxisInstance,
    seriesColor,
  ) {
    // Log start of column series creation
    DebugLogger.log(
      `[ChartsHandler] [_createColumnSeries] [Start] ${JSON.stringify({
        seriesKey,
        stacked: !!styleConfig?.stacked,
      })}`,
    );

    // Begin guarded series creation block
    try {
      // Resolve series label from style config or fallback to key
      const seriesLabel = styleConfig.seriesLabels?.[seriesKey] || seriesKey;

      // Log new series creation parameters
      DebugLogger.log(
        `[ChartsHandler] [_createColumnSeries] [Step] ${JSON.stringify({
          action: "Creating ColumnSeries",
          seriesLabel,
          valueYField: seriesKey,
          categoryXField: fieldConfig?.category,
        })}`,
      );

      // Create and push the ColumnSeries into the chart
      const seriesInstance = chartInstance.series.push(
        am5xy.ColumnSeries.new(chartRoot, {
          name: seriesLabel,
          stacked: !!styleConfig.stacked,
          xAxis: xAxisInstance,
          yAxis: yAxisInstance,
          valueYField: seriesKey,
          categoryXField: fieldConfig.category,
        }),
      );

      // Resolve configured column width percent if provided
      const columnWidthPercent =
        styleConfig.bar?.widthPercent != null
          ? Number(styleConfig.bar.widthPercent)
          : null;

      // Log column styling configuration
      DebugLogger.log(
        `[ChartsHandler] [_createColumnSeries] [Step] ${JSON.stringify({
          action: "Applying column styles",
          columnWidthPercent,
          hasSeriesColor: !!seriesColor,
        })}`,
      );

      // Apply column width and color styles to the template
      seriesInstance.columns.template.setAll({
        ...(columnWidthPercent != null
          ? { width: am5.percent(columnWidthPercent) }

          : {}),
        ...(seriesColor ? { fill: seriesColor, stroke: seriesColor } : {}),
      });

      // Determine if aggregated tooltip mode is enabled
      const isAggregatedTooltipEnabled =
        !!styleConfig.tooltip?.aggregated?.enabled;

      // Log tooltip configuration mode
      DebugLogger.log(
        `[ChartsHandler] [_createColumnSeries] [Step] ${JSON.stringify({
          action: "Configuring tooltip",
          isAggregatedTooltipEnabled,
        })}`,
      );

      // Set tooltip behavior based on aggregated mode
      seriesInstance.set(
        "tooltip",
        isAggregatedTooltipEnabled
          ? am5.Tooltip.new(chartRoot, { forceHidden: true })
          : am5.Tooltip.new(chartRoot, {
              labelText: "[bold]{name}[/]\n{categoryX}: {valueY}",
            }),
      );

      // Log successful creation end
      DebugLogger.log(
        `[ChartsHandler] [_createColumnSeries] [End] ${JSON.stringify({
          success: true,
        })}`,
      );

      // Return the created series instance
      return seriesInstance;

      // Handle unexpected errors in the request handler
    } catch (error) {
      // Log error details for series creation failure
      DebugLogger.error(
        `[ChartsHandler] [_createColumnSeries] [Error] ${JSON.stringify({
          message: error.message,
          name: error.name,
          stack: error.stack,
          context: { seriesKey },
        })}`,
      );

      // Warn that the operation ended with failure
      DebugLogger.warn(
        `[ChartsHandler] [_createColumnSeries] [End] ${JSON.stringify({
          success: false,
        })}`,
      );

      // Throw error to caller
      throw error;
    }
  }

  /**
   * Create a configured SmoothedXLineSeries for an XY chart.
   *
   * Builds a line series with resolved color, stroke width, tooltip behavior, and optional gradient shadow fill.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#_createLineSeries
   *
   * @param {any} chartInstance - The amCharts XY chart instance to attach the series to.
   * @param {any} chartRoot - The amCharts root used to construct series components.
   * @param {string} seriesKey - Data field key used for the series' valueY field.
   * @param {Object} styleConfig - Style options controlling line width, tooltips, and more.
   * @param {Object} fieldConfig - Field configuration including `category` name.
   * @param {any} xAxisInstance - The X axis instance the series will use.
   * @param {any} yAxisInstance - The Y axis instance the series will use.
   * @param {boolean} [isShadowEnabled=false] - Whether to render a gradient shadow fill beneath the line.
   * @param {any} seriesColor - Optional color (string or amCharts color) to apply to the series.
   *
   * @returns {any} The created amCharts SmoothedXLineSeries instance.
   */
  _createLineSeries(
    chartInstance,
    chartRoot,
    seriesKey,
    styleConfig,
    fieldConfig,
    xAxisInstance,
    yAxisInstance,
    isShadowEnabled = false,
    seriesColor,
  ) {
    // Log start of line series creation
    DebugLogger.log(
      `[ChartsHandler] [_createLineSeries] [Start] ${JSON.stringify({
        seriesKey,
        isShadowEnabled: !!isShadowEnabled,
      })}`,
    );

    // Begin guarded series creation block
    try {
      // Resolve series label from style config or key
      const seriesLabel = styleConfig.seriesLabels?.[seriesKey] || seriesKey;

      // Read stroke width from series style config
      const seriesStrokeWidthConfig =
        styleConfig.seriesStyles?.[seriesKey]?.strokeWidth;

      // Read global stroke width from style config
      const globalStrokeWidthConfig = styleConfig.line?.strokeWidth;

      // Resolve effective stroke width number
      const resolvedStrokeWidth = Number(
        seriesStrokeWidthConfig !== undefined
          ? seriesStrokeWidthConfig
          : globalStrokeWidthConfig !== undefined
            ? globalStrokeWidthConfig
            : isShadowEnabled
              ? 2
              : 4,
      );

      // Log stroke width resolution details
      DebugLogger.log(
        `[ChartsHandler] [_createLineSeries] [Step] ${JSON.stringify({
          action: "Resolve stroke width",
          seriesStrokeWidthConfig,
          globalStrokeWidthConfig,
          isShadowEnabled,
          resolvedStrokeWidth,
        })}`,
      );

      // Log series creation parameters
      DebugLogger.log(
        `[ChartsHandler] [_createLineSeries] [Step] ${JSON.stringify({
          action: "Create SmoothedXLineSeries",
          seriesLabel,
          valueYField: seriesKey,
          categoryXField: fieldConfig?.category,
        })}`,
      );

      // Create and push SmoothedXLineSeries into chart
      const seriesInstance = chartInstance.series.push(
        am5xy.SmoothedXLineSeries.new(chartRoot, {
          name: seriesLabel,
          xAxis: xAxisInstance,
          yAxis: yAxisInstance,
          valueYField: seriesKey,
          categoryXField: fieldConfig.category,
        }),
      );

      // Normalize the provided series color
      const resolvedColor = seriesColor
        ? typeof seriesColor === "string"
          ? am5.color(seriesColor)
          : seriesColor
        : null;

      // Log color normalization result
      DebugLogger.log(
        `[ChartsHandler] [_createLineSeries] [Step] ${JSON.stringify({
          action: "Normalize color",
          inputSeriesColorType: seriesColor ? typeof seriesColor : null,
          hasResolvedColor: !!resolvedColor,
        })}`,
      );

      // Apply resolved stroke and fill colors when available
      if (resolvedColor) {
        // Set stroke and fill colors on the series
        seriesInstance.setAll({ stroke: resolvedColor, fill: resolvedColor });
      }

      // Log curve factory and stroke style setup
      DebugLogger.log(
        `[ChartsHandler] [_createLineSeries] [Step] ${JSON.stringify({
          action: "Set curve factory and stroke styles",
          resolvedStrokeWidth,
        })}`,
      );

      // Configure curve factory for smoothing
      seriesInstance.set("curveFactory", am5.curveCatmullRom);

      // Configure stroke template styles
      seriesInstance.strokes.template.setAll({
        ...(resolvedColor ? { stroke: resolvedColor } : {}),
        strokeWidth: resolvedStrokeWidth,
        strokeLinecap: "round",
      });

      // Determine aggregated tooltip mode
      const isAggregatedTooltipEnabled =
        !!styleConfig.tooltip?.aggregated?.enabled;

      // Log tooltip configuration mode
      DebugLogger.log(
        `[ChartsHandler] [_createLineSeries] [Step] ${JSON.stringify({
          action: "Configure tooltip",
          isAggregatedTooltipEnabled,
        })}`,
      );

      // Configure tooltip based on aggregated mode
      seriesInstance.set(
        "tooltip",
        isAggregatedTooltipEnabled
          ? am5.Tooltip.new(chartRoot, { forceHidden: true })
          : am5.Tooltip.new(chartRoot, {
              labelText: "[bold]{name}[/]\n{categoryX}: {valueY}",
            }),
      );

      // Check if shadow fill is enabled
      if (isShadowEnabled) {
        // Log configuration of shadow area fill
        DebugLogger.log(
          `[ChartsHandler] [_createLineSeries] [Step] ${JSON.stringify({
            action: "Configure shadow area fill",
          })}`,
        );

        // Resolve shadow fill base color
        const shadowFillColor =
          resolvedColor || seriesInstance.get("stroke") || am5.color(0x000000);

        // Apply vertical gradient for shadow area
        seriesInstance.fills.template.set(
          "fillGradient",
          am5.LinearGradient.new(chartRoot, {
            stops: [
              { color: shadowFillColor, opacity: 0.3 },
              { color: shadowFillColor, opacity: 0.2 },
              { color: am5.color(0xffffff), opacity: 0.0 },
            ],
            rotation: 90,
          }),
        );

        // Enable area fill for the series
        seriesInstance.fills.template.setAll({ visible: true, fillOpacity: 1 });
      }

      // Log successful end of line series creation
      DebugLogger.log(
        `[ChartsHandler] [_createLineSeries] [End] ${JSON.stringify({
          success: true,
        })}`,
      );

      // Return the created series instance
      return seriesInstance;

      // Handle unexpected errors in the request handler
    } catch (error) {
      // Catch and log the error
      DebugLogger.error(
        `[ChartsHandler] [_createLineSeries] [Error] ${JSON.stringify({
          message: error.message,
          name: error.name,
          stack: error.stack,
          context: { seriesKey, isShadowEnabled: !!isShadowEnabled },
        })}`,
      );

      // Warn end with failure
      DebugLogger.warn(
        `[ChartsHandler] [_createLineSeries] [End] ${JSON.stringify({
          success: false,
        })}`,
      );

      // Throw error to caller
      throw error;
    }
  }

  /**
   * --------------------------------
   * SECTION: PRIVATE RENDERERS
   * --------------------------------
   */

  /**
   * Render a choropleth/world map chart.
   *
   * Builds a MapChart with grouped polygon series, tooltips, interactions, and optional legend.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#_renderMap
   *
   * @param {Object} params - Map rendering context.
   * @param {string} params.chartInstanceId - Unique ID for the chart instance.
   * @param {HTMLElement} params.chartHostElement - DOM element that hosts the chart.
   * @param {any} params.chartRoot - amCharts root instance used to construct map elements.
   * @param {Object} params.styleConfig - Styling and legend configuration for the map.
   * @param {Array} params.datasetRows - Array of group objects containing polygon data.
   *
   * @returns {void} No return value.
   */
  _renderMap({
    chartInstanceId,
    chartHostElement,
    chartRoot,
    styleConfig,
    datasetRows,
  }) {
    // Create map chart instance
    const chartInstance = chartRoot.container.children.push(
      am5map.MapChart.new(chartRoot, {
        homeZoomLevel: 1,
        homeGeoPoint: { longitude: 0, latitude: 40 },
      }),
    );

    // Create world polygon series
    const worldSeries = chartInstance.series.push(
      am5map.MapPolygonSeries.new(chartRoot, {
        geoJSON: am5geodata_worldLow,
        exclude: ["AQ"],
      }),
    );

    // Apply base fill to world polygons
    worldSeries.mapPolygons.template.setAll({ fill: am5.color(0xaaaaaa) });

    // Reset view when data is validated
    worldSeries.events.on("datavalidated", () => chartInstance.goHome());

    // Resolve tooltip text color
    const tooltipColorHex = styleConfig.tooltip?.color || "#344054";

    // Resolve tooltip value prefix
    const valuePrefix = styleConfig.tooltip?.valuePrefix ?? "";

    // Resolve tooltip value suffix
    const valueSuffix = styleConfig.tooltip?.valueSuffix ?? "";

    // Create tooltip instance for polygons
    const tooltipInstance = am5.Tooltip.new(chartRoot, {});

    // Disable background color inheritance from sprite
    tooltipInstance.set("getFillFromSprite", false);

    // Configure tooltip background styles
    tooltipInstance.get("background").setAll({
      fill: am5.color(0xffffff),
      stroke: am5.color(0xe2e2e2),
      strokeWidth: 1,
      cornerRadiusTL: 4,
      cornerRadiusTR: 4,
      cornerRadiusBL: 4,
      cornerRadiusBR: 4,
    });

    // Configure tooltip label styles
    tooltipInstance.label.setAll({
      textType: "bbcode",
      autoTextColor: false,
      fill: am5.color(tooltipColorHex),
    });

    // Keep tooltip label color synced with configured hex
    tooltipInstance.label.adapters.add("fill", () =>
      am5.color(tooltipColorHex),
    );

    // Log building polygon series per group
    DebugLogger.log(
      `[ChartsHandler] [instantiateChart] [Step] ${JSON.stringify({
        action: "Build polygon series per group",
        groups: Array.isArray(datasetRows) ? datasetRows.length : 0,
      })}`,
    );

    // Iterate dataset groups to create colored series
    am5.array.each(datasetRows, (group) => {
      // Validate configured group color existence
      if (!styleConfig.groupColors || !styleConfig.groupColors[group.name]) {
        // Log error for missing groupColors
        DebugLogger.error(
          `[ChartsHandler] [instantiateChart] [Error] ${JSON.stringify({
            message: `[map] Missing groupColors for "${group.name}"`,
          })}`,
        );

        // Throw error for missing group color
        throw new Error(`[map] Missing groupColors for "${group.name}"`);
      }

      // Collect country ids for inclusion
      const countries = group.data.map((c) => c.id);

      // Create polygon series for the current group
      const polygonSeries = chartInstance.series.push(
        am5map.MapPolygonSeries.new(chartRoot, {
          geoJSON: am5geodata_worldLow,
          include: countries,
          name: group.name,
        }),
      );

      // Attach shared tooltip instance to series
      polygonSeries.set("tooltip", tooltipInstance);

      // Configure polygon template styles and tooltip text
      polygonSeries.mapPolygons.template.setAll({
        tooltipText:
          `[font color='${tooltipColorHex}'][bold]{name}[/][/]\n` +
          `[font color='${tooltipColorHex}']${valuePrefix}{sales}${valueSuffix}[/]`,
        interactive: true,
        fill: am5.color(styleConfig.groupColors[group.name]),
        strokeWidth: 2,
        cursorOverStyle: "pointer",
      });

      // Zoom into polygon on click
      polygonSeries.mapPolygons.template.events.on("click", (ev) => {
        // Resolve data item from click event
        const di = ev?.target?.dataItem;

        // Zoom to polygon when data item is present
        if (di) polygonSeries.zoomToDataItem(di);
      });

      // Reset map view on double click
      chartInstance.seriesContainer.events.on("dblclick", () =>
        chartInstance.goHome(),
      );

      // Set data for current polygon series
      polygonSeries.data.setAll(group.data);
    });

    // Check if legend hint is enabled
    if (styleConfig?.legentHint?.enabled) {
      // Log legend render for map
      DebugLogger.log(
        `[ChartsHandler] [instantiateChart] [Step] ${JSON.stringify({
          action: "Render legend (map)",
        })}`,
      );

      // Build legend items from dataset groups
      const legendItems = datasetRows.map((g) => ({
        name: g.name,
        color: styleConfig.groupColors[g.name],
      }));

      // Render legend using provided options
      this._renderLegend(
        chartInstanceId,
        chartHostElement,
        legendItems,
        styleConfig.legentHint,
      );
    }
  }

  /**
   * Render a donut (pie) chart.
   *
   * Builds a PieChart with inner radius, configures a PieSeries with styled tooltips and per-slice colors, and optionally renders a legend.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#_renderDonut
   *
   * @param {Object} params - Donut rendering context.
   * @param {string} params.chartInstanceId - Unique ID for the chart instance.
   * @param {HTMLElement} params.chartHostElement - DOM element that hosts the chart.
   * @param {any} params.chartRoot - amCharts root instance used to construct chart elements.
   * @param {Object} params.styleConfig - Styling configuration including tooltip and legend options.
   * @param {Object} params.fieldConfig - Field configuration with `category` and `total` keys.
   * @param {Array} params.datasetRows - Data items for the donut series.
   *
   * @returns {void} No return value.
   */
  _renderDonut({
    chartInstanceId,
    chartHostElement,
    chartRoot,
    styleConfig,
    fieldConfig,
    datasetRows,
  }) {
    // Create donut chart instance
    const chartInstance = chartRoot.container.children.push(
      am5percent.PieChart.new(chartRoot, {
        layout: chartRoot.verticalLayout,
        innerRadius: am5.percent(70),
      }),
    );

    // Create pie series instance
    const seriesInstance = chartInstance.series.push(
      am5percent.PieSeries.new(chartRoot, {
        name: "Series",
        categoryField: fieldConfig.category,
        valueField: fieldConfig.total,
        alignLabels: false,
        legendValueText: "",
      }),
    );

    // Resolve tooltip color hex
    const tooltipColorHex = styleConfig.tooltip?.color || "#344054";

    // Create tooltip instance
    const tooltipInstance = am5.Tooltip.new(chartRoot, {});

    // Disable fill inheritance from sprite
    tooltipInstance.set("getFillFromSprite", false);

    // Configure tooltip background styles
    tooltipInstance.get("background").setAll({
      fill: am5.color(0xffffff),
      stroke: am5.color(0xe2e2e2),
      strokeWidth: 1,
      cornerRadiusTL: 4,
      cornerRadiusTR: 4,
      cornerRadiusBL: 4,
      cornerRadiusBR: 4,
    });

    // Configure tooltip label styles
    tooltipInstance.label.setAll({
      textType: "bbcode",
      autoTextColor: false,
      fill: am5.color(tooltipColorHex),
    });

    // Keep tooltip label color in sync
    tooltipInstance.label.adapters.add("fill", () =>
      am5.color(tooltipColorHex),
    );

    // Attach tooltip to series
    seriesInstance.set("tooltip", tooltipInstance);

    // Add adapter to compute slice fill dynamically
    seriesInstance.slices.template.adapters.add("fill", (fill, target) => {
      // Resolve data item from target
      const di = target?.dataItem;

      // Return prior fill when no data item
      if (!di) return fill;

      // Resolve category label for slice
      const label =
        di.get("category") || di.dataContext?.[fieldConfig.category];

      // Compute series key from label mapping or normalized label
      const seriesKey =
        styleConfig.categoryKeyMap?.[label] ||
        String(label || "")
          .toLowerCase()
          .replace(/\s+/g, "");

      // Resolve hex color from series styles
      const hex = styleConfig.seriesStyles?.[seriesKey]?.color;

      // Throw when series color is missing
      if (!hex) {
        // Throw error for missing seriesStyles color
        throw new Error(
          `[donut] Missing seriesStyles color for key "${seriesKey}" (from label "${label}")`,
        );
      }

      // Return resolved fill color
      return am5.color(hex);
    });

    // Add adapter to compute slice stroke dynamically
    seriesInstance.slices.template.adapters.add("stroke", (stroke, target) => {
      // Resolve data item from target
      const di = target?.dataItem;

      // Return prior stroke when no data item
      if (!di) return stroke;

      // Resolve category label for slice
      const label =
        di.get("category") || di.dataContext?.[fieldConfig.category];

      // Compute series key from label mapping or normalized label
      const seriesKey =
        styleConfig.categoryKeyMap?.[label] ||
        String(label || "")
          .toLowerCase()
          .replace(/\s+/g, "");

      // Resolve hex color from series styles
      const hex = styleConfig.seriesStyles?.[seriesKey]?.color;

      // Throw when series color is missing
      if (!hex) {
        // Throw error for missing seriesStyles color
        throw new Error(
          `[donut] Missing seriesStyles color for key "${seriesKey}" (from label "${label}")`,
        );
      }

      // Return resolved stroke color
      return am5.color(hex);
    });

    // Hide series data labels
    seriesInstance.labels.template.set("forceHidden", true);

    // Hide series tick lines
    seriesInstance.ticks.template.set("forceHidden", true);

    // Set series data rows
    seriesInstance.data.setAll(datasetRows);

    // Animate initial appearance
    seriesInstance.appear(1000, 100);

    // Check if legend hint is enabled
    if (styleConfig?.legentHint?.enabled) {
      // Build legend items from dataset
      const legendItems = datasetRows.map((r) => {
        // Compute series key from category value
        const seriesKey =
          styleConfig.categoryKeyMap?.[r[fieldConfig.category]] ||
          String(r[fieldConfig.category] || "")
            .toLowerCase()
            .replace(/\s+/g, "");

        // Return legend item object
        return {
          name: r[fieldConfig.category],
          color: styleConfig.seriesStyles?.[seriesKey]?.color,
        };
      });

      // Render the legend using provided options
      this._renderLegend(
        chartInstanceId,
        chartHostElement,
        legendItems,
        styleConfig.legentHint,
      );
    }
  }

  /**
   * Render a column chart with icons.
   *
   * Constructs an XY column chart where each category displays an icon, applies styling, custom tooltips, and an optional legend.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#_renderColumnWithIcons
   *
   * @param {Object} params - Rendering context for the column-with-icons chart.
   * @param {string} params.chartInstanceId - Unique ID for the chart instance.
   * @param {HTMLElement} params.chartHostElement - Host element that contains the chart.
   * @param {any} params.chartRoot - amCharts root used to create chart components.
   * @param {Object} params.styleConfig - Style and behavior configuration (colors, bar width, legend).
   * @param {Object} params.fieldConfig - Field configuration including `category` and `total` keys.
   * @param {Array} params.datasetRows - Data rows for the series; each item may include an `icon` URL and `country`.
   *
   * @returns {void} No return value.
   */
  _renderColumnWithIcons({
    chartInstanceId,
    chartHostElement,
    chartRoot,
    styleConfig,
    fieldConfig,
    datasetRows,
  }) {
    // Create XY chart instance with padding and layout
    const chartInstance = chartRoot.container.children.push(
      am5xy.XYChart.new(chartRoot, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        paddingLeft: 0,
        paddingBottom: 60,
        layout: chartRoot.verticalLayout,
      }),
    );

    // Validate presence of color map in style config
    if (!styleConfig.color) {
      // Log missing color map error
      DebugLogger.error(
        `[ChartsHandler] [instantiateChart] [Error] ${JSON.stringify({
          message: "[visits] Missing color map",
        })}`,
      );

      // Throw error when color map is missing
      throw new Error("[visits] Missing color map");
    }

    // Map dataset rows to include color-driven properties
    const dataWithColors = datasetRows.map((item) => {
      // Derive normalized country key
      const key = (item?.country ? String(item.country) : "").toLowerCase();

      // Resolve hex color from color map
      const hex = styleConfig.color[key];

      // Validate that a color exists for the key
      if (!hex) {
        // Log missing color for country key
        DebugLogger.error(
          `[ChartsHandler] [instantiateChart] [Error] ${JSON.stringify({
            message: `[visits] Missing color for "${key}"`,
          })}`,
        );

        // Throw error for missing color mapping
        throw new Error(`[visits] Missing color for "${key}"`);
      }

      // Return enriched data row with color assignments
      return { ...item, fill: hex, stroke: hex, columnSettings: { fill: hex } };
    });

    // Create X axis renderer with spacing options
    const xRenderer = am5xy.AxisRendererX.new(chartRoot, {
      minGridDistance: 30,
      minorGridEnabled: true,
    });

    // Create and push category X axis with icon bullets
    const xAxis = chartInstance.xAxes.push(
      am5xy.CategoryAxis.new(chartRoot, {
        categoryField: fieldConfig.category,
        renderer: xRenderer,
        bullet: function (root, axis, dataItem) {
          // Compute responsive icon size based on chart width
          const chartWidth = root.container.width();

          // Clamp icon size between 20 and 40
          const iconSize = Math.max(20, Math.min(40, chartWidth / 40));

          // Return axis bullet with country icon sprite
          return am5xy.AxisBullet.new(root, {
            location: 0.5,
            sprite: am5.Picture.new(root, {
              width: iconSize,
              height: iconSize,
              centerY: am5.p50,
              centerX: am5.p50,
              y: 30,
              src: dataItem.dataContext.icon,
            }),
          });
        },
      }),
    );

    // Hide X grid lines
    xRenderer.grid.template.setAll({ location: 1, visible: false });

    // Hide X minor grid lines
    xRenderer.minorGrid?.template.setAll({ visible: false });

    // Adjust and hide X labels to make room for icons
    xRenderer.labels.template.setAll({ paddingTop: 50, forceHidden: true });

    // Resolve value field with fallback
    const valueField = fieldConfig.total || "total";

    // Filter out zero values to declutter chart
    const filteredData = dataWithColors.filter(
      (d) => Number(d[valueField] || 0) !== 0,
    );

    // Bind filtered data to X axis
    xAxis.data.setAll(filteredData);

    // Create Y axis with subtle renderer styles
    const yAxis = chartInstance.yAxes.push(
      am5xy.ValueAxis.new(chartRoot, {
        renderer: am5xy.AxisRendererY.new(chartRoot, { strokeOpacity: 0.1 }),
      }),
    );

    // Hide Y grid lines
    yAxis.get("renderer").grid.template.setAll({ visible: false });

    // Hide Y axis stroke
    yAxis.get("renderer").setAll({ strokeOpacity: 0 });

    // Create column series bound to axes and fields
    const seriesInstance = chartInstance.series.push(
      am5xy.ColumnSeries.new(chartRoot, {
        xAxis,
        yAxis,
        valueYField: fieldConfig.total,
        categoryXField: fieldConfig.category,
      }),
    );

    // Apply configured bar width percent when provided
    if (styleConfig.bar?.widthPercent != null) {
      // Set column stroke opacity and width percentage
      seriesInstance.columns.template.setAll({
        strokeOpacity: 0,
        width: am5.percent(styleConfig.bar.widthPercent),
      });
    }

    // Adapt column fill color from data context
    seriesInstance.columns.template.adapters.add("fill", (fill, target) => {
      // Read data item from column target
      const di = target?.dataItem;

      // Read data context or default to empty object
      const dc = di?.dataContext || {};

      // Return data-driven fill or fallback to prior fill
      return dc.fill ? am5.color(dc.fill) : fill;
    });

    // Adapt column stroke color from data context
    seriesInstance.columns.template.adapters.add("stroke", (stroke, target) => {
      // Read data item from column target
      const di = target?.dataItem;

      // Read data context or default to empty object
      const dc = di?.dataContext || {};

      // Return data-driven stroke or fallback to prior stroke
      return dc.stroke ? am5.color(dc.stroke) : stroke;
    });

    // Bind filtered data rows to series
    seriesInstance.data.setAll(filteredData);

    // Build tooltip using shared factory
    const tooltipInstance = this.buildTooltip(chartRoot);

    // Hide default label to use custom container
    tooltipInstance.label.setAll({ forceHidden: true });

    // Create horizontal container for custom tooltip content
    const tooltipContent = am5.Container.new(chartRoot, {
      layout: chartRoot.horizontalLayout,
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
      centerY: am5.p50,
    });

    // Create picture element for tooltip flag/icon
    const tooltipImage = am5.Picture.new(chartRoot, {
      width: 28,
      height: 28,
      centerY: am5.p50,
      marginRight: 10,
      visible: true,
    });

    // Create label element for tooltip text
    const tooltipText = am5.Label.new(chartRoot, {
      textType: "bbcode",
      fontFamily: "Poppins, sans-serif",
      fontSize: "0.75rem",
      fill: am5.color(0x344054),
      textAlign: "left",
      centerY: am5.p50,
    });

    // Append image and label to tooltip content container
    tooltipContent.children.pushAll([tooltipImage, tooltipText]);

    // Append content container into tooltip
    tooltipInstance.children.push(tooltipContent);

    // Generate tooltip text and visuals from series data
    tooltipInstance.label.adapters.add("text", (_t, _l) => {
      // Read the current tooltip data item from series
      const dataItem = seriesInstance.get("tooltipDataItem");

      // Return empty string when no data item
      if (!dataItem) return "";

      // Resolve data context or default to empty object
      const ctx = dataItem.dataContext || {};

      // Resolve country/category label
      const country = dataItem.get("categoryX") || "";

      // Resolve numeric visits value
      const visits = dataItem.get("valueY") || 0;

      // Resolve column color from context or template
      const col = ctx.fill || seriesInstance.columns.template.get("fill");

      // Normalize color to CSS hex string
      const hex = this.normalizeColorHex(col);

      // Update image sprite visibility and source
      if (ctx.icon) tooltipImage.setAll({ src: ctx.icon, visible: true });

      // Hide image sprite when icon is not available
      else tooltipImage.setAll({ visible: false });

      // Set tooltip bbcode text content
      tooltipText.set(
        "text",
        `[font color='#667085'][bold]${country}[/]\n[${hex} width:12px height:12px]●[/] [fontWeight:normal width:120px]Visits:[/] [bold width:0px] ${visits}[/]`,
      );

      // Return empty string to suppress default text
      return "";
    });

    // Position tooltip to follow the pointer
    chartInstance.plotContainer.set("tooltipPosition", "pointer");

    // Set placeholder text to trigger custom tooltip rendering
    chartInstance.plotContainer.set("tooltipText", "a");

    // Attach custom tooltip instance to plot container
    chartInstance.plotContainer.set("tooltip", tooltipInstance);

    // Enable chart cursor for interactivity
    this.enableChartCursor(chartInstance, chartRoot);

    // Animate series appearance
    seriesInstance.appear();

    // Animate chart appearance with delay
    chartInstance.appear(1000, 100);

    // Check if legend hint should be rendered
    if (styleConfig?.legentHint?.enabled) {
      // Log legend render action for column-with-icons
      DebugLogger.log(
        `[ChartsHandler] [instantiateChart] [Step] ${JSON.stringify({
          action: "Render legend (column-with-icons)",
        })}`,
      );

      // Build legend items from filtered data
      const legendItems = filteredData.map((d) => ({
        name: d[fieldConfig.category],
        color: this.normalizeColorHex(d.fill),
      }));

      // Render legend UI into host container
      this._renderLegend(
        chartInstanceId,
        chartHostElement,
        legendItems,
        styleConfig.legentHint,
      );
    }
  }

  /**
   * Render an XY (bar/line/line-shadow) chart.
   *
   * Creates an XY chart with axes, optional auto-ranging, series construction, aggregated tooltip, and optional legend.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#_renderXY
   *
   * @param {Object} params - Rendering context for the XY chart.
   * @param {string} params.chartInstanceId - Unique ID for the chart instance.
   * @param {HTMLElement} params.chartHostElement - DOM element that hosts the chart.
   * @param {any} params.chartRoot - amCharts root instance used to construct chart elements.
   * @param {Object} params.styleConfig - Style and behavior configuration including axes, tooltips, legend, and stacking.
   * @param {Object} params.fieldConfig - Field configuration containing `category` and optionally `total`.
   * @param {Array} params.datasetRows - Data rows used to populate the axes and series.
   * @param {"bar"|"line"|"line-shadow"} params.chartType - The specific XY visualisation to render.
   * @param {string[]} params.seriesBreakdownKeys - Optional series keys to create multiple series.
   *
   * @returns {void} No return value.
   */
  _renderXY({
    chartInstanceId,
    chartHostElement,
    chartRoot,
    styleConfig,
    fieldConfig,
    datasetRows,
    chartType,
    seriesBreakdownKeys,
  }) {
    // Create base XY chart instance
    const chartInstance = this._createXYChart(chartRoot, styleConfig);

    // Create X and Y axes from helpers
    const { xAxis, yAxis } = this._createAxes(
      chartInstance,
      chartRoot,
      fieldConfig,
      styleConfig,
    );

    // Check if auto range configuration is enabled
    if (
      styleConfig.yAxis?.autoMax ||
      styleConfig.yAxis?.autoMaxBuffer != null
    ) {
      // Log Y auto range computation step
      DebugLogger.log(
        `[ChartsHandler] [instantiateChart] [Step] ${JSON.stringify({
          action: "Compute Y auto range",
        })}`,
      );

      // Resolve series keys to inspect for auto range
      const keys = seriesBreakdownKeys.length
        ? seriesBreakdownKeys
        : [fieldConfig.total];

      // Initialize tracking of min and max values
      let maxVal = 0,
        minVal = 0;

      // Handle stacked mode by summing row values
      if (styleConfig.stacked) {
        // Iterate dataset rows to compute stacked totals
        datasetRows.forEach((r) => {
          // Sum values for configured keys
          const sum = keys.reduce((s, k) => s + Number(r[k] || 0), 0);

          // Track maximum stacked value
          maxVal = Math.max(maxVal, sum);

          // Track minimum stacked value
          minVal = Math.min(minVal, sum);
        });

        // Handle non stacked mode by inspecting each key value
      } else {
        // Iterate dataset rows for individual key values
        datasetRows.forEach((r) => {
          // Iterate keys to compute extrema
          keys.forEach((k) => {
            // Read numeric value with fallback
            const v = Number(r[k] || 0);

            // Track maximum value
            maxVal = Math.max(maxVal, v);

            // Track minimum value
            minVal = Math.min(minVal, v);
          });
        });
      }

      // Resolve auto range buffer fraction
      const buffer = styleConfig.yAxis?.autoMaxBuffer ?? 0.12;

      // Compute buffered ceiling for max
      const calculatedMax = Math.ceil(maxVal * (1 + buffer));

      // Compute buffered floor for min
      const calculatedMin = Math.floor(minVal * (1 + buffer));

      // Apply strict min/max when negative values exist
      if (minVal < 0) {
        // Set Y axis min and max with strict bounds
        yAxis.setAll({
          max: calculatedMax,
          min: calculatedMin,
          strictMinMax: true,
        });

        // Apply only strict max when all values are non negative
      } else {
        // Set Y axis max with strict bound
        yAxis.setAll({ max: calculatedMax, strictMinMax: true });
      }
    }

    // Log assignment of X axis data
    DebugLogger.log(
      `[ChartsHandler] [instantiateChart] [Step] ${JSON.stringify({
        action: "Assign xAxis data",
        rows: Array.isArray(datasetRows) ? datasetRows.length : 0,
      })}`,
    );

    // Bind dataset rows to X axis
    xAxis.data.setAll(datasetRows);

    // Validate presence of seriesStyles color map
    if (!styleConfig.seriesStyles) {
      // Log missing seriesStyles error
      DebugLogger.error(
        `[ChartsHandler] [instantiateChart] [Error] ${JSON.stringify({
          message: "[xy] Missing HTML seriesStyles",
        })}`,
      );

      // Throw error when seriesStyles are missing
      throw new Error("[xy] Missing HTML seriesStyles");
    }

    // Initialize color map for series keys
    const colorMapByKey = {};

    // Resolve series creation order from breakdown keys
    const order = seriesBreakdownKeys.length
      ? seriesBreakdownKeys
      : [fieldConfig.total];

    // Build color map by inspecting configured styles
    order.forEach((key) => {
      // Resolve hex color from style config
      const hex = styleConfig.seriesStyles?.[key]?.color;

      // Validate presence of color for key
      if (!hex) {
        // Log missing color error for key
        DebugLogger.error(
          `[ChartsHandler] [instantiateChart] [Error] ${JSON.stringify({
            message: `[xy] Missing seriesStyles color for "${key}"`,
          })}`,
        );

        // Throw error for missing color mapping
        throw new Error(`[xy] Missing seriesStyles color for "${key}"`);
      }

      // Store parsed color in map for the key
      colorMapByKey[key] = am5.color(hex);
    });

    // Log series creation parameters
    DebugLogger.log(
      `[ChartsHandler] [instantiateChart] [Step] ${JSON.stringify({
        action: "Create series",
        type: chartType,
        seriesCount: order.length,
      })}`,
    );

    // Initialize list to hold created series
    let seriesList = [];

    // Check chart type for bar series creation
    if (chartType === "bar") {
      // Map over keys to create column series
      seriesList = order.map((key) => {
        // Create column series for the key
        const seriesInstance = this._createColumnSeries(
          chartInstance,
          chartRoot,
          key,
          styleConfig,
          fieldConfig,
          xAxis,
          yAxis,
          colorMapByKey[key],
        );

        // Bind dataset rows to the series
        seriesInstance.data.setAll(datasetRows);

        // Animate series appearance
        seriesInstance.appear();

        // Return the created series instance
        return seriesInstance;
      });

      // Handle line and shadow line series creation
    } else {
      // Determine whether shadow area is enabled
      const isShadow = chartType === "line-shadow";

      // Map over keys to create line series
      seriesList = order.map((key) => {
        // Create line series for the key
        const seriesInstance = this._createLineSeries(
          chartInstance,
          chartRoot,
          key,
          styleConfig,
          fieldConfig,
          xAxis,
          yAxis,
          isShadow,
          colorMapByKey[key],
        );

        // Bind dataset rows to the series
        seriesInstance.data.setAll(datasetRows);

        // Animate series appearance
        seriesInstance.appear();

        // Return the created series instance
        return seriesInstance;
      });
    }

    // Resolve aggregated tooltip configuration
    const aggregatedTooltipConfig = styleConfig.tooltip?.aggregated;

    // Check if aggregated tooltip in codepen mode is enabled
    if (
      aggregatedTooltipConfig?.enabled &&
      aggregatedTooltipConfig.mode === "codepen" &&
      seriesList.length
    ) {
      // Log aggregated tooltip configuration step
      DebugLogger.log(
        `[ChartsHandler] [instantiateChart] [Step] ${JSON.stringify({
          action: "Configure aggregated tooltip",
        })}`,
      );

      // Create tooltip instance with background
      const tooltipInstance = am5.Tooltip.new(chartRoot, {
        background: am5.RoundedRectangle.new(chartRoot, {
          fill: am5.color(0xffffff),
          shadowColor: am5.color(0xe2e2e2),
          shadowBlur: 8,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        }),
      });

      // Apply corner radius to tooltip background
      tooltipInstance.get("background").setAll({
        cornerRadiusTL: 2,
        cornerRadiusTR: 2,
        cornerRadiusBL: 2,
        cornerRadiusBR: 2,
      });

      // Apply label styles for aggregated tooltip
      tooltipInstance.label.setAll({
        textType: "bbcode",
        fontFamily: aggregatedTooltipConfig.fontFamily || "Poppins, sans-serif",
        fontSize: "0.75rem",
        fill: am5.color(0x344054),
        textAlign: "left",
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
        paddingBottom: 0,
      });

      // Set plot container tooltip to follow pointer
      chartInstance.plotContainer.set("tooltipPosition", "pointer");

      // Set placeholder text to drive custom adapter
      chartInstance.plotContainer.set("tooltipText", "a");

      // Attach aggregated tooltip to plot container
      chartInstance.plotContainer.set("tooltip", tooltipInstance);

      // Define month name map for header
      const monthMap = {
        Jan: "JANUARY",
        Feb: "FEBRUARY",
        Mar: "MARCH",
        Apr: "APRIL",
        May: "MAY",
        Jun: "JUNE",
        Jul: "JULY",
        Aug: "AUGUST",
        Sep: "SEPTEMBER",
        Oct: "OCTOBER",
        Nov: "NOVEMBER",
        Dec: "DECEMBER",
      };

      // Build tooltip content using text adapter
      tooltipInstance.label.adapters.add("text", (_t, _l) => {
        // Initialize total accumulator
        let total = 0,
          xLabel = "",
          year = "";

        // Initialize lines array for series rows
        const lines = [];

        // Iterate all series to build rows
        seriesList.forEach((series, i) => {
          // Get the current tooltip data item for series
          const di = series.get("tooltipDataItem");

          // Return early when series has no data item
          if (!di) return;

          // Read numeric value for the row
          const v = Number(di.get("valueY") || 0);

          // Accumulate total across series
          total += v;

          // Resolve header values from first series
          if (i === 0) {
            // Resolve X category label
            xLabel = di.get("categoryX") || "";

            // Resolve year from data context when available
            const ctx = di.dataContext || {};

            // Convert year to string if present
            year = ctx.year != null ? String(ctx.year) : "";
          }

          // Resolve series color from columns or fills
          const col =
            series.columns?.template?.get?.("fill") ||
            series.get("fill") ||
            series.get("stroke");

          // Normalize color to CSS hex string
          const hex = this.normalizeColorHex(col);

          // Push formatted row line into array
          lines.push(
            `[${hex} width:8px height:8px]●[/] [fontWeight:normal width:120px]${series.get(
              "name",
            )}:[/] [bold width:0px] ${
              aggregatedTooltipConfig.valuePrefix || ""
            }${v}${aggregatedTooltipConfig.valueSuffix || ""}[/]`,
          );
        });

        // Build header line with month and year
        const header = `[font color='#667085'][bold]${
          monthMap[xLabel] || xLabel
        }${year ? " " + year : ""}[/]`;

        // Build separator line
        const sep = `\n[font color='#D0D5DD']───────────────────────[/font]\n`;

        // Build tail line with total value
        const tail = `[fontWeight:normal width:130px][font color='#667085']${
          aggregatedTooltipConfig.totalLabel || "Total Earnings:"
        }[/font][/] [bold width:0px] ${
          aggregatedTooltipConfig.valuePrefix || ""
        }${total}${aggregatedTooltipConfig.valueSuffix || ""}[/]`;

        // Return the composed tooltip bbcode string
        return `${header}\n\n${lines.join("\n\n")}${sep}${tail}`;
      });

      // Create cursor for aggregated tooltip interaction
      const cursor = chartInstance.set(
        "cursor",
        am5xy.XYCursor.new(chartRoot, { behavior: "none" }),
      );

      // Hide Y cursor line for cleaner view
      cursor.lineY.set("visible", false);

      // Hide X cursor line for cleaner view
      cursor.lineX.set("visible", false);
    }

    // Check if legend hint should be rendered
    if (styleConfig.legentHint?.enabled) {
      // Log legend render action for XY chart
      DebugLogger.log(
        `[ChartsHandler] [instantiateChart] [Step] ${JSON.stringify({
          action: "Render legend (xy)",
        })}`,
      );

      // Build legend items from order and styles
      const legendItems = (
        seriesBreakdownKeys.length ? seriesBreakdownKeys : [fieldConfig.total]
      ).map((k) => ({
        name: styleConfig.seriesLabels?.[k] || k,
        color: this.normalizeColorHex(colorMapByKey[k]),
      }));

      // Render legend UI into host container
      this._renderLegend(
        chartInstanceId,
        chartHostElement,
        legendItems,
        styleConfig.legentHint,
      );
    }
  }

  /**
   * --------------------------------
   * SECTION: LEGEND
   * --------------------------------
   */

  /**
   * Render a legend for a chart instance.
   *
   * Builds a flexible HTML legend next to the chart host, replacing any existing legend for the same chart.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#_renderLegend
   *
   * @param {string} chartInstanceId - Unique identifier of the chart this legend belongs to.
   * @param {HTMLElement} chartHostElement - The chart host (or its parent) where the legend will be attached.
   * @param {Array} [legendItems=[]] - Array of items with `name` and `color` used to render markers and labels.
   * @param {Object} [legendConfig={}] - Optional classes and layout overrides for container, item, marker, and label.
   *
   * @returns {HTMLElement|null} The created legend container element, or null if not rendered.
   */
  _renderLegend(
    chartInstanceId,
    chartHostElement,
    legendItems = [],
    legendConfig = {},
  ) {
    // Log start of legend render
    DebugLogger.log(
      `[ChartsHandler] [_renderLegend] [Start] ${JSON.stringify({
        chartInstanceId,
        hasHost: !!chartHostElement,
        itemsCount: Array.isArray(legendItems) ? legendItems.length : 0,
      })}`,
    );

    // Begin guarded legend render block
    try {
      // Validate host and legend items input
      if (
        !chartHostElement ||
        !Array.isArray(legendItems) ||
        legendItems.length === 0
      ) {
        // Warn and end when host or items are missing
        DebugLogger.warn(
          `[ChartsHandler] [_renderLegend] [End] ${JSON.stringify({
            success: false,
            reason: !chartHostElement ? "no-host" : "no-items",
          })}`,
        );

        // Return null when inputs are invalid
        return null;
      }

      // Begin optional table logging block
      try {
        // Output legend items as a table for debugging
        DebugLogger.table(legendItems);

        // Handle non-critical DebugLogger.table issues
      } catch (e) {}

      // Resolve parent element for legend placement
      const parentElement = chartHostElement.parentElement || chartHostElement;

      // Query for existing legend associated with this chart id
      const existingLegend = parentElement.querySelector(
        `[data-legend-for="${chartInstanceId}"]`,
      );

      // Log removal step for previous legend
      DebugLogger.log(
        `[ChartsHandler] [_renderLegend] [Step] ${JSON.stringify({
          action: "Remove existing legend if present",
          hasExisting: !!existingLegend,
        })}`,
      );

      // Remove the existing legend element when present
      if (existingLegend?.remove) existingLegend.remove();

      // Log creation of legend container
      DebugLogger.log(
        `[ChartsHandler] [_renderLegend] [Step] ${JSON.stringify({
          action: "Create legend container",
          legendConfig,
        })}`,
      );

      // Create container element for the legend
      const legendContainer = document.createElement("div");

      // Tag legend container with chart id
      legendContainer.setAttribute("data-legend-for", chartInstanceId);

      // Apply container class names
      legendContainer.className =
        legendConfig.class || "flex flex-wrap justify-center gap-2 mt-3";

      // Log building of legend items
      DebugLogger.log(
        `[ChartsHandler] [_renderLegend] [Step] ${JSON.stringify({
          action: "Build legend items",
          count: legendItems.length,
        })}`,
      );

      // Iterate over legend items to create DOM nodes
      for (const legendItem of legendItems) {
        // Resolve legend item display name
        const legendName = legendItem?.name ? String(legendItem.name) : "";

        // Normalize legend color to CSS hex
        const legendColor = this.normalizeColorHex(legendItem?.color || "#999");

        // Log creation of a legend item
        DebugLogger.log(
          `[ChartsHandler] [_renderLegend] [Step] ${JSON.stringify({
            action: "Create legend item",
            legendName,
            legendColor,
          })}`,
        );

        // Create wrapper element for the legend item
        const legendItemElement = document.createElement("div");

        // Apply wrapper class names
        legendItemElement.className =
          legendConfig.itemClass ||
          "inline-flex items-center gap-2 rounded-xl px-3 py-1 text-sm bg-white shadow-sm ring-1 ring-gray-200";

        // Create marker element for color swatch
        const legendMarkerElement = document.createElement("span");

        // Apply marker class names
        legendMarkerElement.className =
          legendConfig.markerClass || "w-3 h-3 rounded-full";

        // Apply marker background color
        legendMarkerElement.style.backgroundColor = legendColor;

        // Create label element for legend text
        const legendLabelElement = document.createElement("span");

        // Apply label class names
        legendLabelElement.className =
          legendConfig.labelClass || "text-gray-700";

        // Set label text content
        legendLabelElement.textContent = legendName;

        // Append marker into the legend item wrapper
        legendItemElement.appendChild(legendMarkerElement);

        // Append label into the legend item wrapper
        legendItemElement.appendChild(legendLabelElement);

        // Append completed item into the legend container
        legendContainer.appendChild(legendItemElement);
      }

      // Log append step for legend container
      DebugLogger.log(
        `[ChartsHandler] [_renderLegend] [Step] ${JSON.stringify({
          action: "Append legend to parent",
        })}`,
      );

      // Append legend container to parent element
      parentElement.appendChild(legendContainer);

      // Log successful legend render end
      DebugLogger.log(
        `[ChartsHandler] [_renderLegend] [End] ${JSON.stringify({
          success: true,
          chartInstanceId,
        })}`,
      );

      // Return the legend container element
      return legendContainer;

      // Handle unexpected errors in the request handler
    } catch (error) {
      // Catch and log the error
      DebugLogger.error(
        `[ChartsHandler] [_renderLegend] [Error] ${JSON.stringify({
          message: error.message,
          name: error.name,
          stack: error.stack,
          context: { chartInstanceId },
        })}`,
      );

      // Warn end with failure
      DebugLogger.warn(
        `[ChartsHandler] [_renderLegend] [End] ${JSON.stringify({
          success: false,
        })}`,
      );

      // Throw error to caller
      throw error;
    }
  }

  /**
   * Remove a legend element by its chart instance ID.
   *
   * Finds and removes a legend in the DOM associated with the given chart instance.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#_removeLegendById
   *
   * @param {string} chartInstanceId - The unique chart instance ID whose legend should be removed.
   *
   * @returns {void} No return value.
   */
  _removeLegendById(chartInstanceId) {
    // Return early when chartInstanceId is missing
    if (!chartInstanceId) return;

    // Query DOM for legend element by chartInstanceId
    const legend = document.querySelector(
      `[data-legend-for="${chartInstanceId}"]`,
    );

    // Remove legend element when present
    if (legend?.remove) legend.remove();
  }

  /**
   * --------------------------------
   * SECTION: LISTENERS & EVENTS
   * --------------------------------
   */

  /**
   * Set up chart scope UI event listeners.
   *
   * Attaches change handlers to period/view selectors for each scope to drive chart updates.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#setupEventListeners
   *
   * @returns {void} No return value.
   */
  setupEventListeners() {
    // Log start of event listener setup
    DebugLogger.log(
      `[IMPORTANT] [ChartsHandler] [setupEventListeners] [Start] ${JSON.stringify({})}`,
    );

    // Begin guarded listener setup block
    try {
      // Query all elements that define a scope
      const scopeElements = document.querySelectorAll("[data-scope]");

      // Log scope elements query result
      DebugLogger.log(
        `[ChartsHandler] [setupEventListeners] [Step] ${JSON.stringify({
          action: "Query scope elements",
          count: scopeElements.length,
        })}`,
      );

      // Begin optional debugging table block
      try {
        // Build a table of scope identifiers
        const scopesTable = Array.from(scopeElements).map((el) => ({
          scope: el.getAttribute("data-scope") || "",
        }));

        // Output the scope table to the console
        DebugLogger.table(scopesTable);
      } catch (e) {}

      // Iterate over each scope element
      scopeElements.forEach((scopeElement) => {
        // Read the scope section key from the element
        const scopeSection = scopeElement.getAttribute("data-scope");

        // Log processing of current scope element
        DebugLogger.log(
          `[ChartsHandler] [setupEventListeners] [Step] ${JSON.stringify({
            action: "Process scope element",
            scopeSection,
          })}`,
        );

        // Check if scope section is missing
        if (!scopeSection) {
          // Return early when scopeSection is not available
          return;
        }

        // Query the period select element within scope
        const periodSelectElement = scopeElement.querySelector(
          'select[data-role="period"]',
        );

        // Query the view select element within scope
        const viewSelectElement = scopeElement.querySelector(
          'select[data-role="view"]',
        );

        // Log resolution of select elements
        DebugLogger.log(
          `[ChartsHandler] [setupEventListeners] [Step] ${JSON.stringify({
            action: "Resolve selects",
            hasPeriodSelect: !!periodSelectElement,
            hasViewSelect: !!viewSelectElement,
          })}`,
        );

        // Validate presence of both select elements
        if (!periodSelectElement || !viewSelectElement) {
          // Return early when required selects are missing
          return;
        }

        // Define handler for selection changes
        const handleScopeSelectionChange = () => {
          // Log detection of a selection change
          DebugLogger.log(
            `[ChartsHandler] [setupEventListeners] [Step] ${JSON.stringify({
              action: "Selection change detected",
              scopeSection,
            })}`,
          );

          // Read selected period value
          const selectedPeriod = String(periodSelectElement.value || "").trim();

          // Read selected view value
          const selectedView = String(viewSelectElement.value || "").trim();

          // Log read selection values
          DebugLogger.log(
            `[ChartsHandler] [setupEventListeners] [Step] ${JSON.stringify({
              action: "Read selection values",
              selectedPeriod,
              selectedView,
            })}`,
          );

          // Validate that both selections are provided
          if (!selectedPeriod || !selectedView) {
            // Return early when selection is incomplete
            return;
          }

          // Compose the scope key string
          const scopeKey = `${scopeSection}.${selectedPeriod}.${selectedView}`;

          // Log composed scope key
          DebugLogger.log(
            `[ChartsHandler] [setupEventListeners] [Step] ${JSON.stringify({
              action: "Compose scopeKey",
              scopeKey,
            })}`,
          );

          // Apply the scope selection and handle errors
          this.applyScopeSelection(scopeKey, scopeElement).catch((error) => {
            // Catch and log the error
            DebugLogger.error(
              `[ChartsHandler] [setupEventListeners] [Error] ${JSON.stringify({
                message: error.message,
                name: error.name,
                stack: error.stack,
                context: {
                  scopeKey,
                  scopeSection,
                  selectedPeriod,
                  selectedView,
                },
              })}`,
            );
          });
        };

        // Log attachment of change listeners
        DebugLogger.log(
          `[ChartsHandler] [setupEventListeners] [Step] ${JSON.stringify({
            action: "Attach change listeners",
            scopeSection,
          })}`,
        );

        // Attach change event listener to the period select
        periodSelectElement.addEventListener(
          "change",
          handleScopeSelectionChange,
        );

        // Attach change event listener to the view select
        viewSelectElement.addEventListener(
          "change",
          handleScopeSelectionChange,
        );
      });

      // Log successful end of event listener setup
      DebugLogger.log(
        `[ChartsHandler] [setupEventListeners] [End] ${JSON.stringify({
          success: true,
        })}`,
      );
    } catch (error) {
      // Catch and log the error
      DebugLogger.error(
        `[ChartsHandler] [setupEventListeners] [Error] ${JSON.stringify({
          message: error.message,
          name: error.name,
          stack: error.stack,
        })}`,
      );

      // Warn end with failure
      DebugLogger.warn(
        `[ChartsHandler] [setupEventListeners] [End] ${JSON.stringify({
          success: false,
        })}`,
      );

      // Throw error to caller
      throw error;
    }
  }

  /**
   * Wire global chart-related events and readiness bridge.
   *
   * Attaches a one-time bridge initialization, sets a global readiness flag, and listens for `charts:render-default` events to trigger default chart rendering.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#wireGlobalChartEvents
   *
   * @returns {void} No return value.
   */
  wireGlobalChartEvents() {
    // Log start of wiring global events
    DebugLogger.log(
      `[IMPORTANT] [ChartsHandler] [wireGlobalChartEvents] [Start] ${JSON.stringify({
        alreadyAttached: !!this._bridgeAttached,
      })}`,
    );

    // Begin guarded wiring block
    try {
      // Check if the bridge is already attached
      if (this._bridgeAttached) {
        // Log idempotent end due to already attached bridge
        DebugLogger.log(
          `[ChartsHandler] [wireGlobalChartEvents] [End] ${JSON.stringify({
            success: true,
            note: "idempotent-return",
          })}`,
        );

        // Return early for idempotent behavior
        return;
      }

      // Mark bridge as attached to prevent duplicates
      this._bridgeAttached = true;

      // Log setting of global readiness flag
      DebugLogger.log(
        `[ChartsHandler] [wireGlobalChartEvents] [Step] ${JSON.stringify({
          action: "Bridge attached; set global readiness flag",
        })}`,
      );

      // Set global readiness flag on window
      window.__chartsBridgeReady = true;

      // Log dispatch of bridgeReady event
      DebugLogger.log(
        `[ChartsHandler] [wireGlobalChartEvents] [Step] ${JSON.stringify({
          action: "Dispatch bridgeReady event",
        })}`,
      );

      // Dispatch the bridge ready custom event
      window.dispatchEvent(new Event("ChartsHandler:bridgeReady"));

      // Log attachment of charts:render-default listener
      DebugLogger.log(
        `[ChartsHandler] [wireGlobalChartEvents] [Step] ${JSON.stringify({
          action: "Attach listener",
          event: "charts:render-default",
        })}`,
      );

      // Attach global listener for rendering default charts
      window.addEventListener("charts:render-default", async (event) => {
        // Log event reception with detail payload
        DebugLogger.log(
          `[ChartsHandler] [wireGlobalChartEvents] [Event] ${JSON.stringify({
            name: "charts:render-default",
            detail: event?.detail || null,
          })}`,
        );

        // Extract scopeSection from event detail
        const scopeSection = event?.detail?.section;

        // Validate presence of scopeSection
        if (!scopeSection) {
          // Log error for missing section in event detail
          DebugLogger.error(
            `[ChartsHandler] [wireGlobalChartEvents] [Error] ${JSON.stringify({
              message: "charts:render-default missing detail.section",
            })}`,
          );

          // Return early when section is missing
          return;
        }

        // Begin guarded default render block
        try {
          // Log intent to render section default chart
          DebugLogger.log(
            `[ChartsHandler] [wireGlobalChartEvents] [Step] ${JSON.stringify({
              action: "Render section default chart",
              scopeSection,
            })}`,
          );

          // Render the default chart for the provided section
          await this.renderSectionDefaultChart(scopeSection);

          // Log successful default render
          DebugLogger.log(
            `[ChartsHandler] [wireGlobalChartEvents] [Step] ${JSON.stringify({
              action: "Default rendered",
              scopeSection,
            })}`,
          );

          // Catch and log the error
        } catch (error) {
          // Catch and log the error
          DebugLogger.error(
            `[ChartsHandler] [wireGlobalChartEvents] [Error] ${JSON.stringify({
              message: error.message,
              name: error.name,
              stack: error.stack,
              context: { scopeSection },
            })}`,
          );
        }
      });

      // Log successful end of wiring global events
      DebugLogger.log(
        `[ChartsHandler] [wireGlobalChartEvents] [End] ${JSON.stringify({
          success: true,
        })}`,
      );

      // Handle unexpected errors in the request handler
    } catch (error) {
      // Catch and log the error
      DebugLogger.error(
        `[ChartsHandler] [wireGlobalChartEvents] [Error] ${JSON.stringify({
          message: error.message,
          name: error.name,
          stack: error.stack,
        })}`,
      );

      // Warn end with failure
      DebugLogger.warn(
        `[ChartsHandler] [wireGlobalChartEvents] [End] ${JSON.stringify({
          success: false,
        })}`,
      );

      // Throw error to caller
      throw error;
    }
  }

  /**
   * Resolve the root element for a charts section.
   *
   * Searches for an explicit `[data-charts-scope]` element, then an ancestor match, and finally falls back to the provided scopeElement or the document.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#getChartsSectionRoot
   *
   * @param {string} scopeSection - Section identifier used to locate the charts scope element.
   * @param {HTMLElement} scopeElement - Optional element used as a starting point for ancestor lookup.
   *
   * @returns {HTMLElement|Document} The resolved charts section root or the document as fallback.
   */
  getChartsSectionRoot(scopeSection, scopeElement) {
    // Log start of section root resolution
    DebugLogger.log(
      `[ChartsHandler] [getChartsSectionRoot] [Start] ${JSON.stringify({
        scopeSection,
        hasScopeElement: !!scopeElement,
      })}`,
    );

    // Begin guarded root resolution block
    try {
      // Log check for explicit charts scope element
      DebugLogger.log(
        `[ChartsHandler] [getChartsSectionRoot] [Step] ${JSON.stringify({
          action: "Check explicit chartsScopeElement",
        })}`,
      );

      // Query explicit charts scope element by data attribute
      const chartsScopeElement = document.querySelector(
        `[data-charts-scope="${scopeSection}"]`,
      );

      // Check if explicit charts scope element was found
      if (chartsScopeElement) {
        // Log explicit source resolution
        DebugLogger.log(
          `[ChartsHandler] [getChartsSectionRoot] [End] ${JSON.stringify({
            source: "explicit",
            success: true,
          })}`,
        );

        // Return the explicitly matched charts scope element
        return chartsScopeElement;
      }

      // Log check for ancestor charts scope element
      DebugLogger.log(
        `[ChartsHandler] [getChartsSectionRoot] [Step] ${JSON.stringify({
          action: "Check ancestor chartsScopeElement",
        })}`,
      );

      // Resolve nearest ancestor charts scope element from provided scopeElement
      const ancestorChartsScopeElement = scopeElement?.closest?.(
        `[data-charts-scope="${scopeSection}"]`,
      );

      // Check if ancestor charts scope element was found
      if (ancestorChartsScopeElement) {
        // Log ancestor source resolution
        DebugLogger.log(
          `[ChartsHandler] [getChartsSectionRoot] [End] ${JSON.stringify({
            source: "ancestor",
            success: true,
          })}`,
        );

        // Return the ancestor charts scope element
        return ancestorChartsScopeElement;
      }

      // Log fallback check to provided scopeElement
      DebugLogger.log(
        `[ChartsHandler] [getChartsSectionRoot] [Step] ${JSON.stringify({
          action: "Check fallback to provided scopeElement",
        })}`,
      );

      // Check if a scopeElement was provided for fallback
      if (scopeElement) {
        // Log provided scope element source resolution
        DebugLogger.log(
          `[ChartsHandler] [getChartsSectionRoot] [End] ${JSON.stringify({
            source: "provided-scopeElement",
            success: true,
          })}`,
        );

        // Return the provided scope element as root
        return scopeElement;
      }

      // Log final fallback to whole document
      DebugLogger.log(
        `[ChartsHandler] [getChartsSectionRoot] [Step] ${JSON.stringify({
          action: "Fallback to whole document",
        })}`,
      );

      // Log document source resolution
      DebugLogger.log(
        `[ChartsHandler] [getChartsSectionRoot] [End] ${JSON.stringify({
          source: "document",
          success: true,
        })}`,
      );

      // Return the document as the charts scope root
      return document;

      // Catch and log the error
    } catch (error) {
      // Log error details for section root resolution
      DebugLogger.error(
        `[ChartsHandler] [getChartsSectionRoot] [Error] ${JSON.stringify({
          message: error.message,
          name: error.name,
          stack: error.stack,
          context: { scopeSection },
        })}`,
      );

      // Warn end with failure status
      DebugLogger.warn(
        `[ChartsHandler] [getChartsSectionRoot] [End] ${JSON.stringify({
          success: false,
        })}`,
      );

      // Throw error to caller
      throw error;
    }
  }

  /**
   * Retrieve all chart container elements within a scope section.
   *
   * Queries for elements whose `data-chart-id` begins with the given scope prefix.
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#getScopeContainers
   *
   * @param {HTMLElement} sectionRoot - The root element containing chart containers.
   * @param {string} scope - The scope key used to match container IDs.
   *
   * @returns {HTMLElement[]} Array of chart container elements found within the scope.
   */
  getScopeContainers(sectionRoot, scope) {
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
   * Emit a custom DOM event.
   *
   * Dispatches a `CustomEvent` with optional detail on the given target (defaults to `window`).
   *
   * @author Linden May
   * @version -
   * @since -
   * @updated -
   * @link https://docs.example.com/ChartsHandler#emit
   *
   * @param {string} eventName - The name of the event to emit.
   * @param {Object} [detail={}] - Optional data to include in the event detail.
   * @param {EventTarget} [target=window] - The target element or object to dispatch the event on.
   *
   * @returns {boolean} True if the event was successfully dispatched, otherwise false.
   */
  emit(eventName, detail = {}, target = window) {
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
        `[ChartsHandler] [emit] "${eventName}" failed: ${e?.message || e}`,
      );

      // Return false on error
      return false;
    }
  }


  /**
   * @param {string|Date|number} value - A date-like value to override the handler "today" reference.
   * @returns {Date|null} Normalized Date used for downstream range calculations.
   */
  setToday(value) {
    const normalized = normalizeLocalDate(value);
    this._todayOverride = normalized;
    this.emit("ChartsHandler:today-updated", {
      today: toIsoDateString(normalized),
    });
    return normalized;
  }

  /**
   * Compute reporting window for a named mode.
   *
   * Returns an inclusive start/end date pair for modes like "TODAY", "SNAPSHOT", "MONTHLY", "WEEKLY", and "YEAR".
   *
   * Modes supported (exact strings):
   *  - "SNAPSHOT" : last 7 days (rolling)
   *  - "YEAR"     : Jan 1 this year → today
   *  - "MONTHLY"  : 1st of this month → today
   *  - "WEEKLY"   : last 7 days anchored to this Monday (start = max(this Monday, today-6))
   *  - "TODAY"    : today only
   *
   * Periods (how your dataset rows are labeled):
   *  - daily   → "YYYY-MM-DD"
   *  - weekly  → "YYYY-W##" (ISO Monday week)
   *  - monthly → "YYYY-MM"
   *  - yearly  → "YYYY"
   *
   * @author Linden May
   * @version 1.0.0
   * @since 1.0.0
   * @updated - Linden May - 2025-10-06
   * @link https://docs.example.com/ClassName#getWindowRange
   *
   * @param {string} mode - Window mode identifier (e.g., "TODAY", "SNAPSHOT", "MONTHLY", "WEEKLY", "YEAR").
   *
   * @returns {{start: string, end: string}} ISO-like date strings defining the inclusive range
   */
  getWindowRange(mode) {
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
  const today = (this && this._todayOverride instanceof Date)
    // Use provided override date when available
    ? this._todayOverride
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


 filterByRange(rows, period, range, periodField = "period") {
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

}




/* ===============================
 * ChartsUtilities Delegation Layer
 * ===============================
 * Force ChartsHandler to delegate all shared helpers to ChartsUtilities.
 * This avoids duplicate logic while preserving syntax safety.
 */

ChartsHandler.prototype.getConfigJSON = function(...args) {
  return ChartsUtilities.getConfigJSON(...args);
};
ChartsHandler.prototype._fetchJSON = function(...args) {
  return ChartsUtilities.fetchJSON(...args);
};
ChartsHandler.prototype.normalizeColorHex = function(...args) {
  return ChartsUtilities.normalizeColorHex(...args);
};
ChartsHandler.prototype.markActive = function(...args) {
  return ChartsUtilities.markActive(...args);
};
ChartsHandler.prototype.getDataAttribute = function(...args) {
  return ChartsUtilities.getDataAttribute(...args);
};
ChartsHandler.prototype.getChartHost = function(...args) {
  return ChartsUtilities.getChartHost(...args);
};
ChartsHandler.prototype.clearChartHost = function(...args) {
  return ChartsUtilities.clearChartHost(...args);
};
ChartsHandler.prototype.getChartsSectionRoot = function(...args) {
  return ChartsUtilities.getChartsSectionRoot(...args);
};
ChartsHandler.prototype.getScopeContainers = function(...args) {
  return ChartsUtilities.getScopeContainers(...args);
};
ChartsHandler.prototype.emit = function(...args) {
  return ChartsUtilities.emit(...args);
};
ChartsHandler.prototype.getWindowRange = function(...args) {
  return ChartsUtilities.getWindowRange(...args);
};
ChartsHandler.prototype.filterByRange = function(...args) {
  return ChartsUtilities.filterByRange(...args);
};

window.ChartsHandler = ChartsHandler;
