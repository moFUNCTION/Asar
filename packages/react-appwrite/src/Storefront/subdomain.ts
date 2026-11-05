// =============================================================
// ASAR (Athar / أثر) — Storefront Subdomain Parser & Validator
// RFC 1123 compliant subdomain slug validator & multi-tier extractor
// =============================================================

export const RESERVED_SUBDOMAINS: ReadonlySet<string> = new Set([
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

export const RESERVED_SUBDOMAIN_LIST: readonly string[] = Array.from(
  RESERVED_SUBDOMAINS
);

export const DEFAULT_ROOT_DOMAINS: readonly string[] = [
  "asar.me",
  "asar.audio",
];

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
export function validateSubdomainSlug(
  slug: string | null | undefined
): SubdomainValidationResult {
  if (slug === null || slug === undefined || typeof slug !== "string") {
    return {
      isValid: false,
      error: "Subdomain slug is required.",
    };
  }

  const trimmed = slug.trim();
  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: "Subdomain slug cannot be empty.",
    };
  }

  if (trimmed.length > 63) {
    return {
      isValid: false,
      error: "Subdomain slug cannot exceed 63 characters (RFC 1123).",
    };
  }

  if (trimmed.startsWith("-") || trimmed.endsWith("-")) {
    return {
      isValid: false,
      error: "Subdomain slug cannot start or end with a hyphen.",
    };
  }

  if (trimmed !== trimmed.toLowerCase()) {
    return {
      isValid: false,
      error: "Subdomain slug must be lowercase.",
    };
  }

  // RFC 1123: lowercase alphanumeric and hyphens, 1-63 chars, no leading/trailing hyphen
  const rfc1123Regex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  if (!rfc1123Regex.test(trimmed)) {
    return {
      isValid: false,
      error:
        "Subdomain slug must contain only lowercase letters (a-z), numbers (0-9), and hyphens (-).",
    };
  }

  if (RESERVED_SUBDOMAINS.has(trimmed)) {
    return {
      isValid: false,
      error: `Subdomain "${trimmed}" is reserved and cannot be used.`,
    };
  }

  return { isValid: true };
}

/**
 * Checks whether a candidate slug is reserved.
 */
export function isReservedSubdomain(slug: string | null | undefined): boolean {
  if (!slug || typeof slug !== "string") return false;
  return RESERVED_SUBDOMAINS.has(slug.trim().toLowerCase());
}

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
export function extractSubdomain(
  hostname: string | null | undefined,
  options?: ExtractSubdomainOptions
): string | null {
  // 1. Query parameter override
  const allowQuery = options?.allowQueryOverride !== false;
  if (allowQuery && options?.searchParams) {
    let params: URLSearchParams;
    if (typeof options.searchParams === "string") {
      const searchStr = options.searchParams.includes("?")
        ? options.searchParams.split("?")[1]
        : options.searchParams;
      params = new URLSearchParams(searchStr);
    } else {
      params = options.searchParams;
    }

    const querySlug =
      params.get("subdomain") ||
      params.get("memory") ||
      params.get("event");

    if (querySlug) {
      const cleanSlug = querySlug.trim().toLowerCase();
      if (
        cleanSlug &&
        !RESERVED_SUBDOMAINS.has(cleanSlug) &&
        validateSubdomainSlug(cleanSlug).isValid
      ) {
        return cleanSlug;
      }
    }
  }

  if (!hostname || typeof hostname !== "string") {
    return null;
  }

  // 2. Normalize hostname: strip protocol, paths, query, port
  let host = hostname.trim().toLowerCase();
  host = host.replace(/^[a-z]+:\/\//i, "");
  host = host.split("/")[0].split("?")[0].split("#")[0];
  host = host.split(":")[0].trim();

  if (!host) {
    return null;
  }

  // Bare localhost or IP addresses
  if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0") {
    return null;
  }
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
    return null;
  }

  // 3. RFC 6761: *.localhost
  if (host.endsWith(".localhost")) {
    const sub = host.slice(0, -".localhost".length);
    const candidate = sub.split(".")[0];
    if (
      candidate &&
      !RESERVED_SUBDOMAINS.has(candidate) &&
      validateSubdomainSlug(candidate).isValid
    ) {
      return candidate;
    }
    return null;
  }

  // 4. Apex domains (asar.me, asar.audio, or custom configured root domains)
  const rootDomains =
    options?.rootDomains && options.rootDomains.length > 0
      ? Array.from(new Set([...options.rootDomains, ...DEFAULT_ROOT_DOMAINS]))
      : DEFAULT_ROOT_DOMAINS;

  for (const root of rootDomains) {
    const cleanRoot = root.toLowerCase().trim().replace(/^\./, "");
    if (host === cleanRoot) {
      // Bare apex domain -> null
      return null;
    }
    if (host.endsWith("." + cleanRoot)) {
      const sub = host.slice(0, -(cleanRoot.length + 1));
      const candidate = sub.split(".")[0];
      if (
        candidate &&
        !RESERVED_SUBDOMAINS.has(candidate) &&
        validateSubdomainSlug(candidate).isValid
      ) {
        return candidate;
      }
      return null;
    }
  }

  return null;
}
