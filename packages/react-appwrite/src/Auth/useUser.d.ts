import type { Models } from "appwrite";
export interface UseUserOptions {
    standalone?: boolean;
}
export interface UseUserReturn<TPreferences extends Models.Preferences = Models.Preferences> {
    user: Models.User<TPreferences> | null;
    profile: TPreferences | null;
    isLoading: boolean;
    error: Error | null;
    isAuthenticated: boolean;
    refresh: () => Promise<Models.User<TPreferences> | null>;
    updatePrefs: (prefs: TPreferences) => Promise<Models.User<TPreferences>>;
    updateProfile: (data: Partial<TPreferences>) => Promise<Models.User<TPreferences>>;
}
export declare function useUser<TPreferences extends Models.Preferences = Models.Preferences>(_options?: UseUserOptions): UseUserReturn<TPreferences>;
//# sourceMappingURL=useUser.d.ts.map