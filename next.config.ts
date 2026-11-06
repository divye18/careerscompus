import type { NextConfig } from 'next';

/**
 * Domain policy. Production is https://careerscompus.in (non-www, HTTPS). The redirect and HSTS below are served by
 * Next on any host that reaches it; the HTTP to HTTPS redirect itself is performed by the hosting edge (Vercel does
 * this by default) and must stay enabled in the domain settings.
 *
 * Indexing: only the production deployment may be indexed (SITE_ENV=production or VERCEL_ENV=production). Every other
 * deployment sends X-Robots-Tag noindex and a disallow-all robots.txt, so a preview can never be indexed by mistake.
 */
const isProduction = process.env.SITE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.careerscompus.in' }],
        destination: 'https://careerscompus.in/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    const headers = [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }];
    if (!isProduction) headers.push({ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' });
    return [{ source: '/:path*', headers }];
  },
};

export default nextConfig;
