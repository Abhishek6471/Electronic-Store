const express = require('express'), { z } = require('zod'), prisma = require('./db'), { HttpError, wrap } = require('./util');
const r = express.Router();
const q = z.object({ q: z.string().trim().optional(), category: z.string().optional(), brand: z.string().optional(), condition: z.string().optional(), location: z.string().optional(),
  minPrice: z.coerce.number().int().min(0).optional(), maxPrice: z.coerce.number().int().min(0).optional(), sort: z.enum(['newest', 'low', 'high', 'popular', 'discount']).default('newest'),
  page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(48).default(12) });
const dto = p => { let specs = {}; try { specs = typeof p.specs === 'string' ? JSON.parse(p.specs) : (p.specs || {}); } catch { specs = {}; } return { id: p.id, name: p.name, brand: p.brand, category: p.categoryId, price: p.price, previousPrice: p.previousPrice, condition: p.condition, description: p.description, specs, stock: p.stock, rating: p.rating, location: p.location, warranty: p.warranty,
  sellerId: p.sellerId, sellerName: p.seller?.storeName || p.seller?.name, verifiedSeller: !!p.seller?.sellerVerified, images: (p.images || []).sort((a, b) => b.isMain - a.isMain || a.position - b.position).map(i => i.url), image: (p.images || []).find(i => i.isMain)?.url || p.images?.[0]?.url, createdAt: p.createdAt }; };
r.get('/categories', wrap(async (_req, res) => res.json(await prisma.category.findMany())));
r.get('/products', wrap(async (req, res) => {
  const f = q.parse(req.query), list = s => s ? s.split(',') : undefined;
  const where = { status: 'APPROVED', ...(f.category && { categoryId: f.category }), ...(f.brand && { brand: { in: list(f.brand) } }), ...(f.condition && { condition: { in: list(f.condition) } }), ...(f.location && { location: { in: list(f.location) } }),
    ...((f.minPrice !== undefined || f.maxPrice !== undefined) && { price: { gte: f.minPrice, lte: f.maxPrice } }),
    ...(f.q && { OR: [{ name: { contains: f.q } }, { brand: { contains: f.q } }] }) };
  const orderBy = { newest: { createdAt: 'desc' }, low: { price: 'asc' }, high: { price: 'desc' }, popular: { rating: 'desc' }, discount: { createdAt: 'desc' } }[f.sort];
  const inc = { images: true, seller: true }; let total, items;
  if (f.sort === 'discount') { // computed value, so sort in memory, then paginate
    const all = (await prisma.product.findMany({ where, include: inc })).map(dto).sort((a, b) => (1 - b.price / b.previousPrice) - (1 - a.price / a.previousPrice));
    total = all.length; items = all.slice((f.page - 1) * f.limit, f.page * f.limit);
  } else {
    let rows; [total, rows] = await Promise.all([prisma.product.count({ where }), prisma.product.findMany({ where, orderBy, skip: (f.page - 1) * f.limit, take: f.limit, include: inc })]); items = rows.map(dto);
  }
  res.json({ items, total, page: f.page, pages: Math.ceil(total / f.limit) });
}));
r.get('/products/:id', wrap(async (req, res) => {
  const p = await prisma.product.findFirst({ where: { id: req.params.id, status: 'APPROVED' }, include: { images: true, seller: true } });
  if (!p) throw new HttpError(404, 'Product not found'); res.json(dto(p));
}));
module.exports = { router: r, dto };
