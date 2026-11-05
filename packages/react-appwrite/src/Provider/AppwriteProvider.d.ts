import React from "react";
export interface AppwriteProviderProps {
    endpoint: string;
    project: string;
    databaseId?: string;
    headers?: Record<string, string>;
    onError?: (error: unknown, context: string) => void;
    storageKeyPrefix?: string;
    autoRestoreSession?: boolean;
    children: React.ReactNode;
}
export declare const AppwriteProvider: React.FC<AppwriteProviderProps>;
//# sourceMappingURL=AppwriteProvider.d.ts.map