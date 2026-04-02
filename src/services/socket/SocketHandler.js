/* ============================================================================
 * SocketHandler (Plain JS, Browser)
 * - Requires identifyCurrentUser(userId) before connect/send
 * - Constructs WebSocket URL with ?userID=<currentUserId>
 * - Auto-sets payload.from = _currentUserId
 * - Keeps _validateSchema (optional, if you pass a schema in call)
 * - No socketConfig, no enforceTo
 *
 * This file can only be tested in https
 * ========================================================================== */

"use strict";

const siteConfig = {
  webSocketUrl:
    "wss://vmz3zmhnq4.execute-api.ap-northeast-1.amazonaws.com/prod",
};

class SocketHandler {
  static _socketInstance = null;
  static _heartbeatIntervalId = null;
  static _heartbeatIntervalMs = 25000;
  static _reconnectAttemptCount = 0;
  static _maxReconnectAttemptsAllowed = 1;
  static _tabVisibilityListenerAttached = false;
  static _socketListenersRegistry = {};
  static _webSocketBaseUrl = siteConfig?.webSocketUrl ?? "";
  static _currentUserId = "";
  static _globalMessageTaps = new Set();
  static _tabSessionId = `tab_${Math.random().toString(36).slice(2)}`;
  static _tabAnnounceTimestamp = Date.now();
  static _broadcastChannelName = "SocketHandler:CallAlert";
  static _callBroadcastChannel = null;
  static _broadcastCallPattern = /call/i;
  static DOMINANT_LOCK_DEFAULT_MS = 6 * 60 * 60 * 1000;
  static TAB_PING_INTERVAL_MS = 4000;
  static TAB_STALE_MS = 12000;
  static _dominantStorageKeyPrefix = "SocketHandler:DominantTab:";
  static _dominantOverrides = new Map();
  static DEFAULT_CALL_ID = "default";
  static _tabLivenessMap = new Map();
  static _tabPingIntervalId = null;
  // static _ringToneUrl = 'https://new-stage.fansocial.app/wp-content/calls/ring.mp3';
  // static _ringAudio = null;
  // static _ringingTimeoutId = null;
  // static _ringingDurationMs = 30000;
  static _localStoragePresenceKey = "SocketHandler:TabPresence";
  static _localStorageListenerAttached = false;

