import type { MetadataRoute } from 'next';
import { IS_PRODUCTION_SITE, SITE_URL } from '@/lib/site';

/** Only real routes belong here. The homepage is the only one today; add routes as they ship. */
export default function sitemap(): MetadataRoute.Sitemap {
  // Non-production builds list nothing, so a preview never advertises production URLs as its own.
  if (!IS_PRODUCTION_SITE) return [];
  return [{ url: `${SITE_URL}/`, changeFrequency: 'monthly', priority: 1 }];
}
