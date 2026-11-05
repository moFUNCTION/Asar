import { AuthenticatorType, type Models, AuthenticationFactor } from "appwrite";
export declare function useMFA(): {
    getFactors: () => Promise<Models.MfaFactors>;
    enableMFA: () => Promise<Models.User<Models.Preferences>>;
    disableMFA: () => Promise<Models.User<Models.Preferences>>;
    createAuthenticator: (type?: AuthenticatorType) => Promise<Models.MfaType>;
    verifyAuthenticator: (type: AuthenticatorType, otp: string) => Promise<Models.User<Models.Preferences>>;
    deleteAuthenticator: (type: AuthenticatorType) => Promise<void>;
    challengeMFA: (factor: AuthenticationFactor) => Promise<Models.MfaChallenge>;
    completeChallenge: (challengeId: string, otp: string) => Promise<void>;
    createRecoveryCodes: () => Promise<Models.MfaRecoveryCodes>;
    getRecoveryCodes: () => Promise<Models.MfaRecoveryCodes>;
    isLoading: boolean;
    error: Error | null;
};
//# sourceMappingURL=useMFA.d.ts.map