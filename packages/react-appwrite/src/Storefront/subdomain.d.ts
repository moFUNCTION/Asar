export declare const RESERVED_SUBDOMAINS: ReadonlySet<string>;
export declare const RESERVED_SUBDOMAIN_LIST: readonly string[];
export declare const DEFAULT_ROOT_DOMAINS: readonly string[];
export interface SubdomainValidationResult {
    isValid: boolean;
    error?: string;
}
/**
 * Validates a subdomain slug according to RFC 1123 rules:
 * - 1 to 63 characters
 * - Lowercase alphanumeric characters and hyphens only
 * - Cannot start or end with a hyphen
 * - Cannot be one of the reserved subdomains
 */
export declare function validateSubdomainSlug(slug: string | null | undefined): SubdomainValidationResult;
/**
 * Checks whether a candidate slug is reserved.
 */
export declare function isReservedSubdomain(slug: string | null | undefined): boolean;
export interface ExtractSubdomainOptions {
    searchParams?: URLSearchParams | string;
    rootDomains?: string[];
    allowQueryOverride?: boolean;
}
/**
 * Extracts the active storefront subdomain slug from a hostname and optional search params:
 * 1. Checks query param override first (?subdomain=, ?memory=, ?event=) if searchParams provided.
 * 2. Strips protocol, port numbers, paths from hostname.
 * 3. Handles RFC 6761 *.localhost (e.g. mina-and-maryam.localhost -> mina-and-maryam). Returns null for bare localhost or 127.0.0.1.
 * 4. Handles apex root domains (asar.me, asar.audio, or custom). Returns null for bare apex domain, www., or reserved subdomains.
 */
export declare function extractSubdomain(hostname: string | null | undefined, options?: ExtractSubdomainOptions): string | null;
//# sourceMappingURL=subdomain.d.ts.map