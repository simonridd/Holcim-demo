/** Local-only catalogue contract. Metadata never becomes markup or an external URL. */
export function validateCatalog(raw) {
  if (!raw || !Array.isArray(raw.demos) || raw.demos.length > 200) throw Error('Invalid demo collection');
  const slugs = new Set();
  for (const demo of raw.demos) {
    if (!demo || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(demo.slug) || slugs.has(demo.slug)) throw Error('Invalid or duplicate demo route');
    slugs.add(demo.slug);
    for (const key of ['title', 'category', 'description']) if (typeof demo[key] !== 'string' || !demo[key].trim() || demo[key].length > 500) throw Error('Invalid demo metadata');
    if (!Array.isArray(demo.tags) || demo.tags.length > 6 || demo.tags.some(tag => typeof tag !== 'string' || !tag.trim() || tag.length > 60)) throw Error('Invalid demo tags');
    if (demo.accent !== undefined && !/^#[a-f0-9]{6}$/i.test(demo.accent)) throw Error('Invalid accent');
    if (demo.logo !== undefined && (typeof demo.logo !== 'string' || !/^[a-z0-9][a-z0-9/_-]*\.(?:svg|png|webp)$/i.test(demo.logo) || demo.logo.includes('//'))) throw Error('Logo must be a local asset');
  }
  return raw.demos;
}
export function filterDemos(demos, query) {
  const words = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return demos.filter(d => words.every(word => [d.title, d.category, d.description, ...d.tags].join(' ').toLocaleLowerCase().includes(word)));
}
