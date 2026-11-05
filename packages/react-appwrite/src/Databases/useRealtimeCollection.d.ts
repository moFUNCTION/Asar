import type { RealtimeEventPayload } from "../types";
export declare function useRealtimeCollection<T = Record<string, any>>(collectionId: string, onEvent?: (event: RealtimeEventPayload<T>) => void): void;
export declare function useRealtimeCollection<T = Record<string, any>>(databaseId: string, collectionId: string, onEvent?: (event: RealtimeEventPayload<T>) => void): void;
//# sourceMappingURL=useRealtimeCollection.d.ts.map