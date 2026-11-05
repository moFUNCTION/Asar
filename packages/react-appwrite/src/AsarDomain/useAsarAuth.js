// =============================================================
// ASAR (Athar / أثر) — Luxury Authentication & Profile Management Hook
// =============================================================
import { useState, useEffect, useCallback, useRef } from "react";
import { ID, Query } from "appwrite";
import { useAppwrite } from "../Provider/useAppwrite";
import { ASAR_DATABASE_ID, ASAR_COLLECTIONS, ASAR_TEAMS } from "./collections";
import { parseUserProfile } from "./models";
const STORAGE_KEY_PROFILE = "asar:user_profile";
export function useAsarAuth() {
    const { account, databases, teams, setSessionSecret, cacheFusion } = useAppwrite();
    const databaseId = ASAR_DATABASE_ID;
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(() => {
        if (typeof window !== "undefined") {
            try {
                const cached = localStorage.getItem(STORAGE_KEY_PROFILE);
                return cached ? JSON.parse(cached) : null;
            }
            catch {
                return null;
            }
        }
        return null;
    });
    const [isAdmin, setIsAdmin] = useState(() => {
        if (profile?.role === "admin")
            return true;
        return false;
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMountedRef = useRef(true);
    // Sync profile document from Appwrite collection
    const syncProfileDocument = useCallback(async (authedUser) => {
        try {
            // Query by userId
            const response = await databases.listDocuments(databaseId, ASAR_COLLECTIONS.USERS, [
                Query.equal("userId", authedUser.$id),
                Query.limit(1),
            ]);
            if (response.documents.length > 0) {
                const doc = response.documents[0];
                const parsed = parseUserProfile(doc);
                if (typeof window !== "undefined") {
                    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(parsed));
                }
                return parsed;
            }
            // Auto-create user document if it doesn't exist yet
            const newDoc = await databases.createDocument(databaseId, ASAR_COLLECTIONS.USERS, ID.unique(), {
                userId: authedUser.$id,
                name: authedUser.name || "ضيف أثر",
                email: authedUser.email || "",
                phone: authedUser.phone || null,
                role: "client",
                locale: "ar",
            });
            const parsed = parseUserProfile(newDoc);
            if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(parsed));
            }
            return parsed;
        }
        catch (err) {
            // If collection query fails (e.g. offline or permission), create temporary profile
            const fallback = {
                userId: authedUser.$id,
                name: authedUser.name || "ضيف أثر",
                email: authedUser.email || "",
                role: "client",
                locale: "ar",
            };
            return fallback;
        }
    }, [databases, databaseId]);
    // Check admin privileges via teams or role
    const checkAdminPrivilege = useCallback(async (userDocRole) => {
        if (userDocRole === "admin")
            return true;
        try {
            const teamList = await teams.list();
            return teamList.teams.some((t) => t.$id === ASAR_TEAMS.ADMINS || t.name?.toLowerCase().includes("admin"));
        }
        catch {
            return userDocRole === "admin";
        }
    }, [teams]);
    // Fetch active session and profile
    const refresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const currentUser = await account.get();
            if (!isMountedRef.current)
                return;
            setUser(currentUser);
            const userProfile = await syncProfileDocument(currentUser);
            if (!isMountedRef.current)
                return;
            setProfile(userProfile);
            const adminAccess = await checkAdminPrivilege(userProfile.role);
            if (isMountedRef.current) {
                setIsAdmin(adminAccess);
            }
        }
        catch (err) {
            if (!isMountedRef.current)
                return;
            setUser(null);
            setProfile(null);
            setIsAdmin(false);
            if (typeof window !== "undefined") {
                localStorage.removeItem(STORAGE_KEY_PROFILE);
            }
        }
        finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [account, syncProfileDocument, checkAdminPrivilege]);
    useEffect(() => {
        isMountedRef.current = true;
        refresh();
        return () => {
            isMountedRef.current = false;
        };
    }, [refresh]);
    // Login handler
    const login = useCallback(async (email, password) => {
        setIsLoading(true);
        setError(null);
        try {
            let session;
            try {
                session = await account.createEmailPasswordSession(email, password);
            }
            catch (err) {
                // If active session exists, delete current and retry
                if (err?.code === 409 ||
                    String(err?.message || "").includes("Creation of a session is prohibited")) {
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
            if (session.secret) {
                setSessionSecret(session.secret);
            }
            cacheFusion?.clear();
            const authedUser = await account.get();
            setUser(authedUser);
            const userProfile = await syncProfileDocument(authedUser);
            setProfile(userProfile);
            const adminAccess = await checkAdminPrivilege(userProfile.role);
            setIsAdmin(adminAccess);
            return { user: authedUser, profile: userProfile };
        }
        catch (err) {
            const errorMsg = err?.code === 401
                ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
                : err?.message || "حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة لاحقاً";
            setError(errorMsg);
            throw new Error(errorMsg);
        }
        finally {
            setIsLoading(false);
        }
    }, [account, setSessionSecret, cacheFusion, syncProfileDocument, checkAdminPrivilege]);
    // Register handler
    const register = useCallback(async (payload) => {
        setIsLoading(true);
        setError(null);
        try {
            const newUserId = ID.unique();
            await account.create(newUserId, payload.email, payload.password, payload.name);
            // Immediately create session
            const session = await account.createEmailPasswordSession(payload.email, payload.password);
            if (session.secret) {
                setSessionSecret(session.secret);
            }
            cacheFusion?.clear();
            const authedUser = await account.get();
            setUser(authedUser);
            // Insert into Users collection
            let createdDoc = null;
            try {
                createdDoc = await databases.createDocument(databaseId, ASAR_COLLECTIONS.USERS, ID.unique(), {
                    userId: authedUser.$id,
                    name: payload.name,
                    email: payload.email,
                    phone: payload.phone || null,
                    role: payload.role || "client",
                    organization: payload.organization || null,
                    locale: "ar",
                });
            }
            catch {
                // Fallback if table insert fails
            }
            const userProfile = createdDoc ? parseUserProfile(createdDoc) : {
                userId: authedUser.$id,
                name: payload.name,
                email: payload.email,
                phone: payload.phone,
                role: (payload.role || "client"),
                organization: payload.organization,
                locale: "ar",
            };
            setProfile(userProfile);
            if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
            }
            const adminAccess = await checkAdminPrivilege(userProfile.role);
            setIsAdmin(adminAccess);
            return { user: authedUser, profile: userProfile };
        }
        catch (err) {
            const errorMsg = err?.code === 409
                ? "البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول"
                : err?.message || "تعذر إنشاء الحساب، يرجى التحقق من صحة البيانات";
            setError(errorMsg);
            throw new Error(errorMsg);
        }
        finally {
            setIsLoading(false);
        }
    }, [account, databases, databaseId, setSessionSecret, cacheFusion, checkAdminPrivilege]);
    // Logout handler
    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await account.deleteSession("current");
        }
        catch {
            // Ignored if session already gone
        }
        finally {
            setUser(null);
            setProfile(null);
            setIsAdmin(false);
            setError(null);
            cacheFusion?.clear();
            if (typeof window !== "undefined") {
                localStorage.removeItem(STORAGE_KEY_PROFILE);
            }
            setIsLoading(false);
        }
    }, [account, cacheFusion]);
    // Update profile handler
    const updateProfile = useCallback(async (data) => {
        if (!user)
            throw new Error("يجب تسجيل الدخول لتحديث البيانات الشخصية");
        setIsLoading(true);
        setError(null);
        try {
            if (data.name && data.name !== user.name) {
                await account.updateName(data.name);
            }
            let updatedProfile;
            if (profile?.$id) {
                const updatedDoc = await databases.updateDocument(databaseId, ASAR_COLLECTIONS.USERS, profile.$id, {
                    ...(data.name ? { name: data.name } : {}),
                    ...(data.phone !== undefined ? { phone: data.phone || null } : {}),
                    ...(data.organization !== undefined ? { organization: data.organization || null } : {}),
                    ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl || null } : {}),
                    ...(data.locale !== undefined ? { locale: data.locale } : {}),
                    ...(data.metadataJson !== undefined ? { metadataJson: data.metadataJson } : {}),
                });
                updatedProfile = parseUserProfile(updatedDoc);
            }
            else {
                // Re-query or insert
                updatedProfile = await syncProfileDocument(user);
            }
            setProfile(updatedProfile);
            if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updatedProfile));
            }
            return updatedProfile;
        }
        catch (err) {
            const errorMsg = err?.message || "فشل تحديث البيانات، يرجى المحاولة لاحقاً";
            setError(errorMsg);
            throw new Error(errorMsg);
        }
        finally {
            setIsLoading(false);
        }
    }, [user, profile, account, databases, databaseId, syncProfileDocument]);
    const clearError = useCallback(() => {
        setError(null);
    }, []);
    return {
        user,
        profile,
        isAuthenticated: !!user,
        isAdmin,
        isLoading,
        error,
        login,
        register,
        logout,
        updateProfile,
        refresh,
        clearError,
    };
}
