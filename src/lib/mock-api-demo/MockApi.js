// MockApi.js
// Vanilla JS mock API class that uses the config above.

class MockApi {
  constructor(config) {
    this.config = config || { routes: {}, datasets: {}, defaults: {} };

    // Track how many times each route+method was called (for retry behaviour)
    this.callCounters = {}; // key: `${method} ${urlKey}` -> number

    // Keep call history for assertions/debugging
    this.history = [];
  }

  /**
   * Helper to build a map key for retry counters.
   */
  _getCounterKey(method, urlKey) {
    return method + " " + urlKey;
  }

  /**
   * Increment and return the attempt count for this route/method.
   */
  _incrementAttempt(method, urlKey) {
    const key = this._getCounterKey(method, urlKey);
    if (!this.callCounters[key]) {
      this.callCounters[key] = 0;
    }
    this.callCounters[key] += 1;
    return this.callCounters[key];
  }

  /**
   * Reset attempts (used when resetAfterSuccess === true).
   */
  _resetAttempts(method, urlKey) {
    const key = this._getCounterKey(method, urlKey);
    this.callCounters[key] = 0;
  }

  /**
   * Main public methods
   */
  get(urlKey, options) {
    return this._handleRequest("GET", urlKey, null, options || {});
  }

  post(urlKey, body, options) {
    return this._handleRequest("POST", urlKey, body || {}, options || {});
  }

  delete(urlKey, options) {
    return this._handleRequest("DELETE", urlKey, null, options || {});
  }

