const express = require('express'), { z } = require('zod'), prisma = require('./db'), { HttpError, wrap } = require('./util'), { requireAuth } = require('./auth');
const r = express.Router(); r.use(requireAuth);
const body = z.object({ idempotencyKey: z.string().min(8).max(80), paymentMethod: z.enum(['COD', 'ESEWA', 'KHALTI']),
  items: z.array(z.object({ productId: z.string(), qty: z.number().int().min(1).max(20) })).min(1).max(30),
  address: z.object({ name: z.string().trim().min(3), phone: z.string().regex(/^9[78]\d{8}$/), email: z.string().email(), province: z.string().min(2), district: z.string().min(2), city: z.string().min(2), address: z.string().min(6), notes: z.string().max(300).optional() }) });
async function settings(tx) { const row = await tx.setting.findUnique({ where: { key: 'delivery' } }); let v = {}; try { v = typeof row?.value === 'string' ? JSON.parse(row.value) : (row?.value || {}); } catch { v = {}; } return { delivery: 200, freeOver: 50000, ...v }; }
r.post('/', wrap(async (req, res) => {
  const b = body.parse(req.body), key = req.user.id + ':' + b.idempotencyKey;
  // Real eSewa/Khalti need merchant credentials and server-side verification (not implemented in this batch), so refuse rather than fake a payment
  if (b.paymentMethod !== 'COD') throw new HttpError(501, b.paymentMethod + ' is not configured yet. Use Cash on Delivery.');
  const dup = await prisma.order.findUnique({ where: { idempotencyKey: key }, include: { items: true } }); if (dup) return res.json(dup);
  const merged = [...b.items.reduce((m, i) => m.set(i.productId, (m.get(i.productId) || 0) + i.qty), new Map())];
  let order;
  try { order = await prisma.$transaction(async tx => {
    const prods = await tx.product.findMany({ where: { id: { in: merged.map(m => m[0]) }, status: 'APPROVED' } });
    if (prods.length !== merged.length) throw new HttpError(400, 'Some products are no longer available');
    let sub = 0; const lines = [];
    for (const [id, qty] of merged) {
      const p = prods.find(x => x.id === id);
      if (p.sellerId === req.user.id) throw new HttpError(400, 'You cannot buy your own listing');
      const u = await tx.product.updateMany({ where: { id, stock: { gte: qty } }, data: { stock: { decrement: qty } } }); // atomic: prevents overselling
      if (!u.count) throw new HttpError(409, 'Not enough stock for ' + p.name);
      sub += p.price * qty; lines.push({ productId: id, name: p.name, price: p.price, qty });
    }
    const s = await settings(tx), delivery = sub >= s.freeOver ? 0 : s.delivery; // totals come from the DB, never from the browser
    return tx.order.create({ data: { userId: req.user.id, idempotencyKey: key, paymentMethod: 'COD', subtotal: sub, delivery, total: sub + delivery, address: JSON.stringify(b.address), items: { create: lines } }, include: { items: true } });
  }); } catch (e) { if (e.code === 'P2002') { const ex = await prisma.order.findUnique({ where: { idempotencyKey: key }, include: { items: true } }); if (ex) return res.json(ex); } throw e; }
  res.status(201).json({ ...order, address: safeParse(order.address) });
}));
const safeParse = v => { try { return typeof v === 'string' ? JSON.parse(v) : (v || {}); } catch { return {}; } };
r.get('/', wrap(async (req, res) => { const orders = await prisma.order.findMany({ where: { userId: req.user.id }, include: { items: true }, orderBy: { createdAt: 'desc' } }); res.json(orders.map(o => ({ ...o, address: safeParse(o.address) }))); }));
r.post('/:id/cancel', wrap(async (req, res) => {
  const o = await prisma.$transaction(async tx => {
    const o = await tx.order.findFirst({ where: { id: req.params.id, userId: req.user.id }, include: { items: true } });
    if (!o) throw new HttpError(404, 'Order not found'); if (!['PENDING', 'PROCESSING'].includes(o.status)) throw new HttpError(409, 'This order can no longer be cancelled');
    const claim = await tx.order.updateMany({ where: { id: o.id, status: { in: ['PENDING', 'PROCESSING'] } }, data: { status: 'CANCELLED' } });
    if (!claim.count) throw new HttpError(409, 'This order can no longer be cancelled');
    for (const i of o.items) await tx.product.update({ where: { id: i.productId }, data: { stock: { increment: i.qty } } });
    return tx.order.findUnique({ where: { id: o.id }, include: { items: true } });
  }); res.json(o);
}));
module.exports = { router: r };
