import { type UseCollectionReturn } from "./useCollection";
import type { UseRelatedDocumentsOptions } from "../types";
export declare function useRelatedDocuments<T = Record<string, any>>(targetCollectionId: string, parentDocumentId: string, relationshipAttribute: string, options?: Omit<UseRelatedDocumentsOptions<T>, "relationshipAttribute">): UseCollectionReturn<T>;
export declare function useRelatedDocuments<T = Record<string, any>>(databaseId: string, targetCollectionId: string, parentDocumentId: string, relationshipAttribute: string, options?: Omit<UseRelatedDocumentsOptions<T>, "relationshipAttribute">): UseCollectionReturn<T>;
//# sourceMappingURL=useRelatedDocuments.d.ts.map