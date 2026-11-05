import type { Models } from "appwrite";
export interface UseFilesOptions {
    queries?: string[];
    search?: string;
    enabled?: boolean;
}
export interface UseFilesReturn {
    files: Models.File[];
    total: number;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    deleteFile: (fileId: string) => Promise<void>;
    getFile: (fileId: string) => Promise<Models.File>;
    updateFile: (fileId: string, name?: string, permissions?: string[]) => Promise<Models.File>;
}
export declare function useFiles(bucketId: string, options?: UseFilesOptions): UseFilesReturn;
//# sourceMappingURL=useFiles.d.ts.map