"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = void 0;
/**
 * A generic event emitter implementation that allows subscribing to and emitting typed events.
 * @template T - A record type mapping event names to their argument types.
 */
class EventEmitter {
    listeners = new Map();
    /**
     * Subscribes a listener function to a specific event.
     * @param event - The event name to listen to.
     * @param listener - The callback function to execute when the event is emitted.
     */
    on(event, listener) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(listener);
    }
    /**
     * Unsubscribes a listener function from a specific event.
     * @param event - The event name to unsubscribe from.
     * @param listener - The callback function to remove.
     */
    off(event, listener) {
        const eventListeners = this.listeners.get(event);
        if (!eventListeners)
            return;
        this.listeners.set(event, eventListeners.filter((l) => l !== listener));
    }
    /**
     * Emits an event, calling all subscribed listeners with the provided argument.
     * @param event - The event name to emit.
     * @param arg - The argument to pass to all listeners (defaults to empty array if not provided).
     */
    emit(event, arg = []) {
        const eventListeners = this.listeners.get(event);
        if (!eventListeners)
            return;
        eventListeners.forEach((listener) => listener(arg));
    }
}
exports.EventEmitter = EventEmitter;
