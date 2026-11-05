import { type Models } from "appwrite";
export declare function useTeams(): {
    teams: Models.Team<Models.Preferences>[];
    total: number;
    loading: boolean;
    error: Error | null;
    createTeam: (name: string, roles?: string[], teamId?: string) => Promise<Models.Team<Models.Preferences>>;
    updateTeam: (teamId: string, name: string) => Promise<Models.Team<Models.Preferences>>;
    deleteTeam: (teamId: string) => Promise<void>;
    getTeamPrefs: <Preferences extends Models.Preferences = Models.Preferences>(teamId: string) => Promise<Preferences>;
    updateTeamPrefs: <Preferences extends Models.Preferences = Models.Preferences>(teamId: string, prefs: object) => Promise<Preferences>;
    refetch: () => Promise<void>;
};
//# sourceMappingURL=useTeams.d.ts.map