  static debounce(fn, wait = 250) {
    if (typeof fn !== "function") {
      throw new Error("[SocketHandler] debounce requires a function");
    }
    let timeoutId = null;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        timeoutId = null;
        fn(...args);
      }, wait);
    };
  }

  // --- Identity ------------------------------------------------------------
  static identifyCurrentUser(userId) {
    const normalizedUserId = String(userId || "").trim();
    this._currentUserId = normalizedUserId;
    if (!this._currentUserId) {
      this._dominantOverrides.clear();
      console.error(
        "[SocketHandler] identifyCurrentUser called with empty userId.",
      );
      return;
    }
    this._dominantOverrides.clear();
    this._loadDominantOverrideFromStorage();
  }

  // --- URL builder ---------------------------------------------------------
  static _requireUser() {
    if (!this._currentUserId) {
      throw new Error(
        "[SocketHandler] currentUserId not set. Call identifyCurrentUser(userId) first.",
      );
    }
  }

  static _requireUrl() {
    if (!this._webSocketBaseUrl) {
      throw new Error(
        "[SocketHandler] Missing base WebSocket URL. Call setWebSocketUrl(url) first.",
      );
    }
  }

  static _buildUrl() {
    this._requireUser();
    this._requireUrl();
    this._setupBroadcastChannel();
    const glue = this._webSocketBaseUrl.includes("?") ? "&" : "?";
    return `${this._webSocketBaseUrl}${glue}userID=${encodeURIComponent(this._currentUserId)}`;
  }

  static setWebSocketUrl(url) {
    this._webSocketBaseUrl = String(url || "").trim();
  }

  // --- Connection ----------------------------------------------------------
  static _initializeSocketConnection() {
    this._requireUser();
    this._requireUrl();

    if (
      this._socketInstance &&
      this._socketInstance.readyState !== WebSocket.CLOSED
    ) {
      console.warn("[SocketHandler] WebSocket already open");
      return;
    }

    const fullUrl = this._buildUrl();
    this._socketInstance = new WebSocket(fullUrl);

    this._socketInstance.addEventListener(
      "open",
      this.handleSocketOpen.bind(this),
    );
    this._socketInstance.addEventListener(
      "close",
      this.handleSocketClose.bind(this),
    );
    this._socketInstance.addEventListener(
      "error",
      this.handleSocketError.bind(this),
    );
    // Ensure we donâ€™t lose static context
    this._socketInstance.addEventListener("message", (e) =>
      SocketHandler.handleSocketMessage(e),
    );

    console.log(`[SocketHandler] WebSocket created with URL: ${fullUrl}`);

    if (!this._tabVisibilityListenerAttached) {
      this.handleVisibilityChange();
    }
  }

  static shutdownSocketConnection() {
    if (this._socketInstance) {
      this._socketInstance.close();
      this._socketInstance = null;
      console.log("[SocketHandler] WebSocket closed manually");
    }
    this.stopHeartbeatTimer();
    // audio cleanup is handled by the page
  }

  static isSocketConnectionOpen() {
    return this._socketInstance?.readyState === WebSocket.OPEN;
  }

  static isActiveTab() {
    return document.visibilityState === "visible";
  }

  static _normalizeCallId(callId) {
    const normalized = String(callId || "").trim();
    return normalized || this.DEFAULT_CALL_ID;
  }

  // --- Messaging -----------------------------------------------------------
  static async sendSocketMessage({ flag, payload, schema }) {
    console.log(
      `[SocketHandler] â–¶ï¸ START sendSocketMessage for flag: "${flag}"`,
    );

    this._requireUser();

    if (
      !this._socketInstance ||
      this._socketInstance.readyState === WebSocket.CLOSED
    ) {
      console.log("[SocketHandler] âš ï¸ Socket not open â†’ initializing...");
      this._initializeSocketConnection();
    }

    const body = payload && typeof payload === "object" ? { ...payload } : {};
    body.from = this._currentUserId;

    if (schema) {
      this._validateSchema(body, schema, "payload");
    }

    const message = { flag, body };

    try {
      await this._waitForSocketOpen(5000);
      this._socketInstance.send(JSON.stringify(message));
      console.log(
        `[SocketHandler] âœ… Message sent successfully â†’ flag: "${flag}"`,
      );
      return true;
    } catch (err) {
      console.error(
        `[SocketHandler] âŒ Failed to send message â†’ flag: "${flag}"`,
        err?.message || err,
      );
      return false;
    }
  }

  static async sendTestMessage() {
    const flag = "TEST_MESSAGE";
    const message = {
      flag,
      body: {
        from: this._currentUserId,
        content: "Hello from test message ðŸš€",
      },
    };

    try {
      await this._waitForSocketOpen(5000);
      this._socketInstance.send(JSON.stringify(message));
      console.log(
        `[SocketHandler] âœ… Test message sent successfully â†’ flag: "${flag}"`,
      );
      return true;
    } catch (err) {
      console.error(
        `[SocketHandler] âŒ Failed to send test message â†’ flag: "${flag}"`,
        err?.message || err,
      );
      return false;
    }
  }

  static registerSocketListener({ flag, callback, once = false }) {
    this._requireUser();

    if (
      !this._socketInstance ||
      this._socketInstance.readyState === WebSocket.CLOSED
    ) {
      this._initializeSocketConnection();
    }

    if (!this._socketListenersRegistry[flag]) {
      this._socketListenersRegistry[flag] = [];
    }

    this._socketListenersRegistry[flag].push({ callback, once });
    console.log(
      `[SocketHandler] Listener added for flag "${flag}" (once: ${once})`,
    );
  }

  // --- Event handlers ------------------------------------------------------
  // DROP-IN REPLACEMENT #1 â€” adds internal "socket_connected" dispatch only.
  static handleSocketOpen() {
    console.log("[SocketHandler] âœ… WebSocket connection opened");

    this._sendInitialHandshake();
    this.startHeartbeatTimer();
    this._reconnectAttemptCount = 0;

    // NEW: notify page code to (re)register listeners on each successful connect
    window.dispatchEvent(
      new CustomEvent("socket_connected", {
        detail: { userId: this._currentUserId },
      }),
    );
  }

  static handleSocketClose() {
    console.warn("[SocketHandler] ?sï¿½?,? WebSocket connection closed");
    this.stopHeartbeatTimer();

    if (this._reconnectAttemptCount < this._maxReconnectAttemptsAllowed) {
      setTimeout(() => {
        this._reconnectAttemptCount++;
        this._initializeSocketConnection();
      }, 2000);
    } else {
      console.error("??O Max reconnection attempts reached.");
    }
  }

  static handleSocketError(event) {
    console.error(
      "[SocketHandler] âŒ WebSocket error",
      event?.message ?? event,
    );
  }

  static handleSocketMessage(event) {
    try {
      const raw = typeof event?.data === "string" ? event.data : "";

      // ðŸ”´ Always log raw first
      SocketHandler._logIncomingRaw(raw);

      // ðŸ”´ Always dispatch a raw-frame event for global observers (even if invalid JSON)
      //    Consumers can listen: window.addEventListener('SocketHandler:RawIncoming', e => { ... })
      window.dispatchEvent(
        new CustomEvent(SocketHandler.RAW_EVENT_NAME, { detail: { raw } }),
      );

      const parsed = SocketHandler._safeParse(raw);

      if (!parsed || typeof parsed !== "object")
        throw new Error("Invalid JSON from WebSocket");

      const { flag, type, body } = parsed;
      const resolvedFlag = flag || type;

      if (!resolvedFlag) {
        console.warn("[SocketHandler] Message missing flag; ignoring.");
        return;
      }

      if (SocketHandler._shouldBroadcastFlag(resolvedFlag)) {
        const callMeta = {
          flag: resolvedFlag,
          body,
          raw,
          sourceTabId: SocketHandler._tabSessionId,
          ts: Date.now(),
        };
        SocketHandler._dispatchCallAlertEvent(callMeta);
      }

      SocketHandler._logIncoming(resolvedFlag, body, raw);
      SocketHandler._notifyGlobalTaps(resolvedFlag, body, raw);

      window.dispatchEvent(
        new CustomEvent("SocketHandler:Incoming", {
          detail: { flag: resolvedFlag, body, raw },
        }),
      );

      window.dispatchEvent(new CustomEvent(resolvedFlag, { detail: body }));

      if (SocketHandler._socketListenersRegistry[resolvedFlag]) {
        SocketHandler._socketListenersRegistry[resolvedFlag] =
          SocketHandler._socketListenersRegistry[resolvedFlag].filter(
            ({ callback, once }) => {
              try {
                callback(body);
              } catch (err) {
                console.error(
                  `[SocketHandler] Listener for "${resolvedFlag}" failed:`,
                  err,
                );
              }
              return !once;
            },
          );
      }
    } catch (err) {
      console.error(
        "[SocketHandler] Failed to process message:",
        err?.message || err,
      );
    }
  }

  // --- Heartbeat -----------------------------------------------------------
  static startHeartbeatTimer() {
    if (this._heartbeatIntervalId) return;
    this._heartbeatIntervalId = setInterval(() => {
      this.sendHeartbeatMessage();
    }, this._heartbeatIntervalMs);
  }

  static stopHeartbeatTimer() {
    clearInterval(this._heartbeatIntervalId);
    this._heartbeatIntervalId = null;
  }

  static sendHeartbeatMessage() {
    if (!this.isSocketConnectionOpen()) return;

    const heartbeatMsg = {
      flag: "heartbeat",
      body: {
        ts: Date.now(),
        userId: this._currentUserId,
        tabId: this._tabSessionId,
        tabStatus: this.isActiveTab() ? "online" : "offline",
        dominantTabId: this.getEffectiveDominantTabId(),
      },
    };

    try {
      this._socketInstance.send(JSON.stringify(heartbeatMsg));
      console.log(
        "[SocketHandler] sendHeartbeatMessage sent",
        JSON.stringify(heartbeatMsg),
      );
    } catch (e) {
      // Avoid TDZ/shadow issues
      const errStr =
        e && typeof e === "object" && "message" in e ? e.message : String(e);
      console.warn("[SocketHandler] Heartbeat send failed:", errStr);
    }
  }

  static _waitForSocketOpen(timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        if (this.isSocketConnectionOpen()) return resolve(true);
        if (Date.now() - start >= timeoutMs)
          return reject(new Error("WebSocket open timeout"));
        setTimeout(check, 100);
      };
      check();
    });
  }

  static _sendInitialHandshake() {
    const handshakeMsg = {
      flag: "initial_connection",
      body: {
        userId: this._currentUserId,
        timestamp: Date.now(),
      },
    };

    try {
      this._socketInstance?.send(JSON.stringify(handshakeMsg));
      console.log(
        "[SocketHandler] Handshake sent",
        JSON.stringify(handshakeMsg),
      );
    } catch (e) {
      // Avoid TDZ/shadow issues; never reference a bare identifier named "message"
      const errStr =
        e && typeof e === "object" && "message" in e ? e.message : String(e);
      console.warn("[SocketHandler] Handshake send failed:", errStr);
    }
  }

  // DROP-IN REPLACEMENT #3 â€” destroy + log on tab hidden (visibility change)
  //
  // Replace your current handleVisibilityChange() function with this version.
  //

  static handleVisibilityChange() {
    if (this._tabVisibilityListenerAttached) return;

    const visibilityHandler = SocketHandler.debounce(() => {
      if (document.visibilityState === "visible") {
        console.log("[SocketHandler] Tab visible - reinitializing socket");
        if (
          !this._socketInstance ||
          this._socketInstance.readyState === WebSocket.CLOSED
        ) {
          try {
            this._initializeSocketConnection();
          } catch (e) {
            console.warn("[SocketHandler] Reinit on visible failed:", e);
          }
        }
        this._announceTabPresence();
      } else {
        console.log(
          "[SocketHandler] Tab hidden - keeping socket + heartbeats running",
        );
      }
      this._sendTabPing();
    }, 1000);

    document.addEventListener("visibilitychange", visibilityHandler);
    this._tabVisibilityListenerAttached = true;
  }
  static _setupBroadcastChannel() {
    if (this._callBroadcastChannel) {
      console.log("[SocketHandler] BroadcastChannel already initialized");
      return;
    }

    if (typeof BroadcastChannel === "undefined") {
      console.warn(
        "[SocketHandler] BroadcastChannel not supported in this browser",
      );
      return;
    }

    try {
      this._callBroadcastChannel = new BroadcastChannel(
        this._broadcastChannelName,
      );
      console.log(
        "[SocketHandler] ? BroadcastChannel created:",
        this._broadcastChannelName,
      );

      this._callBroadcastChannel.addEventListener("message", (event) => {
        this._handleBroadcastMessage(event?.data);
      });
      window.addEventListener("beforeunload", () =>
        this._broadcastTabClosing(),
      );
      this._announceTabPresence();
      this._startTabPingTimer();

      console.log("[SocketHandler] ? BroadcastChannel fully initialized");
    } catch (err) {
      console.warn(
        "[SocketHandler] BroadcastChannel init failed:",
        err?.message || err,
      );
    }
  }

  static _announceTabPresence() {
    if (!this._callBroadcastChannel) {
      console.warn(
        "[SocketHandler] Cannot announce tab presence - BroadcastChannel not initialized",
      );
      return;
    }
    this._tabAnnounceTimestamp = Date.now();

    console.log("[SocketHandler] Announcing tab presence:", {
      tabId: this._tabSessionId,
      timestamp: this._tabAnnounceTimestamp,
      userId: this._currentUserId,
    });

    try {
      this._callBroadcastChannel.postMessage({
        type: "tab:announce",
        tabId: this._tabSessionId,
        ts: this._tabAnnounceTimestamp,
        userId: this._currentUserId, // CRITICAL: Include userId for per-user tab tracking
      });
      console.log(
        "[SocketHandler] ? Tab presence announced with userId:",
        this._currentUserId,
      );
    } catch (err) {
      console.warn("[SocketHandler] Tab announce failed:", err?.message || err);
    }
  }

  static _broadcastTabClosing() {
    if (!this._callBroadcastChannel) return;

    try {
      this._callBroadcastChannel.postMessage({
        type: "tab:close",
        tabId: this._tabSessionId,
      });
    } catch (err) {
      console.warn(
        "[SocketHandler] Tab close broadcast failed:",
        err?.message || err,
      );
    } finally {
      const callIdsToClear = [];
      for (const [callId, override] of this._dominantOverrides.entries()) {
        if (override?.tabId === this._tabSessionId) {
          callIdsToClear.push(callId);
        }
      }
      callIdsToClear.forEach((callId) =>
        this.clearDominantTabOverride({ callId, reason: "tab-closed" }),
      );
      this._tabLivenessMap.delete(this._tabSessionId);
      this._stopTabPingTimer();
    }
  }

  static _handleBroadcastMessage(payload) {
    if (!payload || typeof payload !== "object") return;

    const { type } = payload || {};

    if (type === "tab:close") {
      console.log("[SocketHandler] Received tab close:", {
        tabId: payload.tabId,
      });
      this._tabLivenessMap.delete(payload.tabId);
      const callIdsToClear = [];
      for (const [callId, override] of this._dominantOverrides.entries()) {
        if (override?.tabId === payload.tabId) {
          callIdsToClear.push(callId);
        }
      }
      callIdsToClear.forEach((callId) => {
        this.clearDominantTabOverride({
          callId,
          reason: "tab-closed",
          broadcast: false,
        });
      });
      return;
    }

    if (type === "tab:ping") {
      const timestamp =
        typeof payload.ts === "number" ? payload.ts : Number(payload.ts);
      if (payload.tabId && payload.userId && !Number.isNaN(timestamp)) {
        this._updateTabLivenessEntry({
          tabId: payload.tabId,
          userId: payload.userId,
          ts: timestamp,
          isVisible: payload.isVisible,
        });
        console.log("[SocketHandler] Received tab ping:", {
          tabId: payload.tabId,
          isVisible: payload.isVisible,
          userId: payload.userId,
        });
      }
      this._pruneTabLivenessMap();
      return;
    }

    if (type === "dominant:set") {
      const normalizedUserId = String(payload?.userId || "").trim();
      const normalizedTabId = payload?.tabId || "";
      const setAt =
        typeof payload?.setAt === "number"
          ? payload.setAt
          : Number(payload?.setAt);
      const expiresAt =
        typeof payload?.expiresAt === "number"
          ? payload.expiresAt
          : Number(payload?.expiresAt);
      if (
        !normalizedUserId ||
        !normalizedTabId ||
        Number.isNaN(setAt) ||
        Number.isNaN(expiresAt)
      ) {
        return;
      }
      if (normalizedUserId !== this._currentUserId) {
        return;
      }
      const callId = this._normalizeCallId(payload?.callId);
      this._dominantOverrides.set(callId, {
        userId: normalizedUserId,
        tabId: normalizedTabId,
        setAt,
        expiresAt,
        reason: payload?.reason || "broadcast",
      });
      this._persistDominantOverride();
      console.log("[SocketHandler] Dominant override updated via broadcast:", {
        callId,
        ...this._dominantOverrides.get(callId),
      });
      return;
    }

    if (type === "dominant:clear") {
      const normalizedUserId = String(payload?.userId || "").trim();
      if (!normalizedUserId) {
        return;
      }
      if (normalizedUserId === this._currentUserId) {
        this.clearDominantTabOverride({
          callId: this._normalizeCallId(payload?.callId),
          reason: payload?.reason || "broadcast",
          broadcast: false,
        });
      }
      return;
    }
  }

  static registerAsDominantTab({ callId, reason = "manual", lockMs } = {}) {
    if (!this._currentUserId) {
      console.warn(
        "[SocketHandler] Cannot register dominant tab before setting current user",
      );
      return null;
    }
    const normalizedCallId = this._normalizeCallId(callId);
    const now = Date.now();
    const expiresAt =
      now +
      (typeof lockMs === "number" && lockMs > 0
        ? lockMs
        : this.DOMINANT_LOCK_DEFAULT_MS);
    const override = {
      userId: this._currentUserId,
      tabId: this._tabSessionId,
      setAt: now,
      expiresAt,
      reason: reason || "manual",
    };
    this._dominantOverrides.set(normalizedCallId, override);
    this._persistDominantOverride();
    this._broadcastDominantOverride("dominant:set", {
      callId: normalizedCallId,
      ...override,
    });
    console.log(
      "[SocketHandler] Tab registered as dominant for call:",
      normalizedCallId,
      override,
    );
    return override;
  }

  static clearDominantTabOverride({
    callId,
    reason = "manual",
    broadcast = true,
  } = {}) {
    const normalizedCallId = this._normalizeCallId(callId);
    const existing = this._dominantOverrides.get(normalizedCallId);
    if (!existing) return;
    this._dominantOverrides.delete(normalizedCallId);
    this._persistDominantOverride();
    if (broadcast) {
      this._broadcastDominantOverride("dominant:clear", {
        userId: existing.userId,
        callId: normalizedCallId,
        reason,
      });
    }
    console.log(
      "[SocketHandler] Dominant override cleared for call:",
      normalizedCallId,
      { userId: existing.userId, tabId: existing.tabId, reason },
    );
  }

  static _persistDominantOverride() {
    if (typeof localStorage === "undefined") return;
    const userId = this._currentUserId;
    if (!userId) return;
    const key = this._getDominantStorageKey(userId);
    if (!key) return;
    const payload = {};
    for (const [callId, override] of this._dominantOverrides.entries()) {
      if (override?.userId === userId) {
        payload[callId] = override;
      }
    }
    try {
      if (Object.keys(payload).length > 0) {
        localStorage.setItem(key, JSON.stringify(payload));
      } else {
        localStorage.removeItem(key);
      }
    } catch (err) {
      console.warn(
        "[SocketHandler] Failed to persist dominant overrides:",
        err?.message || err,
      );
    }
  }

  static _loadDominantOverrideFromStorage() {
    this._dominantOverrides.clear();
    if (!this._currentUserId || typeof localStorage === "undefined") return;
    const key = this._getDominantStorageKey(this._currentUserId);
    if (!key) return;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;
      const now = Date.now();
      for (const [keyId, entry] of Object.entries(parsed)) {
        const normalizedCallId = this._normalizeCallId(keyId);
        const setAt =
          typeof entry?.setAt === "number" ? entry.setAt : Number(entry?.setAt);
        const expiresAt =
          typeof entry?.expiresAt === "number"
            ? entry.expiresAt
            : Number(entry?.expiresAt);
        const tabId = entry?.tabId || "";
        const userId = String(entry?.userId || "").trim();
        if (
          !tabId ||
          !userId ||
          userId !== this._currentUserId ||
          Number.isNaN(setAt) ||
          Number.isNaN(expiresAt) ||
          expiresAt <= now
        ) {
          continue;
        }
        this._dominantOverrides.set(normalizedCallId, {
          userId,
          tabId,
          setAt,
          expiresAt,
          reason: entry?.reason || "stored",
        });
      }
    } catch (err) {
      console.warn(
        "[SocketHandler] Failed to load dominant overrides from storage:",
        err?.message || err,
      );
      this._dominantOverrides.clear();
    }
  }

  static _getDominantStorageKey(userId) {
    if (!userId) return null;
    return `${this._dominantStorageKeyPrefix}${userId}`;
  }

  static _broadcastDominantOverride(type, payload) {
    if (!this._callBroadcastChannel) return;
    try {
      this._callBroadcastChannel.postMessage({ type, ...payload });
    } catch (err) {
      console.warn(
        `[SocketHandler] Failed to broadcast ${type}:`,
        err?.message || err,
      );
    }
  }

  static _startTabPingTimer() {
    if (this._tabPingIntervalId || !this._callBroadcastChannel) return;
    this._sendTabPing();
    this._pruneTabLivenessMap();
    this._tabPingIntervalId = setInterval(() => {
      this._sendTabPing();
      this._pruneTabLivenessMap();
    }, this.TAB_PING_INTERVAL_MS);
  }

  static _stopTabPingTimer() {
    if (this._tabPingIntervalId) {
      clearInterval(this._tabPingIntervalId);
      this._tabPingIntervalId = null;
    }
  }

  static _sendTabPing() {
    const payload = {
      type: "tab:ping",
      tabId: this._tabSessionId,
      userId: this._currentUserId,
      ts: Date.now(),
      isVisible: this.isActiveTab(),
    };
    this._updateTabLivenessEntry(payload);
    if (!this._callBroadcastChannel) return;
    try {
      this._callBroadcastChannel.postMessage(payload);
    } catch (err) {
      console.warn("[SocketHandler] Tab ping failed:", err?.message || err);
    }
  }

  static _updateTabLivenessEntry({ tabId, userId, ts, isVisible }) {
    if (!tabId || !userId) return;
    const timestamp = typeof ts === "number" ? ts : Number(ts);
    if (Number.isNaN(timestamp)) return;
    const previous = this._tabLivenessMap.get(tabId);
    const visibleNow = Boolean(isVisible);
    const lastVisibleTs = visibleNow ? timestamp : previous?.lastVisibleTs || 0;
    this._tabLivenessMap.set(tabId, {
      userId,
      lastPingTs: timestamp,
      isVisible: visibleNow,
      lastVisibleTs,
    });
  }

  static _pruneTabLivenessMap() {
    const now = Date.now();
    for (const [tabId, entry] of this._tabLivenessMap.entries()) {
      if (!entry || typeof entry.lastPingTs !== "number") {
        this._tabLivenessMap.delete(tabId);
        continue;
      }
      if (now - entry.lastPingTs > this.TAB_STALE_MS) {
        this._tabLivenessMap.delete(tabId);
      }
    }
  }

  static _isTabAlive(tabId) {
    if (!tabId) return false;
    const entry = this._tabLivenessMap.get(tabId);
    if (!entry || typeof entry.lastPingTs !== "number") return false;
    return Date.now() - entry.lastPingTs <= this.TAB_STALE_MS;
  }

  static _getActiveDominantOverride(callId) {
    const normalizedCallId = this._normalizeCallId(callId);
    const override = this._dominantOverrides.get(normalizedCallId);
    if (!override) {
      return null;
    }
    const now = Date.now();
    const isStale = override.expiresAt <= now;
    const isDead = !this._isTabAlive(override.tabId);
    if (isStale || isDead) {
      this.clearDominantTabOverride({
        callId: normalizedCallId,
        reason: isStale ? "override-expired" : "override-stale",
      });
      return null;
    }
    return override;
  }

  static _getLastActiveTabMeta() {
    const currentUserId = this._currentUserId;
    if (!currentUserId) {
      return {
        tabId: this._tabSessionId,
        lastVisibleTs: 0,
        lastPingTs: 0,
        isVisible: this.isActiveTab(),
        userId: currentUserId,
      };
    }

    const now = Date.now();
    const candidates = [];
    for (const [tabId, entry] of this._tabLivenessMap.entries()) {
      if (!entry || entry.userId !== currentUserId) continue;
      if (now - entry.lastPingTs > this.TAB_STALE_MS) continue;
      candidates.push({ tabId, ...entry });
    }

    const pickLatestBy = (list, key) =>
      list.reduce((winner, candidate) => {
        const candidateTs = candidate?.[key] || 0;
        const winnerTs = winner?.[key] || 0;
        if (!winner || candidateTs > winnerTs) {
          return candidate;
        }
        return winner;
      }, null);

    const lastActiveWinner = pickLatestBy(
      candidates.filter((item) => item.lastVisibleTs),
      "lastVisibleTs",
    );
    if (lastActiveWinner) {
      return lastActiveWinner;
    }

    const aliveWinner = pickLatestBy(candidates, "lastPingTs");
    if (aliveWinner) {
      return aliveWinner;
    }

    return {
      tabId: this._tabSessionId,
      lastVisibleTs: 0,
      lastPingTs: 0,
      isVisible: this.isActiveTab(),
      userId: currentUserId,
    };
  }

  static getLastActiveTabId() {
    const meta = this._getLastActiveTabMeta();
    return meta?.tabId || this._tabSessionId;
  }

  static getEffectiveDominantTabId(callId) {
    const normalizedCallId = this._normalizeCallId(callId);
    const currentUserId = this._currentUserId;
    if (!currentUserId) {
      return this._tabSessionId;
    }

    const override = this._getActiveDominantOverride(normalizedCallId);
    if (override && override.userId === currentUserId) {
      return override.tabId;
    }

    return this.getLastActiveTabId();
  }

  static _shouldBroadcastFlag(flag) {
    return typeof flag === "string" && this._broadcastCallPattern.test(flag);
  }

  static _resolveCallId(flag, body, ts) {
    const overrideFromBody = body?.callId;
    if (typeof overrideFromBody === "string" && overrideFromBody.trim()) {
      return this._normalizeCallId(overrideFromBody);
    }
    if (overrideFromBody) {
      return this._normalizeCallId(String(overrideFromBody));
    }
    const derivedTs = body?.timestamp ?? ts ?? "";
    const derived = `${flag}:${body?.from || ""}:${body?.to || ""}:${derivedTs}`;
    return this._normalizeCallId(derived);
  }

  static _dispatchCallAlertEvent({ flag, body, raw, sourceTabId, ts }) {
    if (flag === "call:initiate" || flag === "call:incoming") {
      console.log(
        "[SocketHandler] ?? New incoming call detected - refreshing tab heartbeat",
      );
      this._sendTabPing();
      if (this.isActiveTab()) {
        this._announceTabPresence();
      }
    }

    const callId = this._resolveCallId(flag, body, ts);
    const lastActiveMeta = this._getLastActiveTabMeta();
    const effectiveDominantTabId =
      flag === "call:incoming"
        ? lastActiveMeta?.tabId || this.getLastActiveTabId()
        : this.getEffectiveDominantTabId(callId);
    const isDominantTab = effectiveDominantTabId === this._tabSessionId;
    console.log("[SocketHandler] call alert context", {
      callId,
      currentTabId: this._tabSessionId,
      currentTabVisible: this.isActiveTab(),
      lastActiveTabId: lastActiveMeta?.tabId || null,
      lastActiveVisibleTs: lastActiveMeta?.lastVisibleTs || null,
      lastActivePingTs: lastActiveMeta?.lastPingTs || null,
      lastActiveIsVisible: lastActiveMeta?.isVisible ?? null,
      effectiveDominantTabId,
    });
    if (!isDominantTab) {
      console.log(
        "[SocketHandler] Skipping call alert because this tab is not the effective last-active/dominant tab",
        { callId, effectiveDominantTabId },
      );
      return;
    }
    const isTabActive = this.isActiveTab();
    const shouldRing = isDominantTab;

    console.log(
      "%c[SocketHandler] ===== CALL ALERT EVALUATION =====",
      "background: #9c27b0; color: white; font-weight: bold; padding: 5px;",
    );
    console.log("[SocketHandler] flag:", flag);
    console.log("[SocketHandler] callId:", callId);
    console.log("[SocketHandler] sourceTabId:", sourceTabId);
    console.log("[SocketHandler] this._tabSessionId:", this._tabSessionId);
    console.log(
      "[SocketHandler] effectiveDominantTabId:",
      effectiveDominantTabId,
    );
    console.log("[SocketHandler] isDominantTab:", isDominantTab);
    console.log("[SocketHandler] shouldRing:", shouldRing);
    console.log("[SocketHandler] isTabActive:", isTabActive);

    console.log(
      "[PUSH_NOTIFICATION] SocketHandler dispatching CallAlert event",
    );
    console.log(
      "[PUSH_NOTIFICATION] Event detail - flag:",
      flag,
      "shouldRing:",
      shouldRing,
      "isDominantTab:",
      isDominantTab,
    );
    console.log(
      "%c[SocketHandler] ===== DISPATCHING SocketHandler:CallAlert EVENT =====",
      "background: #dc3545; color: white; font-weight: bold; padding: 5px;",
    );
    console.log("[SocketHandler] Event will be dispatched with detail:", {
      flag,
      callId,
      shouldRing,
      isDominantTab,
      callerName: body?.callerData?.displayName || body?.from || "N/A",
    });

    const event = new CustomEvent("SocketHandler:CallAlert", {
      detail: {
        flag,
        body,
        raw,
        sourceTabId,
        ts,
        shouldRing,
        dominantTabId: effectiveDominantTabId,
        targetTabId: sourceTabId,
        isTabActive,
        isDominantTab,
        callId,
      },
    });

    console.log("[PUSH_NOTIFICATION] Event created, dispatching to window...");
    console.log("[PUSH_NOTIFICATION] Event object:", event);
    console.log("[PUSH_NOTIFICATION] Event type:", event.type);
    console.log("[PUSH_NOTIFICATION] Event detail:", event.detail);

    // Dispatch to both window and document to handle iframe cases
    window.dispatchEvent(event);
    document.dispatchEvent(event);
    console.log(
      "[PUSH_NOTIFICATION] Event dispatched to both window and document",
    );

    // Try to manually trigger listener check
    setTimeout(() => {
      console.log(
        "[PUSH_NOTIFICATION] Checking if event was received by listeners...",
      );
      // If we don't see the listener log, the listener isn't working
    }, 100);
  }

  static getCurrentTabId() {
    return this._tabSessionId;
  }

  // --- Commented out: ringtone helpers moved to HTML -------------------------
  // static _ensureRingtoneAudio() {
  //   if (this._ringAudio) return;
  //
  //   try {
  //     this._ringAudio = new Audio(this._ringToneUrl);
  //     this._ringAudio.loop = true;
  //     this._ringAudio.preload = 'auto';
  //   } catch (err) {
  //     console.warn('[SocketHandler] Ringtone init failed:', err?.message || err);
  //     this._ringAudio = null;
  //   }
  // }
  //
  // static _playRingtone() {
  //   if (!this._isCurrentRinger()) return;
  //   this._ensureRingtoneAudio();
  //   if (!this._ringAudio) return;
  //
  //   this._clearRingingTimeout();
  //
  //   this._ringAudio.currentTime = 0;
  //   const playPromise = this._ringAudio.play();
  //   if (playPromise && typeof playPromise.catch === 'function') {
  //     playPromise.catch(err => {
  //       console.warn('[SocketHandler] Ringtone play blocked:', err?.message || err);
  //     });
  //   }
  //
  //   this._ringingTimeoutId = setTimeout(() => {
  //     this._stopRingtone();
  //   }, this._ringingDurationMs);
  // }
  //
  // static _stopRingtone() {
  //   if (this._ringAudio) {
  //     this._ringAudio.pause();
  //     this._ringAudio.currentTime = 0;
  //   }
  //   this._clearRingingTimeout();
  // }
  //
  // static _clearRingingTimeout() {
  //   if (this._ringingTimeoutId) {
  //     clearTimeout(this._ringingTimeoutId);
  //     this._ringingTimeoutId = null;
  //   }
  // }

  static addGlobalMessageTap(fn) {
    if (typeof fn === "function") this._globalMessageTaps.add(fn);
  }

  static removeGlobalMessageTap(fn) {
    this._globalMessageTaps.delete(fn);
  }

  static _notifyGlobalTaps(flag, body, raw) {
    this._globalMessageTaps.forEach((fn) => {
      try {
        fn({ flag, body, raw });
      } catch (err) {
        console.error("[SocketHandler] Global tap failed:", err);
      }
    });
  }

  static _logIncoming(flag, body, raw) {
    try {
      console.group(`[SocketHandler] ðŸ“¥ Incoming â†’ flag: "${flag}"`);
      console.log("raw:", raw);
      console.log("body:", JSON.stringify(body));
      console.groupEnd();
    } catch (e) {
      console.warn("[SocketHandler] Incoming log failed:", e?.message || e);
    }
  }

  // --- Schema Validation ---------------------------------------------------
  static _validateSchema(data, schema, path = "payload") {
    if (!schema) return;

    for (const key in schema) {
      const rule = schema[key];
      const value = data?.[key];
      const fullPath = `${path}.${key}`;

      if (rule.required && value === undefined) {
        throw new Error(`[${fullPath}] Missing required field`);
      }

      if (value !== undefined) {
        const actualType = Array.isArray(value) ? "array" : typeof value;
        if (actualType !== rule.type) {
          throw new Error(
            `[${fullPath}] Expected type ${rule.type}, got ${actualType}`,
          );
        }

        if (rule.type === "object" && rule.properties) {
          this._validateSchema(value, rule.properties, fullPath);
        }
      }
    }
  }

  // 1) Add this new helper anywhere in the class (e.g., above _logIncoming)
  static _logIncomingRaw(raw) {
    try {
      console.group("[SocketHandler] ðŸ“¥ Incoming (RAW)");
      console.log("raw:", raw);
      console.groupEnd();
    } catch (e) {
      console.warn("[SocketHandler] Raw incoming log failed:", e?.message || e);
    }
  }

  static _safeParse(s) {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  }
}

