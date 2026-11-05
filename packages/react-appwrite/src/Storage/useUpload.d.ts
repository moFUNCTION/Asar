import { type Models } from "appwrite";
import type { UseUploadOptions, UploadProgress } from "../types";
export interface UseUploadReturn {
    uploadFile: (file: File, fileId?: string) => Promise<Models.File>;
    uploadFiles: (files: File[]) => Promise<Models.File[]>;
    progress: Record<string, UploadProgress>;
    isUploading: boolean;
    error: Error | null;
    abort: (fileId?: string) => void;
}
export declare function useUpload(options: UseUploadOptions): UseUploadReturn;
//# sourceMappingURL=useUpload.d.ts.map