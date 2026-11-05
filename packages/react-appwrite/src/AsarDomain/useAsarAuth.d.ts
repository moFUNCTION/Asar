import { type Models } from "appwrite";
import { type AsarUserProfile, type AsarUserRole } from "./models";
export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    phone?: string;
    organization?: string;
    role?: AsarUserRole;
}
export interface UseAsarAuthReturn {
    user: Models.User<Models.Preferences> | null;
    profile: AsarUserProfile | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<{
        user: Models.User<Models.Preferences>;
        profile: AsarUserProfile;
    }>;
    register: (payload: RegisterPayload) => Promise<{
        user: Models.User<Models.Preferences>;
        profile: AsarUserProfile;
    }>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<Omit<AsarUserProfile, "userId" | "$id">>) => Promise<AsarUserProfile>;
    refresh: () => Promise<void>;
    clearError: () => void;
}
export declare function useAsarAuth(): UseAsarAuthReturn;
//# sourceMappingURL=useAsarAuth.d.ts.map