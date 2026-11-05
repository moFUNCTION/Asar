import { useCallback, useMemo } from "react";
import { useAppwrite } from "../Provider/useAppwrite";
export function useFileUrl() {
    const { storage } = useAppwrite();
    const getFileView = useCallback((bucketId, fileId) => {
        return storage.getFileView(bucketId, fileId);
    }, [storage]);
    const getFilePreview = useCallback((bucketId, fileId, options = {}) => {
        return storage.getFilePreview(bucketId, fileId, options.width, options.height, options.gravity, options.quality, options.borderWidth, options.borderColor, options.borderRadius, options.opacity, options.rotation, options.background, options.output);
    }, [storage]);
    const getFileDownloadUrl = useCallback((bucketId, fileId) => {
        return storage.getFileDownload(bucketId, fileId);
    }, [storage]);
    return useMemo(() => ({
        getFileView,
        getFilePreview,
        getFileDownloadUrl,
    }), [getFileView, getFilePreview, getFileDownloadUrl]);
}
