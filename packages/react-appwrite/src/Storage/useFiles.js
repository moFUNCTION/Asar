import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAppwrite } from "../Provider/useAppwrite";
export function useFiles(bucketId, options = {}) {
    const { storage, config } = useAppwrite();
    const [files, setFiles] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMountedRef = useRef(true);
    const enabled = options.enabled !== false && !!bucketId;
    // Stabilize queries array
    const queriesKey = useMemo(() => (options.queries ? options.queries.join("|") : ""), [options.queries]);
    const fetchFiles = useCallback(async () => {
        if (!enabled)
            return;
        setLoading(true);
        setError(null);
        try {
            const res = await storage.listFiles(bucketId, options.queries, options.search);
            if (isMountedRef.current) {
                setFiles(res.files);
                setTotal(res.total);
                setLoading(false);
            }
        }
        catch (err) {
            if (isMountedRef.current) {
                const errObj = err instanceof Error ? err : new Error(String(err));
                setError(errObj);
                setLoading(false);
                config.onError?.(err, `useFiles:fetchFiles:${bucketId}`);
            }
        }
    }, [storage, bucketId, queriesKey, options.search, enabled, config]);
    useEffect(() => {
        isMountedRef.current = true;
        fetchFiles();
        return () => {
            isMountedRef.current = false;
        };
    }, [fetchFiles]);
    const deleteFile = useCallback(async (fileId) => {
        try {
            await storage.deleteFile(bucketId, fileId);
            setFiles((prev) => prev.filter((f) => f.$id !== fileId));
            setTotal((prev) => Math.max(0, prev - 1));
        }
        catch (err) {
            const errObj = err instanceof Error ? err : new Error(String(err));
            config.onError?.(err, `useFiles:deleteFile:${bucketId}/${fileId}`);
            throw errObj;
        }
    }, [storage, bucketId, config]);
    const getFile = useCallback(async (fileId) => {
        try {
            return await storage.getFile(bucketId, fileId);
        }
        catch (err) {
            const errObj = err instanceof Error ? err : new Error(String(err));
            config.onError?.(err, `useFiles:getFile:${bucketId}/${fileId}`);
            throw errObj;
        }
    }, [storage, bucketId, config]);
    const updateFile = useCallback(async (fileId, name, permissions) => {
        try {
            const updated = await storage.updateFile(bucketId, fileId, name, permissions);
            setFiles((prev) => prev.map((f) => (f.$id === fileId ? updated : f)));
            return updated;
        }
        catch (err) {
            const errObj = err instanceof Error ? err : new Error(String(err));
            config.onError?.(err, `useFiles:updateFile:${bucketId}/${fileId}`);
            throw errObj;
        }
    }, [storage, bucketId, config]);
    return useMemo(() => ({
        files,
        total,
        loading,
        error,
        refetch: fetchFiles,
        deleteFile,
        getFile,
        updateFile,
    }), [files, total, loading, error, fetchFiles, deleteFile, getFile, updateFile]);
}
