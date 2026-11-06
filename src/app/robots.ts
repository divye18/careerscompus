import type { MetadataRoute } from 'next';
import { IS_PRODUCTION_SITE, SITE_URL } from '@/lib/site';

/** Production may be crawled. Preview, staging and local builds disallow everything and advertise no sitemap. */
export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION_SITE) return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/' }, host: SITE_URL, sitemap: `${SITE_URL}/sitemap.xml` };
}
