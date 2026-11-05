import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { ID } from "appwrite";
import { useAppwrite } from "../Provider/useAppwrite";
export function useTeams() {
    const { teams: teamsService, config } = useAppwrite();
    const [teams, setTeams] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMountedRef = useRef(true);
    const fetchTeams = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await teamsService.list();
            if (isMountedRef.current) {
                setTeams(res.teams);
                setTotal(res.total);
                setLoading(false);
            }
        }
        catch (err) {
            if (isMountedRef.current) {
                const errorObj = err instanceof Error ? err : new Error(String(err));
                setError(errorObj);
                setLoading(false);
                config.onError?.(err, "useTeams:fetchTeams");
            }
        }
    }, [teamsService, config]);
    useEffect(() => {
        isMountedRef.current = true;
        fetchTeams();
        return () => {
            isMountedRef.current = false;
        };
    }, [fetchTeams]);
    const createTeam = useCallback(async (name, roles = ["owner"], teamId = ID.unique()) => {
        try {
            const team = await teamsService.create(teamId, name, roles);
            setTeams((prev) => [team, ...prev]);
            setTotal((prev) => prev + 1);
            return team;
        }
        catch (err) {
            config.onError?.(err, "useTeams:createTeam");
            throw err;
        }
    }, [teamsService, config]);
    const updateTeam = useCallback(async (teamId, name) => {
        try {
            const updated = await teamsService.updateName(teamId, name);
            setTeams((prev) => prev.map((t) => (t.$id === teamId ? updated : t)));
            return updated;
        }
        catch (err) {
            config.onError?.(err, "useTeams:updateTeam");
            throw err;
        }
    }, [teamsService, config]);
    const deleteTeam = useCallback(async (teamId) => {
        try {
            await teamsService.delete(teamId);
            setTeams((prev) => prev.filter((t) => t.$id !== teamId));
            setTotal((prev) => Math.max(0, prev - 1));
        }
        catch (err) {
            config.onError?.(err, "useTeams:deleteTeam");
            throw err;
        }
    }, [teamsService, config]);
    const getTeamPrefs = useCallback(async (teamId) => {
        try {
            return await teamsService.getPrefs(teamId);
        }
        catch (err) {
            config.onError?.(err, `useTeams:getTeamPrefs:${teamId}`);
            throw err;
        }
    }, [teamsService, config]);
    const updateTeamPrefs = useCallback(async (teamId, prefs) => {
        try {
            return await teamsService.updatePrefs(teamId, prefs);
        }
        catch (err) {
            config.onError?.(err, `useTeams:updateTeamPrefs:${teamId}`);
            throw err;
        }
    }, [teamsService, config]);
    return useMemo(() => ({
        teams,
        total,
        loading,
        error,
        createTeam,
        updateTeam,
        deleteTeam,
        getTeamPrefs,
        updateTeamPrefs,
        refetch: fetchTeams,
    }), [
        teams,
        total,
        loading,
        error,
        createTeam,
        updateTeam,
        deleteTeam,
        getTeamPrefs,
        updateTeamPrefs,
        fetchTeams,
    ]);
}
