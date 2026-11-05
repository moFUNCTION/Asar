import { useEffect, useRef } from "react";
import { useAppwrite } from "../Provider/useAppwrite";
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
export function useRealtimeSubscription(channels, callback, options = {}) {
    const { client } = useAppwrite();
    const enabled = options.enabled !== false;
    const callbackRef = useRef(callback);
    callbackRef.current = callback;
    useEffect(() => {
        if (!enabled)
            return;
        const channelList = Array.isArray(channels) ? channels : [channels];
        if (channelList.length === 0)
            return;
        const unsubscribe = client.subscribe(channelList, (response) => {
            callbackRef.current(response);
        });
        return () => {
            unsubscribe();
        };
    }, [client, enabled, Array.isArray(channels) ? channels.join(",") : channels]);
}
