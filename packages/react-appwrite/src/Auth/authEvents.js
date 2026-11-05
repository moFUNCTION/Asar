class AuthEventEmitter {
    listeners = new Set();
    /**
     * Subscribe to global authentication state changes.
     * Returns an unsubscribe function.
     */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    /**
     * Emit an authentication event to all active listeners.
     */
    emit(type, data) {
        const payload = {
            type,
            user: data?.user,
            session: data?.session,
            timestamp: Date.now(),
        };
        this.listeners.forEach((listener) => {
            try {
                listener(payload);
            }
            catch (err) {
                console.error("[react-appwrite] Error in auth state listener:", err);
            }
        });
    }
}
export const authEvents = new AuthEventEmitter();
