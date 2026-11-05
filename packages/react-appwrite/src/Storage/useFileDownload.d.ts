export declare function useFileDownload(): {
    downloadFile: (bucketId: string, fileId: string, customFileName?: string) => Promise<Blob>;
    isDownloading: boolean;
    error: Error | null;
};
//# sourceMappingURL=useFileDownload.d.ts.map