  /**
   * Generic request handler.
   */
  _handleRequest(method, urlKey, body, options) {
    const routeConfig = this.config.routes[urlKey];

    if (!routeConfig) {
      return Promise.reject(
        new Error("[MockApi] No route config found for urlKey: " + urlKey)
      );
    }

    const methodConfig = routeConfig.methods[method];

    if (!methodConfig || methodConfig.enabled === false) {
      return Promise.reject(
        new Error("[MockApi] Method not enabled or missing for " + method + " " + urlKey)
      );
    }

    const attempt = this._incrementAttempt(method, urlKey);

    const requestContext = {
      method: method,
      urlKey: urlKey,
      body: body || {},
      query: options.query || {},
      headers: options.headers || {},
      params: options.params || {},
      attempt: attempt
    };

    const delayMs = typeof methodConfig.delayMs === "number"
      ? methodConfig.delayMs
      : (this.config.defaults.delayMs || 0);

    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        try {
          const response = this._buildResponse(methodConfig, requestContext);
          // Track history
          this.history.push({
            request: requestContext,
            responseMeta: {
              status: response.status,
              ok: response.ok
            },
            timestamp: Date.now()
          });
          resolve(response);
        } catch (err) {
          reject(err);
        }
      }, delayMs);
    });
  }

  /**
   * Build the mock response based on config, validation, retry logic, datasets, and scenarios.
   */
  _buildResponse(methodConfig, requestContext) {
    // 1. Basic validation (required fields + character limits)
    const validationErrors = this._validateRequest(methodConfig, requestContext);

    if (validationErrors && validationErrors.hasErrors) {
      const scenario = this._findScenarioByName(methodConfig, "validationError");
      const status = (scenario && scenario.status) || 422;
      const body = scenario && scenario.body
        ? this._deepClone(scenario.body)
        : { errors: validationErrors.errors };

      // If scenario template exists, merge our actual errors into it
      if (scenario && scenario.body && scenario.body.errors) {
        body.errors = validationErrors.errors;
      }

      return this._createResponseObject(status, body);
    }

    // 2. Determine scenario via retry logic
    const scenario = this._selectScenarioWithRetry(methodConfig, requestContext);

    // 3. Handle datasets (paging, filters) for the chosen scenario
    const responseBody = this._buildScenarioBody(methodConfig, scenario, requestContext);

    return this._createResponseObject(scenario.status, responseBody);
  }

  /**
   * Validate required fields + character limits.
   */
  _validateRequest(methodConfig, requestContext) {
    const errors = {};
    let hasErrors = false;

    const body = requestContext.body || {};
    const query = requestContext.query || {};

    // Required fields (body or query; you can refine rules if needed)
    const requiredFields = methodConfig.requiredFields || [];
    for (let i = 0; i < requiredFields.length; i++) {
      const fieldName = requiredFields[i];
      const value = body[fieldName] != null ? body[fieldName] : query[fieldName];
      const isMissing = value === null || value === undefined || value === "";

      if (isMissing) {
        errors[fieldName] = (errors[fieldName] || "This field is required.");
        hasErrors = true;
      }
    }

    // Character limits
    const characterLimitsConfig = methodConfig.characterLimits || {};
    for (const field in characterLimitsConfig) {
      if (!Object.prototype.hasOwnProperty.call(characterLimitsConfig, field)) {
        continue;
      }
      const limits = characterLimitsConfig[field];
      const min = typeof limits.min === "number" ? limits.min : (this.config.defaults.characterLimits || {}).defaultMin || 0;
      const max = typeof limits.max === "number" ? limits.max : (this.config.defaults.characterLimits || {}).defaultMax || Infinity;
      const value = body[field] != null ? body[field] : query[field];

      if (value != null) {
        const length = String(value).length;
        if (length < min) {
          errors[field] = "Must be at least " + min + " characters.";
          hasErrors = true;
        } else if (length > max) {
          errors[field] = "Must be at most " + max + " characters.";
          hasErrors = true;
        }
      }
    }

    return {
      hasErrors: hasErrors,
      errors: errors
    };
  }

  /**
   * Select scenario based on retry logic and attempt counts.
   */
  _selectScenarioWithRetry(methodConfig, requestContext) {
    const retryLogic = methodConfig.retryLogic || {};
    const scenarios = methodConfig.scenarios || [];
    const defaultScenarioName = methodConfig.defaultScenario || "success";

    // Start with default scenario
    let chosenScenarioName = defaultScenarioName;

    const maxAttempts = retryLogic.maxAttempts || this.config.defaults.maxRetries || 1;
    const successOnAttempt = retryLogic.successOnAttempt;
    const failureScenarioName = retryLogic.failureScenario || null;
    const resetAfterSuccess = retryLogic.resetAfterSuccess === true;
    const attempt = requestContext.attempt;

    if (successOnAttempt != null) {
      if (attempt < successOnAttempt) {
        // Use failure scenario before success
        if (failureScenarioName) {
          chosenScenarioName = failureScenarioName;
        }
      } else {
        // At or after success attempt => use default success scenario
        chosenScenarioName = defaultScenarioName;
        if (resetAfterSuccess) {
          this._resetAttempts(requestContext.method, requestContext.urlKey);
        }
      }

      // Clamp attempts so we do not exceed max if you want that behaviour
      if (attempt > maxAttempts && failureScenarioName) {
        chosenScenarioName = failureScenarioName;
      }
    }

    const scenario = this._findScenarioByName(methodConfig, chosenScenarioName);
    if (!scenario) {
      throw new Error(
        "[MockApi] Scenario not found: " +
        chosenScenarioName +
        " for method config with defaultScenario=" +
        defaultScenarioName
      );
    }

    return scenario;
  }

  /**
   * Utility to find a scenario by name in the method config.
   */
  _findScenarioByName(methodConfig, scenarioName) {
    const scenarios = methodConfig.scenarios || [];
    for (let i = 0; i < scenarios.length; i++) {
      if (scenarios[i].name === scenarioName) {
        return scenarios[i];
      }
    }
    return null;
  }

  /**
   * Build scenario body, handling datasets + template replacements.
   */
  _buildScenarioBody(methodConfig, scenario, requestContext) {
    // Deep clone to avoid mutating the config
    const bodyTemplate = this._deepClone(scenario.body);

    // Data source (for lists, pagination, etc.)
    const dataSourceConfig = methodConfig.dataSource;

    let datasetSlice = null;
    let datasetTotal = null;

    if (dataSourceConfig && dataSourceConfig.dataSourceKey) {
      const datasetKey = dataSourceConfig.dataSourceKey;
      const fullDataset = this.config.datasets[datasetKey] || [];
      const filteredData = this._applyDatasetFilters(fullDataset, dataSourceConfig, requestContext);
      const pagedData = this._applyDatasetPaging(filteredData, dataSourceConfig, requestContext);

      datasetSlice = pagedData.slice;
      datasetTotal = pagedData.total;
    }

    // Apply template replacements
    const finalBody = this._applyTemplateReplacements(
      bodyTemplate,
      requestContext,
      datasetSlice,
      datasetTotal
    );

    return finalBody;
  }

  /**
   * Filter dataset based on query parameters and allowedFilterFields.
   */
  _applyDatasetFilters(fullDataset, dataSourceConfig, requestContext) {
    const allowQueryFilter = dataSourceConfig.allowQueryFilter === true;
    const allowedFilterFields = dataSourceConfig.allowedFilterFields || [];
    const query = requestContext.query || {};

    if (!allowQueryFilter || allowedFilterFields.length === 0) {
      return fullDataset.slice();
    }

    let filtered = fullDataset.slice();

    for (let i = 0; i < allowedFilterFields.length; i++) {
      const fieldName = allowedFilterFields[i];
      const filterValue = query[fieldName];

      if (filterValue != null && filterValue !== "") {
        filtered = filtered.filter(function (item) {
          if (!item || typeof item !== "object") {
            return false;
          }
          return String(item[fieldName]) === String(filterValue);
        });
      }
    }

    return filtered;
  }

  /**
   * Apply paging (limit + offset) to the dataset.
   */
  _applyDatasetPaging(filteredDataset, dataSourceConfig, requestContext) {
    const pagingConfig = dataSourceConfig.paging || {};
    const enabled = pagingConfig.enabled === true;
    const total = filteredDataset.length;

    if (!enabled) {
      return {
        slice: filteredDataset.slice(),
        total: total
      };
    }

    const query = requestContext.query || {};
    const limitKey = pagingConfig.queryLimitKey || "limit";
    const offsetKey = pagingConfig.queryOffsetKey || "offset";

    const defaultLimit = typeof pagingConfig.defaultLimit === "number"
      ? pagingConfig.defaultLimit
      : 10;

    const maxLimit = typeof pagingConfig.maxLimit === "number"
      ? pagingConfig.maxLimit
      : 100;

    let limit = query[limitKey] != null ? parseInt(query[limitKey], 10) : defaultLimit;
    if (isNaN(limit) || limit <= 0) {
      limit = defaultLimit;
    }
    if (limit > maxLimit) {
      limit = maxLimit;
    }

    let offset = query[offsetKey] != null ? parseInt(query[offsetKey], 10) : 0;
    if (isNaN(offset) || offset < 0) {
      offset = 0;
    }

    const slice = filteredDataset.slice(offset, offset + limit);

    return {
      slice: slice,
      total: total
    };
  }

  /**
   * Apply template replacements in the scenario body.
   * Supports:
   * - "{{request.body.field}}"
   * - "{{datasetSlice}}"
   * - "{{datasetTotal}}"
   */
  _applyTemplateReplacements(bodyTemplate, requestContext, datasetSlice, datasetTotal) {
    const self = this;

    function replaceValue(value) {
      if (typeof value === "string") {
        if (value === "{{datasetSlice}}") {
          return datasetSlice != null ? datasetSlice : [];
        }
        if (value === "{{datasetTotal}}") {
          return datasetTotal != null ? datasetTotal : 0;
        }

        // request.* path, eg: "{{request.body.email}}"
        if (value.indexOf("{{request.") === 0 && value.lastIndexOf("}}") === value.length - 2) {
          const pathExpression = value.substring("{{".length, value.length - "}}".length); // request.body.email
          const pathParts = pathExpression.split(".");
          let current = { request: requestContext };

          for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            if (current == null || !Object.prototype.hasOwnProperty.call(current, part)) {
              current = null;
              break;
            }
            current = current[part];
          }

          return current;
        }

        return value;
      }

      if (Array.isArray(value)) {
        return value.map(replaceValue);
      }

      if (value && typeof value === "object") {
        const result = {};
        for (const key in value) {
          if (!Object.prototype.hasOwnProperty.call(value, key)) {
            continue;
          }
          result[key] = replaceValue(value[key]);
        }
        return result;
      }

      return value;
    }

    return replaceValue(bodyTemplate);
  }

  /**
   * Create a Response-like object with json() and text() methods.
   */
  _createResponseObject(status, body) {
    const responseBody = body === undefined ? null : body;

    return {
      status: status,
      ok: status >= 200 && status < 300,
      headers: {},

      json: function () {
        return Promise.resolve(responseBody);
      },

      text: function () {
        // Basic JSON stringification for text()
        if (responseBody === null || responseBody === undefined) {
          return Promise.resolve("");
        }
        return Promise.resolve(JSON.stringify(responseBody));
      }
    };
  }

  /**
   * Utility to deep clone JSON-friendly objects.
   */
  _deepClone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  }

  /**
   * Public helpers for tests / debugging
   */

  getHistory() {
    return this.history.slice();
  }

  clearHistory() {
    this.history = [];
  }
}

export default MockApi;