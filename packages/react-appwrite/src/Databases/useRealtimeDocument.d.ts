import type { RealtimeEventPayload } from "../types";
export declare function useRealtimeDocument<T = Record<string, any>>(collectionId: string, documentId: string, onEvent?: (event: RealtimeEventPayload<T>) => void): void;
export declare function useRealtimeDocument<T = Record<string, any>>(databaseId: string, collectionId: string, documentId: string, onEvent?: (event: RealtimeEventPayload<T>) => void): void;
//# sourceMappingURL=useRealtimeDocument.d.ts.map