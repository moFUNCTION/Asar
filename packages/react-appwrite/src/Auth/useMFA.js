import { useState, useCallback, useMemo } from "react";
import { AuthenticatorType } from "appwrite";
import { useAppwrite } from "../Provider/useAppwrite";
export function useMFA() {
    const { account, config } = useAppwrite();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const execute = useCallback(async (fn, context) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fn();
            setIsLoading(false);
            return res;
        }
        catch (err) {
            const errorObj = err instanceof Error ? err : new Error(String(err));
            setError(errorObj);
            setIsLoading(false);
            config.onError?.(err, `useMFA:${context}`);
            throw errorObj;
        }
    }, [config]);
    const getFactors = useCallback(async () => {
        return execute(() => account.listMfaFactors(), "getFactors");
    }, [account, execute]);
    const enableMFA = useCallback(async () => {
        return execute(() => account.updateMFA(true), "enableMFA");
    }, [account, execute]);
    const disableMFA = useCallback(async () => {
        return execute(() => account.updateMFA(false), "disableMFA");
    }, [account, execute]);
    const createAuthenticator = useCallback(async (type = AuthenticatorType.Totp) => {
        return execute(() => account.createMfaAuthenticator(type), "createAuthenticator");
    }, [account, execute]);
    const verifyAuthenticator = useCallback(async (type, otp) => {
        return execute(() => account.updateMfaAuthenticator(type, otp), "verifyAuthenticator");
    }, [account, execute]);
    const deleteAuthenticator = useCallback(async (type) => {
        return execute(async () => {
            await account.deleteMfaAuthenticator(type);
        }, "deleteAuthenticator");
    }, [account, execute]);
    const challengeMFA = useCallback(async (factor) => {
        return execute(() => account.createMfaChallenge(factor), "challengeMFA");
    }, [account, execute]);
    const completeChallenge = useCallback(async (challengeId, otp) => {
        return execute(async () => {
            await account.updateMfaChallenge(challengeId, otp);
        }, "completeChallenge");
    }, [account, execute]);
    const createRecoveryCodes = useCallback(async () => {
        return execute(() => account.createMfaRecoveryCodes(), "createRecoveryCodes");
    }, [account, execute]);
    const getRecoveryCodes = useCallback(async () => {
        return execute(() => account.getMfaRecoveryCodes(), "getRecoveryCodes");
    }, [account, execute]);
    return useMemo(() => ({
        getFactors,
        enableMFA,
        disableMFA,
        createAuthenticator,
        verifyAuthenticator,
        deleteAuthenticator,
        challengeMFA,
        completeChallenge,
        createRecoveryCodes,
        getRecoveryCodes,
        isLoading,
        error,
    }), [
        getFactors,
        enableMFA,
        disableMFA,
        createAuthenticator,
        verifyAuthenticator,
        deleteAuthenticator,
        challengeMFA,
        completeChallenge,
        createRecoveryCodes,
        getRecoveryCodes,
        isLoading,
        error,
    ]);
}
