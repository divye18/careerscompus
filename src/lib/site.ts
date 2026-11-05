/**
 * Canonical origin of the site. Docs name https://careerscompus.in as the production domain; a deployment on another
 * host (staging, preview) sets NEXT_PUBLIC_SITE_URL so canonical URLs and the sitemap do not point at the wrong place.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://careerscompus.in').replace(/\/$/, '');
