import { useState, useCallback, useMemo } from "react";
import { useAppwrite } from "../Provider/useAppwrite";
import { resolveDbAndCollection } from "./helpers";
export function useDocumentOperations(arg1, arg2) {
    const { databases, cacheFusion, config } = useAppwrite();
    const { databaseId, collectionId } = resolveDbAndCollection(config.databaseId, arg1, arg2);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // Helper to get fresh or cached document
    const getDoc = useCallback(async (documentId) => {
        const cached = cacheFusion.getDocument(databaseId, collectionId, documentId);
        if (cached)
            return cached;
        const fetched = await databases.getDocument(databaseId, collectionId, documentId);
        cacheFusion.setDocument(databaseId, collectionId, fetched);
        return fetched;
    }, [databases, databaseId, collectionId, cacheFusion]);
    const patchDocument = useCallback(async (documentId, data, permissions) => {
        setIsLoading(true);
        setError(null);
        const previousDoc = cacheFusion.getDocument(databaseId, collectionId, documentId);
        // Optimistic cache update
        if (previousDoc) {
            const optimisticDoc = {
                ...previousDoc,
                ...data,
                $updatedAt: new Date().toISOString(),
                ...(permissions ? { $permissions: permissions } : {}),
            };
            cacheFusion.setDocument(databaseId, collectionId, optimisticDoc);
        }
        try {
            const updated = await databases.updateDocument(databaseId, collectionId, documentId, data, permissions);
            cacheFusion.setDocument(databaseId, collectionId, updated);
            setIsLoading(false);
            return updated;
        }
        catch (err) {
            if (previousDoc) {
                cacheFusion.setDocument(databaseId, collectionId, previousDoc);
            }
            const errorObj = err instanceof Error ? err : new Error(String(err));
            setError(errorObj);
            setIsLoading(false);
            config.onError?.(err, `useDocumentOperations:patchDocument:${databaseId}/${collectionId}/${documentId}`);
            throw errorObj;
        }
    }, [databases, databaseId, collectionId, cacheFusion, config]);
    const upsertDocument = useCallback(async (documentId, data, permissions) => {
        setIsLoading(true);
        setError(null);
        try {
            // Try updating first
            const updated = await databases.updateDocument(databaseId, collectionId, documentId, data, permissions);
            cacheFusion.setDocument(databaseId, collectionId, updated);
            setIsLoading(false);
            return updated;
        }
        catch (err) {
            const isNotFound = err?.code === 404 ||
                err?.type === "document_not_found" ||
                String(err?.message).toLowerCase().includes("could not be found");
            if (isNotFound) {
                try {
                    // Create document with the specified ID
                    const created = await databases.createDocument(databaseId, collectionId, documentId, data, permissions);
                    cacheFusion.setDocument(databaseId, collectionId, created);
                    setIsLoading(false);
                    return created;
                }
                catch (createErr) {
                    const errorObj = createErr instanceof Error ? createErr : new Error(String(createErr));
                    setError(errorObj);
                    setIsLoading(false);
                    config.onError?.(createErr, `useDocumentOperations:upsertDocument:create:${databaseId}/${collectionId}/${documentId}`);
                    throw errorObj;
                }
            }
            const errorObj = err instanceof Error ? err : new Error(String(err));
            setError(errorObj);
            setIsLoading(false);
            config.onError?.(err, `useDocumentOperations:upsertDocument:update:${databaseId}/${collectionId}/${documentId}`);
            throw errorObj;
        }
    }, [databases, databaseId, collectionId, cacheFusion, config]);
    const incrementField = useCallback(async (documentId, field, amount = 1) => {
        const doc = await getDoc(documentId);
        const currentVal = Number(doc[field]) || 0;
        const newVal = currentVal + amount;
        return patchDocument(documentId, { [field]: newVal });
    }, [getDoc, patchDocument]);
    const decrementField = useCallback(async (documentId, field, amount = 1) => {
        return incrementField(documentId, field, -amount);
    }, [incrementField]);
    const arrayUnion = useCallback(async (documentId, field, items) => {
        const doc = await getDoc(documentId);
        const currentArr = Array.isArray(doc[field])
            ? [...doc[field]]
            : [];
        const itemsToAdd = Array.isArray(items) ? items : [items];
        for (const item of itemsToAdd) {
            if (!currentArr.includes(item)) {
                currentArr.push(item);
            }
        }
        return patchDocument(documentId, { [field]: currentArr });
    }, [getDoc, patchDocument]);
    const arrayRemove = useCallback(async (documentId, field, items) => {
        const doc = await getDoc(documentId);
        const currentArr = Array.isArray(doc[field])
            ? [...doc[field]]
            : [];
        const itemsToRemove = Array.isArray(items) ? items : [items];
        const filtered = currentArr.filter((val) => !itemsToRemove.includes(val));
        return patchDocument(documentId, { [field]: filtered });
    }, [getDoc, patchDocument]);
    const softDelete = useCallback(async (documentId, softDeleteField = "isDeleted") => {
        return patchDocument(documentId, {
            [softDeleteField]: true,
            deletedAt: new Date().toISOString(),
        });
    }, [patchDocument]);
    const restore = useCallback(async (documentId, softDeleteField = "isDeleted") => {
        return patchDocument(documentId, {
            [softDeleteField]: false,
            deletedAt: null,
        });
    }, [patchDocument]);
    return useMemo(() => ({
        upsertDocument,
        patchDocument,
        incrementField,
        decrementField,
        arrayUnion,
        arrayRemove,
        softDelete,
        restore,
        isLoading,
        error,
    }), [
        upsertDocument,
        patchDocument,
        incrementField,
        decrementField,
        arrayUnion,
        arrayRemove,
        softDelete,
        restore,
        isLoading,
        error,
    ]);
}
