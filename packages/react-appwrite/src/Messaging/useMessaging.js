import { useState, useEffect, useCallback, useMemo } from "react";
import { ID } from "appwrite";
import { useAppwrite } from "../Provider/useAppwrite";
export function useMessaging() {
    const { account, messaging, config } = useAppwrite();
    const [isSupported, setIsSupported] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState("default");
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setIsSupported(true);
            setPermissionStatus(Notification.permission);
        }
    }, []);
    const requestPermission = useCallback(async () => {
        if (typeof window === "undefined" || !("Notification" in window)) {
            const err = new Error("Notifications are not supported in this browser environment.");
            setError(err);
            throw err;
        }
        try {
            const status = await Notification.requestPermission();
            setPermissionStatus(status);
            return status;
        }
        catch (err) {
            const errObj = err instanceof Error ? err : new Error(String(err));
            setError(errObj);
            throw errObj;
        }
    }, []);
    const registerPushTarget = useCallback(async (providerId, targetId = ID.unique(), identifier) => {
        setIsSubscribing(true);
        setError(null);
        try {
            const perm = await requestPermission();
            if (perm !== "granted") {
                throw new Error("Push Notification permission was not granted by the user.");
            }
            // Create target in Appwrite Account
            const target = await account.createPushTarget(targetId, identifier || targetId, providerId);
            setIsSubscribing(false);
            return target;
        }
        catch (err) {
            const errObj = err instanceof Error ? err : new Error(String(err));
            setError(errObj);
            setIsSubscribing(false);
            config.onError?.(err, "useMessaging:registerPushTarget");
            throw errObj;
        }
    }, [account, requestPermission, config]);
    const subscribeToTopic = useCallback(async (topicId, subscriberId, targetId) => {
        try {
            return await messaging.createSubscriber(topicId, subscriberId, targetId);
        }
        catch (err) {
            const errObj = err instanceof Error ? err : new Error(String(err));
            setError(errObj);
            config.onError?.(err, `useMessaging:subscribeToTopic:${topicId}/${subscriberId}`);
            throw errObj;
        }
    }, [messaging, config]);
    const unsubscribeFromTopic = useCallback(async (topicId, subscriberId) => {
        try {
            return await messaging.deleteSubscriber(topicId, subscriberId);
        }
        catch (err) {
            const errObj = err instanceof Error ? err : new Error(String(err));
            setError(errObj);
            config.onError?.(err, `useMessaging:unsubscribeFromTopic:${topicId}/${subscriberId}`);
            throw errObj;
        }
    }, [messaging, config]);
    return useMemo(() => ({
        isSupported,
        permissionStatus,
        isSubscribing,
        error,
        requestPermission,
        registerPushTarget,
        subscribeToTopic,
        unsubscribeFromTopic,
    }), [
        isSupported,
        permissionStatus,
        isSubscribing,
        error,
        requestPermission,
        registerPushTarget,
        subscribeToTopic,
        unsubscribeFromTopic,
    ]);
}
