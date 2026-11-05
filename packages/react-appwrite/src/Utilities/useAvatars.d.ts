import { Flag, Browser, CreditCard } from "appwrite";
export declare function useAvatars(): {
    getInitials: (name?: string, width?: number, height?: number, background?: string) => string;
    getQR: (text: string, size?: number, margin?: number, download?: boolean) => string;
    getCreditCard: (code: CreditCard | string, width?: number, height?: number, quality?: number) => string;
    getFavicon: (url: string) => string;
    getFlag: (code: Flag | string, width?: number, height?: number, quality?: number) => string;
    getBrowser: (code: Browser | string, width?: number, height?: number, quality?: number) => string;
    getImage: (url: string, width?: number, height?: number) => string;
};
//# sourceMappingURL=useAvatars.d.ts.map