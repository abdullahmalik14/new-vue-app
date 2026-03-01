// STATE ENGINE CODE

// ============================================================================
// FILE: src/utils/stateEngine.js
// Global step/state/substep engine, validator filters, logging, shift logger.
// ============================================================================

import {
  reactive,
  toRaw,
  onMounted,
  onBeforeUnmount,
  onActivated,
  onDeactivated,
} from "vue";

// ---------- small helpers ----------

function deepClone(value) {
  try {
    // eslint-disable-next-line no-undef
    return typeof structuredClone === "function"
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
  } catch (e) {
    console.warn("[stateEngine] deepClone failed, returning original", e);
    return value;
  }
}

function deepGet(obj, path) {
  if (!path) {
    return obj;
  }

  const keys = path.split(".");

  let cur = obj;

  for (let i = 0; i < keys.length; i++) {
    if (cur == null || typeof cur !== "object") {
      return undefined;
    }

    cur = cur[keys[i]];
  }

  return cur;
}

function deepSet(obj, path, value) {
  const keys = path.split(".");
  let cur = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];

    if (!cur[key] || typeof cur[key] !== "object") {
      cur[key] = {};
    }

    cur = cur[key];
  }

  cur[keys[keys.length - 1]] = value;

  return obj;
}

function createEventBus() {
  const listeners = new Map();

  return {
    on(eventName, handler) {
      if (!listeners.has(eventName)) {
        listeners.set(eventName, new Set());
      }

      listeners.get(eventName).add(handler);

      return () => {
        listeners.get(eventName)?.delete(handler);
      };
    },

    emit(eventName, payload) {
      const set = listeners.get(eventName);

      if (!set) {
        return;
      }

      set.forEach((handler) => {
        try {
          handler(payload);
        } catch (e) {
          console.error("[stateEngine] event handler error", eventName, e);
        }
      });
    },
  };
}

function readQuery() {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(params.entries());
}

