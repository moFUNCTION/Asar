import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { ID } from "appwrite";
import { useAppwrite } from "../Provider/useAppwrite";
export function useUpload(options) {
    const { storage, config } = useAppwrite();
    const [progress, setProgress] = useState({});
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const abortControllersRef = useRef(new Map());
    const onProgressRef = useRef(options.onProgress);
    useEffect(() => {
        onProgressRef.current = options.onProgress;
    }, [options.onProgress]);
    const { bucketId, permissions } = options;
    const permissionsKey = useMemo(() => (permissions ? permissions.join(",") : ""), [permissions]);
    const uploadFile = useCallback(async (file, fileId = ID.unique()) => {
        setIsUploading(true);
        setError(null);
        const controller = new AbortController();
        abortControllersRef.current.set(fileId, controller);
        const initialProgress = {
            fileId,
            fileName: file.name,
            fileSize: file.size,
            bytesUploaded: 0,
            percentage: 0,
            status: "uploading",
        };
        setProgress((prev) => ({ ...prev, [fileId]: initialProgress }));
        onProgressRef.current?.(initialProgress);
        try {
            const result = await storage.createFile(bucketId, fileId, file, permissions, (p) => {
                const currentProgress = {
                    fileId,
                    fileName: file.name,
                    fileSize: file.size,
                    bytesUploaded: p.sizeUploaded,
                    percentage: Math.round(p.progress),
                    status: "uploading",
                };
                setProgress((prev) => ({ ...prev, [fileId]: currentProgress }));
                onProgressRef.current?.(currentProgress);
            });
            setProgress((prev) => ({
                ...prev,
                [fileId]: {
                    ...prev[fileId],
                    bytesUploaded: file.size,
                    percentage: 100,
                    status: "completed",
                },
            }));
            setIsUploading(false);
            abortControllersRef.current.delete(fileId);
            return result;
        }
        catch (err) {
            const isAborted = controller.signal.aborted;
            const errStatus = isAborted ? "aborted" : "error";
            setProgress((prev) => ({
                ...prev,
                [fileId]: {
                    ...prev[fileId],
                    status: errStatus,
                },
            }));
            const errorObj = err instanceof Error ? err : new Error(String(err));
            setError(errorObj);
            setIsUploading(false);
            abortControllersRef.current.delete(fileId);
            config.onError?.(err, `useUpload:uploadFile:${bucketId}/${fileId}`);
            throw errorObj;
        }
    }, [storage, bucketId, permissionsKey, permissions, config]);
    const uploadFiles = useCallback(async (files) => {
        const results = [];
        for (const file of files) {
            const res = await uploadFile(file);
            results.push(res);
        }
        return results;
    }, [uploadFile]);
    const abort = useCallback((fileId) => {
        if (fileId) {
            const ctrl = abortControllersRef.current.get(fileId);
            if (ctrl) {
                ctrl.abort();
                abortControllersRef.current.delete(fileId);
            }
        }
        else {
            abortControllersRef.current.forEach((ctrl) => ctrl.abort());
            abortControllersRef.current.clear();
        }
    }, []);
    return useMemo(() => ({
        uploadFile,
        uploadFiles,
        progress,
        isUploading,
        error,
        abort,
    }), [uploadFile, uploadFiles, progress, isUploading, error, abort]);
}
