import type { Models } from "appwrite";
import type { ICacheFusionStore, RealtimeEventPayload } from "../types";
export declare class CacheFusionStore implements ICacheFusionStore {
    private documents;
    private collectionQueries;
    private listeners;
    readonly maxEntries: number;
    constructor(maxEntries?: number);
    get documentCache(): Map<string, Models.Document>;
    get collectionCache(): Map<string, {
        documents: Models.Document[];
        total: number;
    }>;
    private setDocumentKey;
    private setCollectionQueryKey;
    private getDocKey;
    private getCollPrefix;
    getDocument<T = any>(databaseId: string, collectionId: string, documentId: string): (T & Models.Document) | undefined;
    setDocument<T = any>(databaseId: string, collectionId: string, document: T & Models.Document): void;
    removeDocument(databaseId: string, collectionId: string, documentId: string): void;
    getCollectionQuery<T = any>(queryKey: string): {
        documents: (T & Models.Document)[];
        total: number;
    } | undefined;
    setCollectionQuery<T = any>(queryKey: string, data: {
        documents: (T & Models.Document)[];
        total: number;
    }): void;
    handleRealtimeEvent<T = any>(event: RealtimeEventPayload<T>): void;
    subscribeToKey(key: string, listener: () => void): () => void;
    private notify;
    clear(): void;
}
//# sourceMappingURL=CacheFusionStore.d.ts.map