// Expose globally
window.SocketHandler = SocketHandler;
export default SocketHandler;

document.addEventListener("event:user:loggedin", (e) => {
  const userId = e?.detail?.userId;
  if (!userId) {
    console.warn("[SocketHandler] event:user:loggedin missing userId");
    return;
  }

  try {
    SocketHandler.identifyCurrentUser(userId);
    SocketHandler._initializeSocketConnection();
    console.log(`[SocketHandler] Initialized WebSocket for user: ${userId}`);
  } catch (err) {
    console.error("[SocketHandler] Failed to initialize after login:", err);
  }
});

document.addEventListener("event:tab:register-dominant", (event) => {
  const detail = event?.detail || {};
  const userId = String(detail.userId || "").trim();
  if (!userId) {
    console.warn("[SocketHandler] event:tab:register-dominant missing userId");
    return;
  }
  if (userId !== SocketHandler._currentUserId) {
    console.warn(
      "[SocketHandler] register-dominant event for another user:",
      userId,
    );
    return;
  }
  const callId = String(detail.callId || "").trim();
  if (!callId) {
    console.warn("[SocketHandler] register-dominant event missing callId");
    return;
  }

  SocketHandler.registerAsDominantTab({
    callId,
    reason: detail.reason,
    lockMs: detail.lockMs,
  });
  SocketHandler._sendTabPing();
  if (SocketHandler.isSocketConnectionOpen()) {
    SocketHandler.sendHeartbeatMessage();
  }
});

document.addEventListener("event:tab:clear-dominant", (event) => {
  const detail = event?.detail || {};
  const userId = String(detail.userId || "").trim();
  if (!userId) {
    console.warn("[SocketHandler] event:tab:clear-dominant missing userId");
    return;
  }
  if (userId !== SocketHandler._currentUserId) {
    console.warn(
      "[SocketHandler] clear-dominant event for another user:",
      userId,
    );
    return;
  }
  const callId = String(detail.callId || "").trim();
  if (!callId) {
    console.warn("[SocketHandler] clear-dominant event missing callId");
    return;
  }
  SocketHandler.clearDominantTabOverride({
    callId,
    reason: detail.reason || "manual-clear",
  });
  SocketHandler._sendTabPing();
});
