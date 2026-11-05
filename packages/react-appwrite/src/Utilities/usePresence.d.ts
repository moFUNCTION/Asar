export interface UserPresence {
    userId: string;
    status: "online" | "away" | "offline";
    lastSeen: number;
    metadata?: Record<string, any>;
}
export declare function usePresence(channel?: string): {
    onlineUsers: Record<string, UserPresence>;
    isUserOnline: (userId: string) => boolean;
    getUserPresence: (userId: string) => UserPresence;
    updatePresence: (status?: "online" | "away" | "offline", metadata?: Record<string, any>) => void;
};
//# sourceMappingURL=usePresence.d.ts.map