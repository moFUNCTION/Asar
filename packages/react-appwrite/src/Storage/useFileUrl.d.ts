import type { ImageTransformOptions } from "../types";
export declare function useFileUrl(): {
    getFileView: (bucketId: string, fileId: string) => string;
    getFilePreview: (bucketId: string, fileId: string, options?: ImageTransformOptions) => string;
    getFileDownloadUrl: (bucketId: string, fileId: string) => string;
};
//# sourceMappingURL=useFileUrl.d.ts.map