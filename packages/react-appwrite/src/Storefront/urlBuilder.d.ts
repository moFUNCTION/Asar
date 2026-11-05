export interface BuildMemoryUrlsParams {
    slug: string;
    type: "booth" | "invitation";
    port?: number;
    rendererPort?: number;
    isDev?: boolean;
    rootDomain?: string;
}
export interface MemoryUrls {
    canonicalUrl: string;
    devLocalhostUrl: string;
    devRendererUrl: string;
    devQueryUrl: string;
    isSubdomain: boolean;
    primaryUrl: string;
}
/**
 * Builds canonical production and local development preview URLs for a Booth or Invitation memory.
 * - Booth default local port: 3002
 * - Invitation default local port: 3003
 * - Dedicated storefront renderer default local port: 3004
 * - Production default root domain: asar.me
 */
export declare function buildMemoryUrls(params: BuildMemoryUrlsParams): MemoryUrls;
//# sourceMappingURL=urlBuilder.d.ts.map