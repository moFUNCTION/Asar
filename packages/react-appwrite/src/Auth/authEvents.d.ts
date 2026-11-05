import type { Models } from "appwrite";
export type AuthEventType = "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED" | "USER_UPDATED" | "EMAIL_VERIFIED";
export interface AuthEventPayload {
    type: AuthEventType;
    user?: Models.User<any> | null;
    session?: Models.Session | null;
    timestamp: number;
}
export type AuthStateListener = (payload: AuthEventPayload) => void;
declare class AuthEventEmitter {
    private listeners;
    /**
     * Subscribe to global authentication state changes.
     * Returns an unsubscribe function.
     */
    subscribe(listener: AuthStateListener): () => void;
    /**
     * Emit an authentication event to all active listeners.
     */
    emit(type: AuthEventType, data?: {
        user?: Models.User<any> | null;
        session?: Models.Session | null;
    }): void;
}
export declare const authEvents: AuthEventEmitter;
export {};
//# sourceMappingURL=authEvents.d.ts.map