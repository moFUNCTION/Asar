import type { Models } from "appwrite";
export declare function useAccountSettings(): {
    updateName: (name: string) => Promise<Models.User<Models.Preferences>>;
    updateEmail: (email: string, password: string) => Promise<Models.User<Models.Preferences>>;
    updatePassword: (password: string, oldPassword?: string) => Promise<Models.User<Models.Preferences>>;
    updatePhone: (phone: string, password: string) => Promise<Models.User<Models.Preferences>>;
    updatePrefs: <T extends Models.Preferences = Models.Preferences>(prefs: T) => Promise<Models.User<T>>;
    getPrefs: <T extends Models.Preferences = Models.Preferences>() => Promise<T>;
    isUpdating: boolean;
    error: Error | null;
};
//# sourceMappingURL=useAccountSettings.d.ts.map