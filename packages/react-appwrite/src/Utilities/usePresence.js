import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAppwrite } from "../Provider/useAppwrite";
import { useUser } from "../Auth/useUser";
export function usePresence(channel = "global") {
    const { client } = useAppwrite();
    const { user } = useUser();
    const [onlineUsers, setOnlineUsers] = useState({});
    const presenceChannel = `presence.${channel}`;
    const heartbeatIntervalRef = useRef(null);
    // Broadcast own presence heartbeat
    const updatePresence = useCallback((status = "online", metadata) => {
        if (!user)
            return;
        const presencePayload = {
            userId: user.$id,
            status,
            lastSeen: Date.now(),
            metadata,
        };
        // Set local state
        setOnlineUsers((prev) => ({
            ...prev,
            [user.$id]: presencePayload,
        }));
    }, [user]);
    useEffect(() => {
        if (!user)
            return;
        // Send initial presence
        updatePresence("online");
        // Realtime presence channel subscription
        const unsubscribe = client.subscribe(presenceChannel, (response) => {
            if (response && response.payload && response.payload.userId) {
                const p = response.payload;
                setOnlineUsers((prev) => ({
                    ...prev,
                    [p.userId]: p,
                }));
            }
        });
        // Send heartbeat every 30s
        heartbeatIntervalRef.current = setInterval(() => {
            updatePresence("online");
        }, 30000);
        return () => {
            unsubscribe();
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
            }
            updatePresence("offline");
        };
    }, [client, user, presenceChannel, updatePresence]);
    const isUserOnline = useCallback((userId) => onlineUsers[userId]?.status === "online", [onlineUsers]);
    const getUserPresence = useCallback((userId) => onlineUsers[userId] || null, [onlineUsers]);
    return useMemo(() => ({
        onlineUsers,
        isUserOnline,
        getUserPresence,
        updatePresence,
    }), [onlineUsers, isUserOnline, getUserPresence, updatePresence]);
}
