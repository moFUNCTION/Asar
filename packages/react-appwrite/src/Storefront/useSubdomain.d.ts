export type SubdomainSource = "query" | "param" | "hostname" | "fallback" | null;
export interface UseSubdomainOptions {
    /** Explicit route param (e.g. from react-router useParams() /memory/:slug) */
    routeParam?: string;
    /** Fallback subdomain slug if no other source matches */
    fallbackSubdomain?: string;
    /** Explicit search params (URLSearchParams or query string) */
    searchParams?: URLSearchParams | string;
    /** Custom root domains to recognize */
    rootDomains?: string[];
    /** Whether to allow query parameter override (default: true) */
    allowQueryOverride?: boolean;
}
export interface UseSubdomainResult {
    subdomain: string | null;
    isSubdomain: boolean;
    source: SubdomainSource;
}
/**
 * Pure 4-tier resolution engine for storefront subdomain detection:
 * Tier 1: Query param (?subdomain=, ?memory=, ?event=)
 * Tier 2: Route param (options.routeParam)
 * Tier 3: Hostname subdomain (RFC 6761 *.localhost or apex root domain *.asar.me)
 * Tier 4: Fallback subdomain (options.fallbackSubdomain)
 */
export declare function resolveSubdomain(options?: UseSubdomainOptions & {
    hostname?: string;
}): UseSubdomainResult;
/**
 * React hook implementing the 4-tier resolution hierarchy for ASAR storefronts.
 */
export declare function useSubdomain(options?: UseSubdomainOptions): UseSubdomainResult;
//# sourceMappingURL=useSubdomain.d.ts.map