/**
 * A priority queue implementation using a binary heap.
 * Items with lower priority values are dequeued first (min-heap).
 * @template T - The type of items stored in the queue.
 */
export declare class PriorityQueue<T> {
    private items;
    private compare;
    /**
     * Creates a new PriorityQueue instance.
     * @param compare - A comparison function for priorities. Defaults to (a, b) => a - b (min-heap).
     */
    constructor(compare?: (a: number, b: number) => number);
    /**
     * Adds an item to the queue with the specified priority.
     * @param item - The item to add.
     * @param priority - The priority of the item (lower values have higher priority).
     */
    enqueue(item: T, priority: number): void;
    /**
     * Removes and returns the item with the highest priority (lowest priority value).
     * @returns The item with the highest priority, or undefined if the queue is empty.
     */
    dequeue(): T | undefined;
    /**
     * Returns the item with the highest priority without removing it.
     * @returns The item with the highest priority, or undefined if the queue is empty.
     */
    peek(): T | undefined;
    /**
     * Checks if the queue is empty.
     * @returns True if the queue is empty, false otherwise.
     */
    isEmpty(): boolean;
    /**
     * Returns the number of items in the queue.
     * @returns The size of the queue.
     */
    size(): number;
    /**
     * Removes all items from the queue.
     */
    clear(): void;
    /**
     * Moves an item up the heap to maintain heap property after insertion.
     * @param index - The index of the item to move up.
     */
    private heapifyUp;
    /**
     * Moves an item down the heap to maintain heap property after removal.
     * @param index - The index of the item to move down.
     */
    private heapifyDown;
}
