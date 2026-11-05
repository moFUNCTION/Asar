import type { Models } from "appwrite";
import type { UseCollectionOptions, WhereFilter } from "../types";
export interface UseCollectionReturn<T = Record<string, any>> {
    data: (T & Models.Document)[];
    documents: (T & Models.Document)[];
    total: number;
    loading: boolean;
    error: Error | null;
    page: number;
    totalPages: number;
    limit: number;
    search: string;
    setSearch: (search: string) => void;
    setFilter: (where: WhereFilter<T> | ((prev: WhereFilter<T>) => WhereFilter<T>)) => void;
    setSort: (field: keyof T | string, order?: "asc" | "desc") => void;
    setPage: (page: number | ((prev: number) => number)) => void;
    nextPage: () => void;
    prevPage: () => void;
    refetch: () => Promise<void>;
}
export declare function useCollection<T = Record<string, any>>(collectionId: string, options?: UseCollectionOptions<T>): UseCollectionReturn<T>;
export declare function useCollection<T = Record<string, any>>(databaseId: string, collectionId: string, options?: UseCollectionOptions<T>): UseCollectionReturn<T>;
//# sourceMappingURL=useCollection.d.ts.map