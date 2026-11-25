/* Loads the live catalogue from the backend API into the global RT_PRODUCTS / RT_CATS
   that the rest of the UI reads. Falls back to the bundled sample data (products.js)
   if the API is unreachable, so the UI still renders offline.
   Load order: products.js -> api.js -> catalog.js -> (pages) */
(function(){
  const apply = (cats, items) => {
    RT_CATS.length = 0; RT_CATS.push(...cats);
    RT_PRODUCTS.length = 0; RT_PRODUCTS.push(...items);
  };
  // Enrich API products with the client-only fields the UI expects.
  const enrich = (p) => {
    const cat = RT_CATS.find(c => c.id === p.category);
    const idx = parseInt(String(p.id).replace(/\D/g, ''), 10) || 0;
    return {
      ...p,
      daysAgo: p.createdAt ? Math.max(0, Math.floor((Date.now() - new Date(p.createdAt)) / 864e5)) : 0,
      image: p.image || ('assets/images/' + p.id + '.jpg'),
      fallbackImage: rtImg(cat ? cat.icon : '📦', (idx * 37) % 360),
      specs: p.specs && typeof p.specs === 'object' ? p.specs : {}
    };
  };
  window.rtLoadCatalog = async function(){
    try {
      const [cats, res] = await Promise.all([api('/categories'), api('/products?limit=48&sort=newest')]);
      if (!Array.isArray(cats) || !Array.isArray(res.items) || !res.items.length) return false;
      apply(cats, res.items.map(enrich));
      return true;
    } catch { return false; } // keep bundled sample data
  };
  window.rtCatalogReady = window.rtLoadCatalog();
  // Run a page's init only after the live catalogue has loaded.
  window.rtReady = (fn) => { window.rtCatalogReady.then(fn).catch(err => { console.error(err); fn(); }); };
})();