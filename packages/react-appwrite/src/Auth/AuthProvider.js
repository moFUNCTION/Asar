import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useMemo } from "react";
import { useUser } from "./useUser";
import { useAuthActions } from "./useAuthActions";
export const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
    const { user, profile, isLoading, error: userError, isAuthenticated, refresh, updatePrefs, updateProfile, } = useUser({ standalone: true });
    const { loginWithEmail, register, createUserWithEmail, loginWithOAuth, loginWithMagicURL, loginWithEmailOTP, verifyEmailOTP, loginWithPhone, verifyPhone, loginWithAnonymous, logout, logoutAll, createRecovery, updateRecovery, createVerification, updateVerification, createPhoneVerification, updatePhoneVerification, createJWT, listIdentities, deleteIdentity, listLogs, isPending, error: actionError, } = useAuthActions();
    const value = useMemo(() => {
        return {
            user,
            profile,
            isLoading,
            isPending,
            error: actionError || userError,
            isAuthenticated,
            loginWithEmail,
            loginWithOAuth,
            loginWithMagicURL,
            loginWithEmailOTP,
            verifyEmailOTP,
            loginWithPhone,
            verifyPhone,
            loginWithAnonymous,
            logout,
            logoutAll,
            register,
            createUserWithEmail,
            createRecovery,
            updateRecovery,
            createVerification,
            updateVerification,
            createPhoneVerification,
            updatePhoneVerification,
            createJWT,
            listIdentities,
            deleteIdentity,
            listLogs,
            updatePrefs,
            updateProfile,
            refresh,
        };
    }, [
        user,
        profile,
        isLoading,
        isPending,
        userError,
        actionError,
        isAuthenticated,
        loginWithEmail,
        loginWithOAuth,
        loginWithMagicURL,
        loginWithEmailOTP,
        verifyEmailOTP,
        loginWithPhone,
        verifyPhone,
        loginWithAnonymous,
        logout,
        logoutAll,
        register,
        createUserWithEmail,
        createRecovery,
        updateRecovery,
        createVerification,
        updateVerification,
        createPhoneVerification,
        updatePhoneVerification,
        createJWT,
        listIdentities,
        deleteIdentity,
        listLogs,
        updatePrefs,
        updateProfile,
        refresh,
    ]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
};
/**
 * Hook to access Appwrite auth state and methods from AuthProvider.
 *
 * @example
 * const { user, register, loginWithEmail, logout } = useAuth();
 *
 * await register("jane@example.com", "Secret123!", "Jane Doe");
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider. Wrap your component tree with <AuthProvider>.");
    }
    return context;
}
/**
 * Alias for `useAuth` for naming parity with `useFirebaseAuth` in `@repo/react-fire`.
 */
export const useAppwriteAuth = useAuth;
