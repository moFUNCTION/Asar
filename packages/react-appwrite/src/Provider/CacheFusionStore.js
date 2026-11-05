export class CacheFusionStore {
    // Document Cache: "dbId:collId:docId" -> Document
    documents = new Map();
    // Collection Queries Cache: "dbId:collId:queryHash" -> { documents, total }
    collectionQueries = new Map();
    // Listeners for query keys or document keys
    listeners = new Map();
    // Maximum LRU entries capacity limit
    maxEntries;
    constructor(maxEntries = 500) {
        this.maxEntries = maxEntries;
    }
    get documentCache() {
        return this.documents;
    }
    get collectionCache() {
        return this.collectionQueries;
    }
    setDocumentKey(key, doc) {
        if (this.documents.has(key)) {
            this.documents.delete(key);
        }
        else if (this.documents.size >= this.maxEntries) {
            const oldestKey = this.documents.keys().next().value;
            if (oldestKey !== undefined) {
                this.documents.delete(oldestKey);
            }
        }
        this.documents.set(key, doc);
    }
    setCollectionQueryKey(key, data) {
        if (this.collectionQueries.has(key)) {
            this.collectionQueries.delete(key);
        }
        else if (this.collectionQueries.size >= this.maxEntries) {
            const oldestKey = this.collectionQueries.keys().next().value;
            if (oldestKey !== undefined) {
                this.collectionQueries.delete(oldestKey);
            }
        }
        this.collectionQueries.set(key, data);
    }
    getDocKey(databaseId, collectionId, documentId) {
        return `doc:${databaseId}:${collectionId}:${documentId}`;
    }
    getCollPrefix(databaseId, collectionId) {
        return `coll:${databaseId}:${collectionId}:`;
    }
    getDocument(databaseId, collectionId, documentId) {
        const key = this.getDocKey(databaseId, collectionId, documentId);
        const doc = this.documents.get(key);
        if (doc !== undefined) {
            this.documents.delete(key);
            this.documents.set(key, doc);
        }
        return doc;
    }
    setDocument(databaseId, collectionId, document) {
        if (!document || !document.$id)
            return;
        const key = this.getDocKey(databaseId, collectionId, document.$id);
        this.setDocumentKey(key, document);
        // Also update this document inside any matching collection queries
        const collPrefix = this.getCollPrefix(databaseId, collectionId);
        for (const [qKey, data] of this.collectionQueries.entries()) {
            if (qKey.startsWith(collPrefix)) {
                const index = data.documents.findIndex((d) => d.$id === document.$id);
                if (index !== -1) {
                    const updated = [...data.documents];
                    updated[index] = document;
                    this.setCollectionQueryKey(qKey, { ...data, documents: updated });
                    this.notify(qKey);
                }
            }
        }
        this.notify(key);
    }
    removeDocument(databaseId, collectionId, documentId) {
        const key = this.getDocKey(databaseId, collectionId, documentId);
        this.documents.delete(key);
        // Remove document from all cached collection queries
        const collPrefix = this.getCollPrefix(databaseId, collectionId);
        for (const [qKey, data] of this.collectionQueries.entries()) {
            if (qKey.startsWith(collPrefix)) {
                const filtered = data.documents.filter((d) => d.$id !== documentId);
                if (filtered.length !== data.documents.length) {
                    this.setCollectionQueryKey(qKey, {
                        documents: filtered,
                        total: Math.max(0, data.total - 1),
                    });
                    this.notify(qKey);
                }
            }
        }
        this.notify(key);
    }
    getCollectionQuery(queryKey) {
        const data = this.collectionQueries.get(queryKey);
        if (!data)
            return undefined;
        this.collectionQueries.delete(queryKey);
        this.collectionQueries.set(queryKey, data);
        return data;
    }
    setCollectionQuery(queryKey, data) {
        this.setCollectionQueryKey(queryKey, data);
        // Also warm the document cache
        for (const doc of data.documents) {
            if (doc.$databaseId && doc.$collectionId && doc.$id) {
                const docKey = this.getDocKey(doc.$databaseId, doc.$collectionId, doc.$id);
                this.setDocumentKey(docKey, doc);
            }
        }
        this.notify(queryKey);
    }
    handleRealtimeEvent(event) {
        if (!event || !event.payload || !event.payload.$id || !Array.isArray(event.events))
            return;
        const doc = event.payload;
        const databaseId = doc.$databaseId;
        const collectionId = doc.$collectionId;
        if (!databaseId || !collectionId)
            return;
        const isCreate = event.events.some((e) => e.endsWith(".create"));
        const isUpdate = event.events.some((e) => e.endsWith(".update"));
        const isDelete = event.events.some((e) => e.endsWith(".delete"));
        if (isDelete) {
            this.removeDocument(databaseId, collectionId, doc.$id);
            return;
        }
        if (isUpdate) {
            this.setDocument(databaseId, collectionId, doc);
            return;
        }
        if (isCreate) {
            // Add to document cache
            const docKey = this.getDocKey(databaseId, collectionId, doc.$id);
            this.setDocumentKey(docKey, doc);
            // Prepend to matching collection queries (zero re-fetch sync)
            const collPrefix = this.getCollPrefix(databaseId, collectionId);
            for (const [qKey, data] of this.collectionQueries.entries()) {
                if (qKey.startsWith(collPrefix)) {
                    const exists = data.documents.some((d) => d.$id === doc.$id);
                    if (!exists) {
                        this.setCollectionQueryKey(qKey, {
                            documents: [doc, ...data.documents],
                            total: data.total + 1,
                        });
                        this.notify(qKey);
                    }
                }
            }
            this.notify(docKey);
        }
    }
    subscribeToKey(key, listener) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        const set = this.listeners.get(key);
        set.add(listener);
        return () => {
            set.delete(listener);
            if (set.size === 0) {
                this.listeners.delete(key);
            }
        };
    }
    notify(key) {
        const set = this.listeners.get(key);
        if (set) {
            set.forEach((listener) => {
                try {
                    listener();
                }
                catch (e) {
                    console.error(`[CacheFusionStore] Listener error for key ${key}:`, e);
                }
            });
        }
    }
    clear() {
        this.documents.clear();
        this.collectionQueries.clear();
        this.listeners.clear();
    }
}
