/**
 * MockSocket.js
 * A simple Event Emitter to simulate a WebSocket connection for real-time features.
 */

class MockSocket {
  constructor() {
    this.events = {};
    this.connected = false;
    // Simulate an initial connection delay
    setTimeout(() => {
      this.connected = true;
      this.emit("connect");
      console.log("[MockSocket] Connected");
    }, 500);
  }

  /**
   * Listen for an event
   */
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  /**
   * Remove a listener
   */
  off(event, listenerToRemove) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(
      (l) => l !== listenerToRemove,
    );
  }

  /**
   * Emit an event (simulating receiving data from the server)
   */
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach((listener) => listener(data));
    }
  }

  /**
   * Simulate sending data to the server, which might bounce back
   * or trigger other events.
   */
  send(event, data) {
    if (!this.connected) {
      console.warn(
        `[MockSocket] Attempted to send '${event}' but socket is not connected yet.`,
      );
      return;
    }
    console.log(`[MockSocket] Sending event: ${event}`, data);

    // Let's bounce it back to simulate the server broadcasting it
    // In a real app, the server would broadcast this to other clients in the room
    // or back to us if we subscribe to our own room.
    setTimeout(() => {
      this.emit(event, data);
    }, 300); // Small network delay
  }
}

// Export a singleton instance
const mockSocket = new MockSocket();
export default mockSocket;
