import type { SavedAccount } from "../types";
export declare function useAccountSwitcher(): {
    savedAccounts: SavedAccount[];
    currentAccount: SavedAccount | null;
    switchAccount: (userId: string) => boolean;
    addAccount: (account: Omit<SavedAccount, "lastActive"> & {
        lastActive?: number;
    }) => void;
    removeAccount: (userId: string) => void;
    clearAllAccounts: () => void;
};
//# sourceMappingURL=useAccountSwitcher.d.ts.map