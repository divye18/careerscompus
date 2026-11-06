/** Production origin. Canonical URLs and the sitemap always use it, on every deployment. */
export const SITE_URL = 'https://careerscompus.in';

/**
 * Only the production deployment may be indexed. Everything else (preview, staging, local) is noindex by default, so a
 * forgotten setting fails safe. Vercel sets VERCEL_ENV; on any other host set SITE_ENV=production for production only.
 */
export const IS_PRODUCTION_SITE = process.env.SITE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

/**
 * How It Works, Platform Principles and the Final CTA are older Light Royal sections that Scenes 6 to 8 will replace.
 * They are hidden, with their code intact. Set NEXT_PUBLIC_SHOW_INTERIM_SECTIONS=1 at build time to show them again.
 */
export const SHOW_INTERIM_SECTIONS = process.env.NEXT_PUBLIC_SHOW_INTERIM_SECTIONS === '1';
