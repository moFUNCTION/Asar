import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { ID } from "appwrite";
import { useAppwrite } from "../Provider/useAppwrite";
export function useTeamMembers(teamId) {
    const { teams, config } = useAppwrite();
    const [members, setMembers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMountedRef = useRef(true);
    const fetchMembers = useCallback(async () => {
        if (!teamId)
            return;
        setLoading(true);
        setError(null);
        try {
            const res = await teams.listMemberships(teamId);
            if (isMountedRef.current) {
                setMembers(res.memberships);
                setTotal(res.total);
                setLoading(false);
            }
        }
        catch (err) {
            if (isMountedRef.current) {
                const errorObj = err instanceof Error ? err : new Error(String(err));
                setError(errorObj);
                setLoading(false);
                config.onError?.(err, `useTeamMembers:fetchMembers:${teamId}`);
            }
        }
    }, [teams, teamId, config]);
    useEffect(() => {
        isMountedRef.current = true;
        fetchMembers();
        return () => {
            isMountedRef.current = false;
        };
    }, [fetchMembers]);
    const inviteMember = useCallback(async (email, roles = ["member"], url = window.location.href, name, userId = ID.unique()) => {
        try {
            const membership = await teams.createMembership(teamId, roles, email, userId, undefined, url, name);
            setMembers((prev) => [membership, ...prev]);
            setTotal((prev) => prev + 1);
            return membership;
        }
        catch (err) {
            config.onError?.(err, `useTeamMembers:inviteMember:${teamId}`);
            throw err;
        }
    }, [teams, teamId, config]);
    const updateMembershipRoles = useCallback(async (membershipId, roles) => {
        try {
            const updated = await teams.updateMembership(teamId, membershipId, roles);
            setMembers((prev) => prev.map((m) => (m.$id === membershipId ? updated : m)));
            return updated;
        }
        catch (err) {
            config.onError?.(err, `useTeamMembers:updateMembershipRoles:${teamId}/${membershipId}`);
            throw err;
        }
    }, [teams, teamId, config]);
    const deleteMembership = useCallback(async (membershipId) => {
        try {
            await teams.deleteMembership(teamId, membershipId);
            setMembers((prev) => prev.filter((m) => m.$id !== membershipId));
            setTotal((prev) => Math.max(0, prev - 1));
        }
        catch (err) {
            config.onError?.(err, `useTeamMembers:deleteMembership:${teamId}/${membershipId}`);
            throw err;
        }
    }, [teams, teamId, config]);
    const acceptInvite = useCallback(async (membershipId, userId, secret) => {
        try {
            const updated = await teams.updateMembershipStatus(teamId, membershipId, userId, secret);
            setMembers((prev) => prev.map((m) => (m.$id === membershipId ? updated : m)));
            return updated;
        }
        catch (err) {
            config.onError?.(err, `useTeamMembers:acceptInvite:${teamId}/${membershipId}`);
            throw err;
        }
    }, [teams, teamId, config]);
    const getMembership = useCallback(async (membershipId) => {
        try {
            return await teams.getMembership(teamId, membershipId);
        }
        catch (err) {
            config.onError?.(err, `useTeamMembers:getMembership:${teamId}/${membershipId}`);
            throw err;
        }
    }, [teams, teamId, config]);
    return useMemo(() => ({
        members,
        total,
        loading,
        error,
        inviteMember,
        updateMembershipRoles,
        deleteMembership,
        acceptInvite,
        getMembership,
        refetch: fetchMembers,
    }), [
        members,
        total,
        loading,
        error,
        inviteMember,
        updateMembershipRoles,
        deleteMembership,
        acceptInvite,
        getMembership,
        fetchMembers,
    ]);
}
