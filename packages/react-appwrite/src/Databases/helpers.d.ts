/**
 * Helper to resolve databaseId, collectionId, and options when hooks support both:
 * 1. (collectionId: string, options?: TOptions) -> uses defaultDatabaseId
 * 2. (databaseId: string, collectionId: string, options?: TOptions) -> explicit databaseId
 */
export declare function resolveDbAndCollection<TOptions = any>(defaultDatabaseId: string | undefined, arg1: string, arg2?: string | TOptions, arg3?: TOptions): {
    databaseId: string;
    collectionId: string;
    options: TOptions;
};
//# sourceMappingURL=helpers.d.ts.map