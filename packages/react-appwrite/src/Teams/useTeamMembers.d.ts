import { type Models } from "appwrite";
export declare function useTeamMembers(teamId: string): {
    members: Models.Membership[];
    total: number;
    loading: boolean;
    error: Error | null;
    inviteMember: (email: string, roles?: string[], url?: string, name?: string, userId?: string) => Promise<Models.Membership>;
    updateMembershipRoles: (membershipId: string, roles: string[]) => Promise<Models.Membership>;
    deleteMembership: (membershipId: string) => Promise<void>;
    acceptInvite: (membershipId: string, userId: string, secret: string) => Promise<Models.Membership>;
    getMembership: (membershipId: string) => Promise<Models.Membership>;
    refetch: () => Promise<void>;
};
//# sourceMappingURL=useTeamMembers.d.ts.map