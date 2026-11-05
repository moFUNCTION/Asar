// =============================================================
// ASAR (Athar / أثر) — Storefront Subdomain React Hook
// 4-Tier Resolution Hierarchy: Query -> RouteParam -> Hostname -> Fallback
// Self-contained to satisfy both Node ESM strip-types and TS Bundler resolution
// =============================================================
import { useMemo } from "react";
const RESERVED_NAMES = new Set([
    "admin",
    "api",
    "booth",
    "main",
    "invitation",
    "app",
    "cdn",
    "mail",
    "auth",
    "dev",
    "staging",
    "test",
    "www",
    "storefront",
    "status",
    "account",
]);
const DEFAULT_ROOTS = ["asar.me", "asar.audio"];
function isValidSlug(slug) {
    if (!slug || typeof slug !== "string")
        return false;
    const trimmed = slug.trim();
    if (trimmed.length === 0 || trimmed.length > 63)
        return false;
    if (trimmed.startsWith("-") || trimmed.endsWith("-"))
        return false;
    if (trimmed !== trimmed.toLowerCase())
        return false;
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(trimmed))
        return false;
    if (RESERVED_NAMES.has(trimmed))
        return false;
    return true;
}
function extractFromHostname(hostname, customRoots) {
    if (!hostname || typeof hostname !== "string")
        return null;
    let host = hostname.trim().toLowerCase();
    host = host.replace(/^[a-z]+:\/\//i, "");
    host = host.split("/")[0].split("?")[0].split("#")[0];
    host = host.split(":")[0].trim();
    if (!host || host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0") {
        return null;
    }
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
        return null;
    }
    // RFC 6761: *.localhost
    if (host.endsWith(".localhost")) {
        const sub = host.slice(0, -".localhost".length);
        const candidate = sub.split(".")[0];
        return isValidSlug(candidate) ? candidate : null;
    }
    // Apex root domains
    const roots = customRoots && customRoots.length > 0
        ? Array.from(new Set([...customRoots, ...DEFAULT_ROOTS]))
        : DEFAULT_ROOTS;
    for (const root of roots) {
        const cleanRoot = root.toLowerCase().trim().replace(/^\./, "");
        if (host === cleanRoot)
            return null;
        if (host.endsWith("." + cleanRoot)) {
            const sub = host.slice(0, -(cleanRoot.length + 1));
            const candidate = sub.split(".")[0];
            return isValidSlug(candidate) ? candidate : null;
        }
    }
    return null;
}
/**
 * Pure 4-tier resolution engine for storefront subdomain detection:
 * Tier 1: Query param (?subdomain=, ?memory=, ?event=)
 * Tier 2: Route param (options.routeParam)
 * Tier 3: Hostname subdomain (RFC 6761 *.localhost or apex root domain *.asar.me)
 * Tier 4: Fallback subdomain (options.fallbackSubdomain)
 */
export function resolveSubdomain(options) {
    // Tier 1: Query parameter override
    const allowQuery = options?.allowQueryOverride !== false;
    if (allowQuery) {
        let search = options?.searchParams;
        if (!search && typeof window !== "undefined" && window.location) {
            search = window.location.search;
        }
        if (search) {
            let params;
            if (typeof search === "string") {
                const searchStr = search.includes("?") ? search.split("?")[1] : search;
                params = new URLSearchParams(searchStr);
            }
            else {
                params = search;
            }
            const queryCandidate = params.get("subdomain") ||
                params.get("memory") ||
                params.get("event");
            if (queryCandidate) {
                const cleaned = queryCandidate.trim().toLowerCase();
                if (isValidSlug(cleaned)) {
                    return {
                        subdomain: cleaned,
                        isSubdomain: true,
                        source: "query",
                    };
                }
            }
        }
    }
    // Tier 2: Route parameter
    if (options?.routeParam) {
        const cleaned = options.routeParam.trim().toLowerCase();
        if (isValidSlug(cleaned)) {
            return {
                subdomain: cleaned,
                isSubdomain: true,
                source: "param",
            };
        }
    }
    // Tier 3: Hostname subdomain
    const hostname = options?.hostname ||
        (typeof window !== "undefined" && window.location?.hostname
            ? window.location.hostname
            : undefined);
    if (hostname) {
        const hostSub = extractFromHostname(hostname, options?.rootDomains);
        if (hostSub) {
            return {
                subdomain: hostSub,
                isSubdomain: true,
                source: "hostname",
            };
        }
    }
    // Tier 4: Default fallback
    if (options?.fallbackSubdomain) {
        const cleaned = options.fallbackSubdomain.trim().toLowerCase();
        if (isValidSlug(cleaned)) {
            return {
                subdomain: cleaned,
                isSubdomain: true,
                source: "fallback",
            };
        }
    }
    return {
        subdomain: null,
        isSubdomain: false,
        source: null,
    };
}
/**
 * React hook implementing the 4-tier resolution hierarchy for ASAR storefronts.
 */
export function useSubdomain(options) {
    return useMemo(() => {
        const hostname = typeof window !== "undefined" && window.location?.hostname
            ? window.location.hostname
            : undefined;
        const search = options?.searchParams ||
            (typeof window !== "undefined" && window.location?.search
                ? window.location.search
                : undefined);
        return resolveSubdomain({
            ...options,
            hostname,
            searchParams: search,
        });
    }, [
        options?.routeParam,
        options?.fallbackSubdomain,
        options?.searchParams,
        options?.allowQueryOverride,
        typeof window !== "undefined" ? window.location?.hostname : undefined,
        typeof window !== "undefined" ? window.location?.search : undefined,
    ]);
}
