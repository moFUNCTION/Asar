export declare function usePermissions(documentPermissions?: string[]): {
    userRoles: Set<string>;
    hasPermission: (type: "read" | "write" | "create" | "update" | "delete", targetRole?: string) => boolean;
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
};
//# sourceMappingURL=usePermissions.d.ts.map