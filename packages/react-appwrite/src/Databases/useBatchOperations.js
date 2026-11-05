import { useState, useCallback, useMemo } from "react";
import { ID } from "appwrite";
import { useAppwrite } from "../Provider/useAppwrite";
import { resolveDbAndCollection } from "./helpers";
// Utility to slice array into chunks
function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}
export function useBatchOperations(arg1, arg2) {
    const { databases, cacheFusion, config } = useAppwrite();
    const { databaseId, collectionId } = resolveDbAndCollection(config.databaseId, arg1, arg2);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState({
        completed: 0,
        total: 0,
        percent: 0,
    });
    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
        setProgress({ completed: 0, total: 0, percent: 0 });
    }, []);
    const bulkCreate = useCallback(async (documents, options) => {
        if (!documents || documents.length === 0) {
            return { succeeded: [], succeededIds: [], failed: [], totalProcessed: 0 };
        }
        setIsLoading(true);
        setError(null);
        const chunkSize = options?.chunkSize || 5;
        const continueOnError = options?.continueOnError !== false;
        const total = documents.length;
        let completed = 0;
        const succeeded = [];
        const succeededIds = [];
        const failed = [];
        const chunks = chunkArray(documents, chunkSize);
        try {
            for (const chunk of chunks) {
                const promises = chunk.map(async (docData) => {
                    const docId = ID.unique();
                    try {
                        const res = await databases.createDocument(databaseId, collectionId, docId, docData, options?.permissions);
                        cacheFusion.setDocument(databaseId, collectionId, res);
                        return { success: true, doc: res, id: res.$id };
                    }
                    catch (err) {
                        const errorObj = err instanceof Error ? err : new Error(String(err));
                        if (!continueOnError)
                            throw errorObj;
                        return { success: false, item: docData, error: errorObj };
                    }
                });
                const results = await Promise.all(promises);
                for (const res of results) {
                    if (res.success && res.doc) {
                        succeeded.push(res.doc);
                        succeededIds.push(res.id);
                    }
                    else if (!res.success && res.error) {
                        failed.push({ item: res.item, error: res.error });
                    }
                }
                completed += chunk.length;
                const currentProgress = {
                    completed,
                    total,
                    percent: Math.round((completed / total) * 100),
                };
                setProgress(currentProgress);
                options?.onProgress?.(currentProgress);
            }
            setIsLoading(false);
            return { succeeded, succeededIds, failed, totalProcessed: total };
        }
        catch (err) {
            const errorObj = err instanceof Error ? err : new Error(String(err));
            setError(errorObj);
            setIsLoading(false);
            config.onError?.(err, `useBatchOperations:bulkCreate:${databaseId}/${collectionId}`);
            throw errorObj;
        }
    }, [databases, databaseId, collectionId, cacheFusion, config]);
    const bulkUpdate = useCallback(async (updates, options) => {
        if (!updates || updates.length === 0) {
            return { succeeded: [], succeededIds: [], failed: [], totalProcessed: 0 };
        }
        setIsLoading(true);
        setError(null);
        const chunkSize = options?.chunkSize || 5;
        const continueOnError = options?.continueOnError !== false;
        const total = updates.length;
        let completed = 0;
        const succeeded = [];
        const succeededIds = [];
        const failed = [];
        const chunks = chunkArray(updates, chunkSize);
        try {
            for (const chunk of chunks) {
                const promises = chunk.map(async (u) => {
                    try {
                        const res = await databases.updateDocument(databaseId, collectionId, u.documentId, u.data, u.permissions);
                        cacheFusion.setDocument(databaseId, collectionId, res);
                        return { success: true, doc: res, id: res.$id };
                    }
                    catch (err) {
                        const errorObj = err instanceof Error ? err : new Error(String(err));
                        if (!continueOnError)
                            throw errorObj;
                        return { success: false, item: u, error: errorObj };
                    }
                });
                const results = await Promise.all(promises);
                for (const res of results) {
                    if (res.success && res.doc) {
                        succeeded.push(res.doc);
                        succeededIds.push(res.id);
                    }
                    else if (!res.success && res.error) {
                        failed.push({ item: res.item, error: res.error });
                    }
                }
                completed += chunk.length;
                const currentProgress = {
                    completed,
                    total,
                    percent: Math.round((completed / total) * 100),
                };
                setProgress(currentProgress);
                options?.onProgress?.(currentProgress);
            }
            setIsLoading(false);
            return { succeeded, succeededIds, failed, totalProcessed: total };
        }
        catch (err) {
            const errorObj = err instanceof Error ? err : new Error(String(err));
            setError(errorObj);
            setIsLoading(false);
            config.onError?.(err, `useBatchOperations:bulkUpdate:${databaseId}/${collectionId}`);
            throw errorObj;
        }
    }, [databases, databaseId, collectionId, cacheFusion, config]);
    const bulkDelete = useCallback(async (documentIds, options) => {
        if (!documentIds || documentIds.length === 0) {
            return { succeeded: [], succeededIds: [], failed: [], totalProcessed: 0 };
        }
        setIsLoading(true);
        setError(null);
        const chunkSize = options?.chunkSize || 5;
        const continueOnError = options?.continueOnError !== false;
        const total = documentIds.length;
        let completed = 0;
        const succeededIds = [];
        const failed = [];
        const chunks = chunkArray(documentIds, chunkSize);
        try {
            for (const chunk of chunks) {
                const promises = chunk.map(async (docId) => {
                    try {
                        await databases.deleteDocument(databaseId, collectionId, docId);
                        cacheFusion.removeDocument(databaseId, collectionId, docId);
                        return { success: true, id: docId };
                    }
                    catch (err) {
                        const errorObj = err instanceof Error ? err : new Error(String(err));
                        if (!continueOnError)
                            throw errorObj;
                        return { success: false, item: docId, error: errorObj };
                    }
                });
                const results = await Promise.all(promises);
                for (const res of results) {
                    if (res.success && res.id) {
                        succeededIds.push(res.id);
                    }
                    else if (!res.success && res.error) {
                        failed.push({ item: res.item, error: res.error });
                    }
                }
                completed += chunk.length;
                const currentProgress = {
                    completed,
                    total,
                    percent: Math.round((completed / total) * 100),
                };
                setProgress(currentProgress);
                options?.onProgress?.(currentProgress);
            }
            setIsLoading(false);
            return {
                succeeded: succeededIds,
                succeededIds,
                failed,
                totalProcessed: total,
            };
        }
        catch (err) {
            const errorObj = err instanceof Error ? err : new Error(String(err));
            setError(errorObj);
            setIsLoading(false);
            config.onError?.(err, `useBatchOperations:bulkDelete:${databaseId}/${collectionId}`);
            throw errorObj;
        }
    }, [databases, databaseId, collectionId, cacheFusion, config]);
    return useMemo(() => ({
        bulkCreate,
        bulkUpdate,
        bulkDelete,
        isLoading,
        progress,
        error,
        reset,
    }), [bulkCreate, bulkUpdate, bulkDelete, isLoading, progress, error, reset]);
}
