import { getCollection, type CollectionKey } from 'astro:content';

/**
 * Wraps getCollection() with a draft filter active only in production
 * builds. Drafts (status === 'draft') stay visible in `npm run dev` so
 * authors can preview unpublished entries; they're stripped from the
 * static output that ships to Vercel.
 *
 * Use this for routing (getStaticPaths) and for index lists. Cross-
 * reference lookups inside [slug].astro pages should call getCollection
 * directly so that title resolution still works on draft targets.
 */
export async function getPublished<K extends CollectionKey>(name: K) {
  const all = await getCollection(name);
  if (!import.meta.env.PROD) return all;
  return all.filter((entry) => {
    const status = (entry.data as { status?: string }).status;
    return status !== 'draft';
  });
}
