import { useEffect } from "react";
import { useAppwrite } from "../Provider/useAppwrite";
export function useRealtimeDocument(arg1, arg2, arg3, arg4) {
    const { client, cacheFusion, config } = useAppwrite();
    let databaseId;
    let collectionId;
    let documentId;
    let onEvent;
    if (typeof arg3 === "string") {
        databaseId = arg1;
        collectionId = arg2;
        documentId = arg3;
        onEvent = arg4;
    }
    else {
        if (!config.databaseId) {
            throw new Error(`[react-appwrite] Database ID was not provided and no default 'databaseId' was configured in <AppwriteProvider>.`);
        }
        databaseId = config.databaseId;
        collectionId = arg1;
        documentId = arg2;
        onEvent = typeof arg3 === "function" ? arg3 : undefined;
    }
    useEffect(() => {
        if (!databaseId || !collectionId || !documentId)
            return;
        const channel = `databases.${databaseId}.collections.${collectionId}.documents.${documentId}`;
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
    }, [client, databaseId, collectionId, documentId, cacheFusion, onEvent]);
}
