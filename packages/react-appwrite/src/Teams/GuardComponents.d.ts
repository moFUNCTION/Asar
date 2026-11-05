import React from "react";
export interface GuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    loadingFallback?: React.ReactNode;
}
export declare const RequireAuth: React.FC<GuardProps>;
export declare const RequireGuest: React.FC<GuardProps>;
export interface HasRoleProps extends GuardProps {
    role: string;
}
export declare const HasRole: React.FC<HasRoleProps>;
export interface HasTeamProps extends GuardProps {
    teamId: string;
    role?: string;
}
export declare const HasTeam: React.FC<HasTeamProps>;
//# sourceMappingURL=GuardComponents.d.ts.map