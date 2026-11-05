import React from "react";
import type { Models } from "appwrite";
import type { AuthProviderProps, UseAuthReturn } from "../types";
export declare const AuthContext: React.Context<UseAuthReturn<any> | null>;
export declare const AuthProvider: React.FC<AuthProviderProps>;
/**
 * Hook to access Appwrite auth state and methods from AuthProvider.
 *
 * @example
 * const { user, register, loginWithEmail, logout } = useAuth();
 *
 * await register("jane@example.com", "Secret123!", "Jane Doe");
 */
export declare function useAuth<TPreferences extends Models.Preferences = Models.Preferences>(): UseAuthReturn<TPreferences>;
/**
 * Alias for `useAuth` for naming parity with `useFirebaseAuth` in `@repo/react-fire`.
 */
export declare const useAppwriteAuth: typeof useAuth;
//# sourceMappingURL=AuthProvider.d.ts.map