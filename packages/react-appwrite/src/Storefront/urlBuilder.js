// =============================================================
// ASAR (Athar / أثر) — Storefront URL Builder Helper
// Generates canonical production and local dev preview URLs
// =============================================================
/**
 * Builds canonical production and local development preview URLs for a Booth or Invitation memory.
 * - Booth default local port: 3002
 * - Invitation default local port: 3003
 * - Dedicated storefront renderer default local port: 3004
 * - Production default root domain: asar.me
 */
export function buildMemoryUrls(params) {
    const root = (params.rootDomain || "asar.me").trim().replace(/^\./, "");
    const defaultPort = params.type === "booth" ? 3002 : 3003;
    const port = params.port || defaultPort;
    const rendererPort = params.rendererPort || 3004;
    const cleanSlug = (params.slug || "").trim().toLowerCase();
    const isSubdomain = cleanSlug.length > 0;
    if (!isSubdomain) {
        const devUrl = `http://localhost:${port}`;
        const devRendererUrl = `http://localhost:${rendererPort}`;
        const prodUrl = `https://${root}`;
        return {
            canonicalUrl: prodUrl,
            devLocalhostUrl: devUrl,
            devRendererUrl,
            devQueryUrl: devUrl,
            isSubdomain: false,
            primaryUrl: params.isDev ? devUrl : prodUrl,
        };
    }
    const canonicalUrl = `https://${cleanSlug}.${root}`;
    const devLocalhostUrl = `http://${cleanSlug}.localhost:${port}`;
    const devRendererUrl = `http://${cleanSlug}.localhost:${rendererPort}`;
    const devQueryUrl = `http://localhost:${port}?subdomain=${cleanSlug}`;
    return {
        canonicalUrl,
        devLocalhostUrl,
        devRendererUrl,
        devQueryUrl,
        isSubdomain: true,
        primaryUrl: params.isDev ? devLocalhostUrl : canonicalUrl,
    };
}
