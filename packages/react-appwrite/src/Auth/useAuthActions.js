import { useState, useCallback, useMemo } from "react";
import { ID } from "appwrite";
import { useAppwrite } from "../Provider/useAppwrite";
import { authEvents } from "./authEvents";
export function useAuthActions(_options = {}) {
    const { account, setSessionSecret, setJWT, config, cacheFusion } = useAppwrite();
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);
    const executeAction = useCallback(async (actionFn, contextName) => {
        setIsPending(true);
        setError(null);
        try {
            const result = await actionFn();
            setIsPending(false);
            return result;
        }
        catch (err) {
            const errorObj = err instanceof Error ? err : new Error(String(err));
            setError(errorObj);
            setIsPending(false);
            config.onError?.(err, `useAuthActions:${contextName}`);
            throw errorObj;
        }
    }, [config]);
    const loginWithEmail = useCallback(async (email, password) => {
        return executeAction(async () => {
            let session;
            try {
                session = await account.createEmailPasswordSession(email, password);
            }
            catch (err) {
                if (err?.code === 409 ||
                    String(err?.message || "").includes("Creation of a session is prohibited") ||
                    err?.type === "user_session_already_exists") {
                    try {
                        await account.deleteSession("current");
                    }
                    catch { }
                    session = await account.createEmailPasswordSession(email, password);
                }
                else {
                    throw err;
                }
            }
            cacheFusion?.clear();
            if (session.secret) {
                setSessionSecret(session.secret);
            }
            try {
                const authedUser = await account.get();
                authEvents.emit("SIGNED_IN", { user: authedUser, session });
            }
            catch {
                authEvents.emit("SIGNED_IN", { session });
            }
            return session;
        }, "loginWithEmail");
    }, [account, executeAction, setSessionSecret, cacheFusion]);
    const register = useCallback(async (email, password, name, userId = ID.unique()) => {
        return executeAction(async () => {
            // 0. Proactively terminate any existing session to prevent "Creation of a session is prohibited"
            try {
                await account.deleteSession("current");
            }
            catch {
                // No active session, ignore
            }
            setSessionSecret(null);
            cacheFusion?.clear();
            // 1. Create Appwrite auth user
            const newUser = await account.create(userId, email, password, name);
            // 2. Automatically create session for the new user
            const session = await account.createEmailPasswordSession(email, password);
            if (session.secret) {
                setSessionSecret(session.secret);
            }
            let authedUser = newUser;
            try {
                authedUser = await account.get();
            }
            catch { }
            authEvents.emit("SIGNED_IN", { user: authedUser, session });
            return newUser;
        }, "register");
    }, [account, executeAction, setSessionSecret, cacheFusion]);
    const createUserWithEmail = useCallback(async (email, password, name, userId) => {
        return await register(email, password, name, userId);
    }, [register]);
    const loginWithOAuth = useCallback((provider, successUrl = window.location.href, failureUrl = window.location.href, scopes) => {
        try {
            account.createOAuth2Session(provider, successUrl, failureUrl, scopes);
        }
        catch (err) {
            config.onError?.(err, "useAuthActions:loginWithOAuth");
            throw err;
        }
    }, [account, config]);
    const loginWithMagicURL = useCallback(async (email, redirectUrl = window.location.href, userId = ID.unique()) => {
        return executeAction(async () => {
            return await account.createMagicURLToken(userId, email, redirectUrl);
        }, "loginWithMagicURL");
    }, [account, executeAction]);
    const loginWithEmailOTP = useCallback(async (email, userId = ID.unique()) => {
        return executeAction(async () => {
            return await account.createEmailToken(userId, email);
        }, "loginWithEmailOTP");
    }, [account, executeAction]);
    const verifyEmailOTP = useCallback(async (userId, otp) => {
        return executeAction(async () => {
            const session = await account.createSession(userId, otp);
            if (session.secret) {
                setSessionSecret(session.secret);
            }
            try {
                const user = await account.get();
                authEvents.emit("SIGNED_IN", { user, session });
            }
            catch {
                authEvents.emit("SIGNED_IN", { session });
            }
            return session;
        }, "verifyEmailOTP");
    }, [account, executeAction, setSessionSecret]);
    const loginWithPhone = useCallback(async (phone, userId = ID.unique()) => {
        return executeAction(async () => {
            return await account.createPhoneToken(userId, phone);
        }, "loginWithPhone");
    }, [account, executeAction]);
    const verifyPhone = useCallback(async (userId, secret) => {
        return executeAction(async () => {
            const session = await account.createSession(userId, secret);
            if (session.secret) {
                setSessionSecret(session.secret);
            }
            try {
                const user = await account.get();
                authEvents.emit("SIGNED_IN", { user, session });
            }
            catch {
                authEvents.emit("SIGNED_IN", { session });
            }
            return session;
        }, "verifyPhone");
    }, [account, executeAction, setSessionSecret]);
    const loginWithAnonymous = useCallback(async () => {
        return executeAction(async () => {
            const session = await account.createAnonymousSession();
            if (session.secret) {
                setSessionSecret(session.secret);
            }
            try {
                const user = await account.get();
                authEvents.emit("SIGNED_IN", { user, session });
            }
            catch {
                authEvents.emit("SIGNED_IN", { session });
            }
            return session;
        }, "loginWithAnonymous");
    }, [account, executeAction, setSessionSecret]);
    const logout = useCallback(async (sessionId = "current") => {
        return executeAction(async () => {
            try {
                await account.deleteSession(sessionId);
            }
            catch { }
            setSessionSecret(null);
            setJWT(null);
            cacheFusion?.clear();
            authEvents.emit("SIGNED_OUT");
        }, "logout");
    }, [account, executeAction, setSessionSecret, setJWT, cacheFusion]);
    const logoutAll = useCallback(async () => {
        return executeAction(async () => {
            try {
                await account.deleteSessions();
            }
            catch { }
            setSessionSecret(null);
            setJWT(null);
            cacheFusion?.clear();
            authEvents.emit("SIGNED_OUT");
        }, "logoutAll");
    }, [account, executeAction, setSessionSecret, setJWT, cacheFusion]);
    const createRecovery = useCallback(async (email, url) => {
        return executeAction(async () => {
            return await account.createRecovery(email, url);
        }, "createRecovery");
    }, [account, executeAction]);
    const updateRecovery = useCallback(async (userId, secret, password) => {
        return executeAction(async () => {
            return await account.updateRecovery(userId, secret, password);
        }, "updateRecovery");
    }, [account, executeAction]);
    const createVerification = useCallback(async (url) => {
        return executeAction(async () => {
            return await account.createVerification(url);
        }, "createVerification");
    }, [account, executeAction]);
    const updateVerification = useCallback(async (userId, secret) => {
        return executeAction(async () => {
            const token = await account.updateVerification(userId, secret);
            authEvents.emit("EMAIL_VERIFIED");
            return token;
        }, "updateVerification");
    }, [account, executeAction]);
    const createPhoneVerification = useCallback(async () => {
        return executeAction(async () => {
            return await account.createPhoneVerification();
        }, "createPhoneVerification");
    }, [account, executeAction]);
    const updatePhoneVerification = useCallback(async (userId, secret) => {
        return executeAction(async () => {
            return await account.updatePhoneVerification(userId, secret);
        }, "updatePhoneVerification");
    }, [account, executeAction]);
    const createJWT = useCallback(async () => {
        return executeAction(async () => {
            return await account.createJWT();
        }, "createJWT");
    }, [account, executeAction]);
    const listIdentities = useCallback(async (queries) => {
        return executeAction(async () => {
            return await account.listIdentities(queries);
        }, "listIdentities");
    }, [account, executeAction]);
    const deleteIdentity = useCallback(async (identityId) => {
        return executeAction(async () => {
            return await account.deleteIdentity(identityId);
        }, "deleteIdentity");
    }, [account, executeAction]);
    const listLogs = useCallback(async (queries) => {
        return executeAction(async () => {
            return await account.listLogs(queries);
        }, "listLogs");
    }, [account, executeAction]);
    return useMemo(() => ({
        loginWithEmail,
        register,
        createUserWithEmail,
        loginWithOAuth,
        loginWithMagicURL,
        loginWithEmailOTP,
        verifyEmailOTP,
        loginWithPhone,
        verifyPhone,
        loginWithAnonymous,
        logout,
        logoutAll,
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
        isPending,
        error,
    }), [
        loginWithEmail,
        register,
        createUserWithEmail,
        loginWithOAuth,
        loginWithMagicURL,
        loginWithEmailOTP,
        verifyEmailOTP,
        loginWithPhone,
        verifyPhone,
        loginWithAnonymous,
        logout,
        logoutAll,
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
        isPending,
        error,
    ]);
}
