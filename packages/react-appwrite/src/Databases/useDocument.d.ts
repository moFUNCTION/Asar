import { type Models } from "appwrite";
import type { UseDocumentOptions } from "../types";
export interface UseDocumentReturn<T = Record<string, any>> {
    data: (T & Models.Document) | null;
    document: (T & Models.Document) | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}
export declare function useDocument<T = Record<string, any>>(collectionId: string, documentId: string, options?: UseDocumentOptions<T>): UseDocumentReturn<T>;
export declare function useDocument<T = Record<string, any>>(databaseId: string, collectionId: string, documentId: string, options?: UseDocumentOptions<T>): UseDocumentReturn<T>;
//# sourceMappingURL=useDocument.d.ts.map