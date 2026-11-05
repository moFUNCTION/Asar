import { useState, useCallback, useMemo } from "react";
import { ID } from "appwrite";
import { useAppwrite } from "../Provider/useAppwrite";
import { resolveDbAndCollection } from "./helpers";
export function useMutations(arg1, arg2) {
    const { databases, cacheFusion, config } = useAppwrite();
    const { databaseId, collectionId } = resolveDbAndCollection(config.databaseId, arg1, arg2);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const createDocument = useCallback(async (data, documentId = ID.unique(), permissions) => {
        setIsLoading(true);
        setError(null);
        // Optimistic document creation
        const optimisticDoc = {
            ...data,
            $id: documentId,
            $databaseId: databaseId,
            $collectionId: collectionId,
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
            $permissions: permissions || [],
        };
        // Apply optimistic update to cache fusion
        cacheFusion.setDocument(databaseId, collectionId, optimisticDoc);
        try {
            const created = await databases.createDocument(databaseId, collectionId, documentId, data, permissions);
            // Commit official server document to cache
            cacheFusion.setDocument(databaseId, collectionId, created);
            setIsLoading(false);
            return created;
        }
        catch (err) {
            // Rollback optimistic create on failure
            cacheFusion.removeDocument(databaseId, collectionId, documentId);
            const errorObj = err instanceof Error ? err : new Error(String(err));
            setError(errorObj);
            setIsLoading(false);
            config.onError?.(err, `useMutations:createDocument:${databaseId}/${collectionId}`);
            throw errorObj;
        }
    }, [databases, databaseId, collectionId, cacheFusion, config]);
    const updateDocument = useCallback(async (documentId, data, permissions) => {
        setIsLoading(true);
        setError(null);
        // Backup previous document for rollback
        const previousDoc = cacheFusion.getDocument(databaseId, collectionId, documentId);
        // Apply optimistic update
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
            // Rollback on failure
            if (previousDoc) {
                cacheFusion.setDocument(databaseId, collectionId, previousDoc);
            }
            const errorObj = err instanceof Error ? err : new Error(String(err));
            setError(errorObj);
            setIsLoading(false);
            config.onError?.(err, `useMutations:updateDocument:${databaseId}/${collectionId}/${documentId}`);
            throw errorObj;
        }
    }, [databases, databaseId, collectionId, cacheFusion, config]);
    const deleteDocument = useCallback(async (documentId, softDelete = false) => {
        setIsLoading(true);
        setError(null);
        if (softDelete) {
            await updateDocument(documentId, {
                isDeleted: true,
                deletedAt: new Date().toISOString(),
            });
            return;
        }
        // Backup previous document for rollback
        const previousDoc = cacheFusion.getDocument(databaseId, collectionId, documentId);
        // Optimistic delete
        cacheFusion.removeDocument(databaseId, collectionId, documentId);
        try {
            await databases.deleteDocument(databaseId, collectionId, documentId);
            setIsLoading(false);
        }
        catch (err) {
            // Rollback on failure
            if (previousDoc) {
                cacheFusion.setDocument(databaseId, collectionId, previousDoc);
            }
            const errorObj = err instanceof Error ? err : new Error(String(err));
            setError(errorObj);
            setIsLoading(false);
            config.onError?.(err, `useMutations:deleteDocument:${databaseId}/${collectionId}/${documentId}`);
            throw errorObj;
        }
    }, [databases, databaseId, collectionId, cacheFusion, updateDocument, config]);
    return useMemo(() => ({
        createDocument,
        updateDocument,
        deleteDocument,
        isLoading,
        error,
    }), [createDocument, updateDocument, deleteDocument, isLoading, error]);
}
