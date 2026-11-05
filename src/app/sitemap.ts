import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/** Only real routes belong here. The homepage is the only one today; add routes as they ship. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/`, changeFrequency: 'monthly', priority: 1 }];
}
