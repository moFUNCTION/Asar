import { useState, useCallback, useMemo } from "react";
import { useAppwrite } from "../Provider/useAppwrite";
export function useAccountSettings() {
    const { account, config } = useAppwrite();
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(null);
    const execute = useCallback(async (fn, context) => {
        setIsUpdating(true);
        setError(null);
        try {
            const res = await fn();
            setIsUpdating(false);
            return res;
        }
        catch (err) {
            const errObj = err instanceof Error ? err : new Error(String(err));
            setError(errObj);
            setIsUpdating(false);
            config.onError?.(err, `useAccountSettings:${context}`);
            throw errObj;
        }
    }, [config]);
    const updateName = useCallback(async (name) => {
        return execute(() => account.updateName(name), "updateName");
    }, [account, execute]);
    const updateEmail = useCallback(async (email, password) => {
        return execute(() => account.updateEmail(email, password), "updateEmail");
    }, [account, execute]);
    const updatePassword = useCallback(async (password, oldPassword) => {
        return execute(() => account.updatePassword(password, oldPassword), "updatePassword");
    }, [account, execute]);
    const updatePhone = useCallback(async (phone, password) => {
        return execute(() => account.updatePhone(phone, password), "updatePhone");
    }, [account, execute]);
    const updatePrefs = useCallback(async (prefs) => {
        return execute(() => account.updatePrefs(prefs), "updatePrefs");
    }, [account, execute]);
    const getPrefs = useCallback(async () => {
        return execute(() => account.getPrefs(), "getPrefs");
    }, [account, execute]);
    return useMemo(() => ({
        updateName,
        updateEmail,
        updatePassword,
        updatePhone,
        updatePrefs,
        getPrefs,
        isUpdating,
        error,
    }), [
        updateName,
        updateEmail,
        updatePassword,
        updatePhone,
        updatePrefs,
        getPrefs,
        isUpdating,
        error,
    ]);
}
