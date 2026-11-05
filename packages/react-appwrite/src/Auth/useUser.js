import { useState, useEffect, useCallback, useRef, useMemo, useContext } from "react";
import { useAppwrite } from "../Provider/useAppwrite";
import { authEvents } from "./authEvents";
import { AuthContext } from "./AuthProvider";
export function useUser(_options = {}) {
    const authContext = useContext(AuthContext);
    if (!_options.standalone && authContext) {
        return {
            user: authContext.user,
            profile: authContext.profile,
            isLoading: authContext.isLoading,
            error: authContext.error,
            isAuthenticated: authContext.isAuthenticated,
            refresh: authContext.refresh,
            updatePrefs: authContext.updatePrefs,
            updateProfile: (authContext.updateProfile || (async () => authContext.user)),
        };
    }
    const { account, client, activeSessionSecret } = useAppwrite();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMountedRef = useRef(true);
    const fetchUser = useCallback(async (isBackground = false) => {
        if (!isBackground) {
            setIsLoading(true);
        }
        setError(null);
        try {
            const currentUser = await account.get();
            if (isMountedRef.current) {
                setUser((prev) => {
                    if (prev &&
                        currentUser &&
                        prev.$id === currentUser.$id &&
                        prev.email === currentUser.email &&
                        prev.emailVerification === currentUser.emailVerification &&
                        prev.status === currentUser.status &&
                        JSON.stringify(prev.prefs) === JSON.stringify(currentUser.prefs)) {
                        return prev;
                    }
                    return currentUser;
                });
                setIsLoading(false);
            }
            return currentUser;
        }
        catch (err) {
            if (isMountedRef.current) {
                setUser(null);
                // 401 unauthenticated is a normal state, not a hard error
                if (err?.code !== 401) {
                    setError(err instanceof Error ? err : new Error(String(err)));
                }
                else {
                    setError(null);
                }
                setIsLoading(false);
            }
            return null;
        }
    }, [account]);
    const updatePrefs = useCallback(async (prefs) => {
        const updatedUser = await account.updatePrefs(prefs);
        if (isMountedRef.current) {
            setUser(updatedUser);
        }
        authEvents.emit("USER_UPDATED", { user: updatedUser });
        return updatedUser;
    }, [account]);
    const updateProfile = useCallback(async (data) => {
        const currentPrefs = (user?.prefs || {});
        const mergedPrefs = { ...currentPrefs, ...data };
        return await updatePrefs(mergedPrefs);
    }, [user, updatePrefs]);
    useEffect(() => {
        isMountedRef.current = true;
        fetchUser(false);
        // 1. Subscribe to global client-side auth events
        const unsubscribeAuthEvents = authEvents.subscribe((event) => {
            if (event.type === "SIGNED_OUT") {
                if (isMountedRef.current) {
                    setUser(null);
                    setIsLoading(false);
                    setError(null);
                }
            }
            else if (event.type === "SIGNED_IN" && event.user) {
                if (isMountedRef.current) {
                    setUser(event.user);
                    setIsLoading(false);
                    setError(null);
                }
            }
            else {
                fetchUser(true);
            }
        });
        // 2. Subscribe to Appwrite Realtime account events
        let unsubscribeRealtime;
        try {
            unsubscribeRealtime = client.subscribe("account", () => {
                fetchUser(true);
            });
        }
        catch {
            // Ignore if realtime is unavailable
        }
        return () => {
            isMountedRef.current = false;
            unsubscribeAuthEvents();
            unsubscribeRealtime?.();
        };
    }, [fetchUser, client, activeSessionSecret]);
    return useMemo(() => ({
        user,
        profile: user?.prefs || null,
        isLoading,
        error,
        isAuthenticated: !!user,
        refresh: fetchUser,
        updatePrefs,
        updateProfile,
    }), [user, isLoading, error, fetchUser, updatePrefs, updateProfile]);
}
