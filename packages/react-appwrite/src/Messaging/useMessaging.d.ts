import { type Models } from "appwrite";
export interface UseMessagingReturn {
    isSupported: boolean;
    permissionStatus: NotificationPermission;
    isSubscribing: boolean;
    error: Error | null;
    requestPermission: () => Promise<NotificationPermission>;
    registerPushTarget: (providerId: string, targetId?: string, identifier?: string) => Promise<Models.Target>;
    subscribeToTopic: (topicId: string, subscriberId: string, targetId: string) => Promise<Models.Subscriber>;
    unsubscribeFromTopic: (topicId: string, subscriberId: string) => Promise<{}>;
}
export declare function useMessaging(): UseMessagingReturn;
//# sourceMappingURL=useMessaging.d.ts.map