import type { RealtimeResponseEvent } from "appwrite";
export interface UseRealtimeSubscriptionOptions {
    enabled?: boolean;
}
/**
 * Universal realtime subscription hook for any Appwrite channel
 * (collections, documents, files, account, teams, memberships).
 * Automatically manages subscriptions and unmount cleanups to prevent memory leaks.
 *
 * @example
 * useRealtimeSubscription("files", (response) => {
 *   console.log("File event received:", response.events, response.payload);
 * });
 */
export declare function useRealtimeSubscription<T = unknown>(channels: string | string[], callback: (event: RealtimeResponseEvent<T>) => void, options?: UseRealtimeSubscriptionOptions): void;
//# sourceMappingURL=useRealtimeSubscription.d.ts.map