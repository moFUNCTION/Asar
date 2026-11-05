import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useUser } from "../Auth/useUser";
import { useTeams } from "./useTeams";
export const RequireAuth = ({ children, fallback = null, loadingFallback = null, }) => {
    const { isAuthenticated, isLoading } = useUser();
    if (isLoading) {
        return _jsx(_Fragment, { children: loadingFallback });
    }
    if (!isAuthenticated) {
        return _jsx(_Fragment, { children: fallback });
    }
    return _jsx(_Fragment, { children: children });
};
export const RequireGuest = ({ children, fallback = null, loadingFallback = null, }) => {
    const { isAuthenticated, isLoading } = useUser();
    if (isLoading) {
        return _jsx(_Fragment, { children: loadingFallback });
    }
    if (isAuthenticated) {
        return _jsx(_Fragment, { children: fallback });
    }
    return _jsx(_Fragment, { children: children });
};
export const HasRole = ({ role, children, fallback = null, loadingFallback = null, }) => {
    const { user, isLoading } = useUser();
    if (isLoading) {
        return _jsx(_Fragment, { children: loadingFallback });
    }
    if (!user || !Array.isArray(user.labels) || !user.labels.includes(role)) {
        return _jsx(_Fragment, { children: fallback });
    }
    return _jsx(_Fragment, { children: children });
};
export const HasTeam = ({ teamId, role, children, fallback = null, loadingFallback = null, }) => {
    const { teams, loading } = useTeams();
    if (loading) {
        return _jsx(_Fragment, { children: loadingFallback });
    }
    const team = teams.find((t) => t.$id === teamId);
    if (!team) {
        return _jsx(_Fragment, { children: fallback });
    }
    const teamRoles = team.roles || [];
    if (role && Array.isArray(teamRoles) && teamRoles.length > 0 && !teamRoles.includes(role)) {
        return _jsx(_Fragment, { children: fallback });
    }
    return _jsx(_Fragment, { children: children });
};
