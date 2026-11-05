import { type Models } from "appwrite";
export interface UseMutationsReturn<T = Record<string, any>> {
    createDocument: (data: Partial<T>, documentId?: string, permissions?: string[]) => Promise<T & Models.Document>;
    updateDocument: (documentId: string, data: Partial<T>, permissions?: string[]) => Promise<T & Models.Document>;
    deleteDocument: (documentId: string, softDelete?: boolean) => Promise<void>;
    isLoading: boolean;
    error: Error | null;
}
export declare function useMutations<T = Record<string, any>>(collectionId: string): UseMutationsReturn<T>;
export declare function useMutations<T = Record<string, any>>(databaseId: string, collectionId: string): UseMutationsReturn<T>;
//# sourceMappingURL=useMutations.d.ts.map