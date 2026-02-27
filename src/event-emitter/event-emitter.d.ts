/**
 * Type alias for event names, which can be strings or numbers.
 */
type EventName = string | number;
/**
 * A generic event emitter implementation that allows subscribing to and emitting typed events.
 * @template T - A record type mapping event names to their argument types.
 */
export declare class EventEmitter<T extends Record<EventName, any>> {
    private listeners;
    /**
     * Subscribes a listener function to a specific event.
     * @param event - The event name to listen to.
     * @param listener - The callback function to execute when the event is emitted.
     */
    on<K extends keyof T>(event: K, listener: (arg: T[K]) => void): void;
    /**
     * Unsubscribes a listener function from a specific event.
     * @param event - The event name to unsubscribe from.
     * @param listener - The callback function to remove.
     */
    off<K extends keyof T>(event: K, listener: (arg: T[K]) => void): void;
    /**
     * Emits an event, calling all subscribed listeners with the provided argument.
     * @param event - The event name to emit.
     * @param arg - The argument to pass to all listeners (defaults to empty array if not provided).
     */
    emit<K extends keyof T>(event: K, arg?: T[K]): void;
}
export {};
