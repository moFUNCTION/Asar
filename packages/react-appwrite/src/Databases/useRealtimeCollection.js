import { useEffect } from "react";
import { useAppwrite } from "../Provider/useAppwrite";
import { resolveDbAndCollection } from "./helpers";
export function useRealtimeCollection(arg1, arg2, arg3) {
    const { client, cacheFusion, config } = useAppwrite();
    const onEvent = typeof arg2 === "function" ? arg2 : arg3;
    const { databaseId, collectionId } = resolveDbAndCollection(config.databaseId, arg1, typeof arg2 === "string" ? arg2 : undefined);
    useEffect(() => {
        if (!databaseId || !collectionId)
            return;
        const channel = `databases.${databaseId}.collections.${collectionId}.documents`;
        const unsubscribe = client.subscribe(channel, (response) => {
            const payload = {
                events: response.events,
                channels: response.channels,
                timestamp: response.timestamp,
                payload: response.payload,
            };
            cacheFusion.handleRealtimeEvent(payload);
            onEvent?.(payload);
        });
        return () => {
            unsubscribe();
        };
    }, [client, databaseId, collectionId, cacheFusion, onEvent]);
}
