import type { Models } from "appwrite";
import type { UseInfiniteCollectionOptions, WhereFilter } from "../types";
export interface UseInfiniteCollectionReturn<T = Record<string, any>> {
    data: (T & Models.Document)[];
    documents: (T & Models.Document)[];
    total: number;
    loading: boolean;
    isFetchingNextPage: boolean;
    isLoadingMore: boolean;
    hasNextPage: boolean;
    hasMore: boolean;
    error: Error | null;
    search: string;
    setSearch: (search: string) => void;
    setFilter: (where: WhereFilter<T> | ((prev: WhereFilter<T>) => WhereFilter<T>)) => void;
    fetchNextPage: () => Promise<void>;
    loadMore: () => Promise<void>;
    refetch: () => Promise<void>;
}
export declare function useInfiniteCollection<T = Record<string, any>>(collectionId: string, options?: UseInfiniteCollectionOptions<T>): UseInfiniteCollectionReturn<T>;
export declare function useInfiniteCollection<T = Record<string, any>>(databaseId: string, collectionId: string, options?: UseInfiniteCollectionOptions<T>): UseInfiniteCollectionReturn<T>;
//# sourceMappingURL=useInfiniteCollection.d.ts.map