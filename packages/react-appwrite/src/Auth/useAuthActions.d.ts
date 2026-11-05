import { OAuthProvider, type Models } from "appwrite";
export interface UseAuthActionsOptions {
    databaseId?: string;
}
export declare function useAuthActions(_options?: UseAuthActionsOptions): {
    loginWithEmail: (email: string, password: string) => Promise<Models.Session>;
    register: (email: string, password: string, name?: string, userId?: string) => Promise<Models.User<Models.Preferences>>;
    createUserWithEmail: (email: string, password: string, name?: string, userId?: string) => Promise<Models.User<Models.Preferences>>;
    loginWithOAuth: (provider: OAuthProvider | string, successUrl?: string, failureUrl?: string, scopes?: string[]) => void;
    loginWithMagicURL: (email: string, redirectUrl?: string, userId?: string) => Promise<Models.Token>;
    loginWithEmailOTP: (email: string, userId?: string) => Promise<Models.Token>;
    verifyEmailOTP: (userId: string, otp: string) => Promise<Models.Session>;
    loginWithPhone: (phone: string, userId?: string) => Promise<Models.Token>;
    verifyPhone: (userId: string, secret: string) => Promise<Models.Session>;
    loginWithAnonymous: () => Promise<Models.Session>;
    logout: (sessionId?: string) => Promise<void>;
    logoutAll: () => Promise<void>;
    createRecovery: (email: string, url: string) => Promise<Models.Token>;
    updateRecovery: (userId: string, secret: string, password: string) => Promise<Models.Token>;
    createVerification: (url: string) => Promise<Models.Token>;
    updateVerification: (userId: string, secret: string) => Promise<Models.Token>;
    createPhoneVerification: () => Promise<Models.Token>;
    updatePhoneVerification: (userId: string, secret: string) => Promise<Models.Token>;
    createJWT: () => Promise<Models.Jwt>;
    listIdentities: (queries?: string[]) => Promise<Models.IdentityList>;
    deleteIdentity: (identityId: string) => Promise<{}>;
    listLogs: (queries?: string[]) => Promise<Models.LogList>;
    isPending: boolean;
    error: Error | null;
};
//# sourceMappingURL=useAuthActions.d.ts.map