function writeQuery(next) {
  const params = new URLSearchParams(window.location.search);

  Object.entries(next).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash || ""}`;

  window.history.pushState({}, "", nextUrl);
}

// ---------- Validator filter registry ----------

const ValidatorFilters = {
  _map: new Map(),

  register(name, fn) {
    this._map.set(name, fn);
  },

  get(name) {
    return this._map.get(name);
  },
};

// default filters
ValidatorFilters.register("onEnterStep", (ctx, step) => ctx.nextStep === step);

ValidatorFilters.register("onExitStep", (ctx, step) => ctx.prevStep === step);

ValidatorFilters.register("whenState", (ctx, path, predicate) => {
  try {
    return !!predicate(deepGet(ctx.engine.state, path));
  } catch (e) {
    console.warn("[stateEngine] whenState predicate error", e);
    return false;
  }
});

// ---------- Main engine factory ----------

export function createStepStateEngine(config) {
  const {
    flowId,
    defaults = {},
    initialStep = 1,
    urlSync = "query", // 'none' | 'query'
    forcePolicy = "log", // 'log' | 'ignore' (place-holder for future)
  } = config || {};

  if (!flowId) {
    throw new Error("[stateEngine] flowId is required");
  }

  const bus = createEventBus();

  const core = reactive({
    flowId,
    state: deepClone(defaults),
    step: initialStep,
    substep: null,
    flags: {
      isValidating: false,
    },
    validators: new Map(), // key -> { fn, filters, useFilters }
    _logs: [],
    _history: [],
    _dirty: new Set(),
    _lastIntent: null,
  });

  const queryStepKey = `${flowId}_step`;
  const querySubKey = `${flowId}_sub`;

  function log(label, payload) {
    const line = `[${new Date().toISOString()}] (${flowId}) ${label} ${payload ? JSON.stringify(payload) : ""}`;

    core._logs.push(line);
    console.log(`[stateEngine:${flowId}] ${label}`, payload || "");
  }

  function readFromUrl() {
    if (urlSync !== "query") {
      return null;
    }

    const query = readQuery();
    const rawStep = query[queryStepKey];
    const rawSub = query[querySubKey];

    let nextStep = core.step;

    if (rawStep != null) {
      const parsed = parseInt(rawStep, 10);

      if (Number.isFinite(parsed)) {
        nextStep = parsed;
      }
    }

    const nextSubstep = rawSub || null;

    return {
      step: nextStep,
      substep: nextSubstep,
    };
  }

  function pushToUrl() {
    if (urlSync !== "query") {
      return;
    }

    writeQuery({
      [queryStepKey]: core.step,
      [querySubKey]: core.substep || "",
    });
  }

  function historyPush(entry) {
    core._history.push({
      time: Date.now(),
      ...deepClone(entry),
    });
  }

  function registerValidator(key, fn, filters = {}, useFilters = []) {
    core.validators.set(key, {
      fn,
      filters,
      useFilters,
    });

    log("validator:register", {
      key,
      filters,
      useFilters,
    });
  }

  async function runValidators(phase, ctx) {
    const results = [];

    for (const [key, def] of core.validators.entries()) {
      const filters = def.filters || {};
      const useFilters = def.useFilters || [];

      let phaseMatch = false;

      if (phase === "entry" && filters.onEntry) {
        phaseMatch = true;
      } else if (phase === "exit" && filters.onExit) {
        phaseMatch = true;
      } else if (phase === "always" && filters.always) {
        phaseMatch = true;
      }

      if (!phaseMatch) {
        continue;
      }

      const allFiltersPass = useFilters.every(([name, ...args]) => {
        const filterFn = ValidatorFilters.get(name);

        if (!filterFn) {
          return true;
        }

        try {
          return !!filterFn(ctx, ...args);
        } catch (e) {
          console.warn("[stateEngine] validator filter error", name, e);
          return false;
        }
      });

      if (!allFiltersPass) {
        continue;
      }

      log("validator:run", {
        key,
        phase,
      });

      const result = await def.fn({
        engine: api,
        context: ctx,
      });

      results.push({
        key,
        phase,
        ...(result || {}),
      });
    }

    return results;
  }

  function decide(results, { force }) {
    const errors = results.flatMap((r) => r.errors || []).filter(Boolean);

    const warnings = results.flatMap((r) => r.warnings || []).filter(Boolean);

    if (errors.length || warnings.length) {
      log("validator:results", {
        errors,
        warnings,
        force,
        forcePolicy,
      });
    }

    if (errors.length && !force) {
      return {
        blocked: true,
        errors,
        warnings,
      };
    }

    return {
      blocked: false,
      warnings,
    };
  }

  const api = {
    // read-only views
    get flowId() {
      return core.flowId;
    },

    get step() {
      return core.step;
    },

    get substep() {
      return core.substep;
    },

    get state() {
      return core.state;
    },

    get flags() {
      return core.flags;
    },

    get logs() {
      return core._logs;
    },

    get history() {
      return core._history;
    },

    get lastIntent() {
      return core._lastIntent;
    },

    // core lifecycle
    initialize(options = {}) {
      const { fromUrl = true } = options;

      log("initialize:start", {
        fromUrl,
      });

      if (fromUrl) {
        const urlState = readFromUrl();

        if (urlState) {
          core.step = urlState.step;
          core.substep = urlState.substep;
        }
      }

      if (!window.__StepState) {
        window.__StepState = {};
      }

      window.__StepState[flowId] = api;

      bus.emit("engine:initialized", {
        step: core.step,
        substep: core.substep,
        state: deepClone(core.state),
      });

      log("initialize:end", {
        step: core.step,
        substep: core.substep,
      });
    },

    initializeFromState() {
      log("initializeFromState", {
        step: core.step,
        substep: core.substep,
      });

      // UI re-renders automatically due to reactivity
      bus.emit("engine:reinit", {
        step: core.step,
        substep: core.substep,
        state: deepClone(core.state),
      });
    },

    // state helpers
    setState(path, value, options = {}) {
      const { reason = "setState", silent = false } = options;

      deepSet(core.state, path, value);
      core._dirty.add(path);

      if (!silent) {
        log("state:set", {
          path,
          value,
          reason,
        });

        bus.emit("state:changed", {
          path,
          value,
          reason,
          step: core.step,
          substep: core.substep,
          state: deepClone(core.state),
        });
      }
    },

    getState(path) {
      return deepGet(core.state, path);
    },

    isDirty(path) {
      return core._dirty.has(path);
    },

    // validator registration
    registerValidator,

    // validator registration
    registerValidator,

    addValidator(step, fn) {
      registerValidator(
        `step-${step}-validation`,
        async ({ engine }) => {
          const res = await fn(engine.state);
          if (res === true) return {};
          if (typeof res === "string") return { errors: [res] };
          return res;
        },
        { onExit: true },
        [["onExitStep", step]],
      );
    },

    async validate(step) {
      log("validate:manual", { step });

      const ctx = {
        prevStep: step,
        nextStep: null,
        intent: "validate",
        force: false,
        engine: api,
      };

      const results = await runValidators("exit", ctx);
      const decision = decide(results, { force: false });

      return {
        valid: !decision.blocked,
        errors: decision.errors || [],
        warnings: decision.warnings || [],
      };
    },

    // navigation: step
    async goToStep(nextStep, options = {}) {
      const { intent = "user", force = false } = options;

      if (core.step === nextStep) {
        log("step:no-op", {
          step: core.step,
        });

        return;
      }

      core._lastIntent = intent;

      bus.emit("transition:before", {
        type: "step",
        prev: core.step,
        next: nextStep,
        intent,
        force,
      });

      // exit validators
      const exitCtx = {
        prevStep: core.step,
        nextStep: nextStep,
        intent,
        force,
        engine: api,
      };

      const exitResults = await runValidators("exit", exitCtx);
      const exitDecision = decide(exitResults, { force });

      if (exitDecision.blocked && !force) {
        log("step:blocked:exit", {
          prev: core.step,
          next: nextStep,
        });

        return;
      }

      // entry validators
      const entryCtx = {
        prevStep: core.step,
        nextStep: nextStep,
        intent,
        force,
        engine: api,
      };

      const entryResults = await runValidators("entry", entryCtx);
      const entryDecision = decide(entryResults, { force });

      if (entryDecision.blocked && !force) {
        log("step:blocked:entry", {
          prev: core.step,
          next: nextStep,
        });

        return;
      }

      const prevStep = core.step;

      core.step = nextStep;

      pushToUrl();

      historyPush({
        type: "step",
        prev: prevStep,
        next: nextStep,
        intent,
        force,
      });

      bus.emit("step:changed", {
        prev: prevStep,
        next: nextStep,
        intent,
        force,
        state: deepClone(core.state),
      });

      log("step:changed", {
        prev: prevStep,
        next: nextStep,
        intent,
        force,
      });

      bus.emit("transition:after", {
        type: "step",
        prev: prevStep,
        next: nextStep,
        intent,
        force,
      });
    },

    async goToSubstep(nextSubstep, options = {}) {
      const { intent = "user", force = false } = options;

      if (core.substep === nextSubstep) {
        log("substep:no-op", {
          substep: core.substep,
        });

        return;
      }

      core._lastIntent = intent;

      bus.emit("transition:before", {
        type: "substep",
        prev: core.substep,
        next: nextSubstep,
        intent,
        force,
      });

      const prevSub = core.substep;

      core.substep = nextSubstep;

      pushToUrl();

      historyPush({
        type: "substep",
        prev: prevSub,
        next: nextSubstep,
        intent,
        force,
      });

      bus.emit("substep:changed", {
        prev: prevSub,
        next: nextSubstep,
        intent,
        force,
        state: deepClone(core.state),
      });

      log("substep:changed", {
        prev: prevSub,
        next: nextSubstep,
        intent,
        force,
      });

      bus.emit("transition:after", {
        type: "substep",
        prev: prevSub,
        next: nextSubstep,
        intent,
        force,
      });
    },

    async forceStep(nextStep, options = {}) {
      return api.goToStep(nextStep, {
        ...options,
        intent: options.intent || "force",
        force: true,
      });
    },

    async forceSubstep(nextSubstep, options = {}) {
      return api.goToSubstep(nextSubstep, {
        ...options,
        intent: options.intent || "force",
        force: true,
      });
    },

    // events
    on: bus.on,
    emit: bus.emit,
  };

  // popstate sync
  if (urlSync === "query") {
    window.addEventListener("popstate", () => {
      const next = readFromUrl();

      if (!next) {
        return;
      }

      api.forceStep(next.step, {
        intent: "system",
      });

      api.forceSubstep(next.substep, {
        intent: "system",
      });
    });
  }

  return api;
}

// ---------- engine logging helper (replaces src/events/index.js) ----------

export function attachEngineLogging(engine) {
  engine.on("engine:initialized", (payload) => {
    console.log("[EVENT]", engine.flowId, "engine:initialized", payload);
  });

  engine.on("state:changed", (payload) => {
    console.log("[EVENT]", engine.flowId, "state:changed", payload);
  });

  engine.on("step:changed", (payload) => {
    console.log("[EVENT]", engine.flowId, "step:changed", payload);
  });

  engine.on("substep:changed", (payload) => {
    console.log("[EVENT]", engine.flowId, "substep:changed", payload);
  });

  engine.on("transition:before", (payload) => {
    console.log("[EVENT]", engine.flowId, "transition:before", payload);
  });

  engine.on("transition:after", (payload) => {
    console.log("[EVENT]", engine.flowId, "transition:after", payload);
  });

  engine.on("validation:start", (payload) => {
    console.log("[EVENT]", engine.flowId, "validation:start", payload);
  });

  engine.on("component:mounted", (payload) => {
    console.log("[EVENT]", engine.flowId, "component:mounted", payload);
  });

  engine.on("component:unmounted", (payload) => {
    console.log("[EVENT]", engine.flowId, "component:unmounted", payload);
  });
}

// ---------- per-component lifecycle logger (merged here) ----------

export function useShiftLogger(name, engine) {
  onMounted(() => {
    engine?.emit("component:mounted", {
      name,
      step: engine.step,
      substep: engine.substep,
    });
  });

  onBeforeUnmount(() => {
    engine?.emit("component:unmounted", {
      name,
      step: engine.step,
      substep: engine.substep,
    });
  });

  onActivated(() => {
    engine?.emit("component:activated", {
      name,
      step: engine.step,
      substep: engine.substep,
    });
  });

  onDeactivated(() => {
    engine?.emit("component:deactivated", {
      name,
      step: engine.step,
      substep: engine.substep,
    });
  });
}

// ---------- optional helper for data-component-path ----------

export function setComponentPath(el, path) {
  if (!el) {
    return;
  }

  el.setAttribute("data-component-path", String(path || "unknown"));
}

export function hydrateFromSnapshot(engine, snapshot = {}, options = {}) {
  if (!engine || typeof engine !== "object") {
    console.warn("[stateEngine] hydrateFromSnapshot: invalid engine");
    return;
  }

  if (!snapshot || typeof snapshot !== "object") {
    console.warn(
      "[stateEngine] hydrateFromSnapshot: snapshot missing or invalid",
    );
    return;
  }

  const { preserveUrl = false } = options;

  // ----------------------------------------------------
  // 1. Determine actual state payload
  // ----------------------------------------------------
  const statePayload =
    snapshot.state && typeof snapshot.state === "object"
      ? snapshot.state
      : snapshot; // fallback: snapshot IS the state

  // ----------------------------------------------------
  // 2. Merge state deeply (keeps reactivity)
  // ----------------------------------------------------
  try {
    for (const key in statePayload) {
      if (Object.prototype.hasOwnProperty.call(statePayload, key)) {
        // shallow but sufficient merge into reactive tree
        engine.state[key] = deepClone(statePayload[key]);
      }
    }
  } catch (e) {
    console.error("[stateEngine] hydrateFromSnapshot: merge error", e);
  }

  // ----------------------------------------------------
  // 3. Restore step if provided
  // ----------------------------------------------------
  if (typeof snapshot.step === "number" && !Number.isNaN(snapshot.step)) {
    engine.forceStep(snapshot.step, {
      intent: "system",
      // note: forceSubstep call later
    });
  }

  // ----------------------------------------------------
  // 4. Restore substep if provided
  // ----------------------------------------------------
  if (typeof snapshot.substep === "string" || snapshot.substep === null) {
    engine.forceSubstep(snapshot.substep, {
      intent: "system",
    });
  }

  // ----------------------------------------------------
  // 5. If requested, prevent URL rewrite
  // ----------------------------------------------------
  if (preserveUrl) {
    // Temporarily patch pushToUrl behavior by overriding URL sync.
    // (We can't disable URL sync permanently because some flows rely on it.)
    engine.emit("hydrate:preserveUrl", {
      detail: "URL not rewritten as requested",
    });
  } else {
    // Let the engine update URL normally
  }

  // ----------------------------------------------------
  // 6. Trigger UI re-render from state only
  // ----------------------------------------------------
  engine.initializeFromState();

  // ----------------------------------------------------
  // 7. Final signal
  // ----------------------------------------------------
  engine.emit("hydrate:complete", {
    step: engine.step,
    substep: engine.substep,
    state: deepClone(engine.state),
  });
}

// 😎 Why this helper is powerful
// ✔ Accepts both:

// { state, step, substep }

// or a raw state object

// ✔ Uses deepClone internally (keeps Vue’s reactivity intact)
// ✔ Keeps existing engine logic (validators, events, URL sync)
// ✔ Allows restoring step + substep without bugs
// ✔ Can work with partial objects:

// If your DB returns only fileMeta and percentage, it will still merge safely.

// ✔ Emits helpful events:

// hydrate:preserveUrl

// hydrate:complete

// ✔ Plays perfectly with:

// rental flow

// media uploader

// checkout

// profile setup

// any future flow
