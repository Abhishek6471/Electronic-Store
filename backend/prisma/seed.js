// Seeds categories, demo users and the 24 sample products from the frontend's products.js
const fs = require('fs'), path = require('path'), vm = require('vm'), bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client'), prisma = new PrismaClient();
(async () => {
  const src = fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'js', 'products.js'), 'utf8');
  const { RT_CATS, RT_PRODUCTS } = vm.runInNewContext(src + ';({RT_CATS,RT_PRODUCTS})');
  const hash = await bcrypt.hash(process.env.SEED_PASSWORD || 'ChangeMe!2026', 12);
  const demo = [['admin@retech.local', 'Demo Super Admin', 'SUPER_ADMIN'], ['market.mod@retech.local', 'Demo Marketplace Mod', 'MARKETPLACE_MOD'], ['community.mod@retech.local', 'Demo Community Mod', 'COMMUNITY_MOD'], ['support@retech.local', 'Demo Support Admin', 'SUPPORT_ADMIN'], ['student@retech.local', 'Demo Verified Student', 'VERIFIED_STUDENT'], ['buyer@retech.local', 'Demo Buyer', 'USER'], ['seller@retech.local', 'Demo Seller', 'USER']];
  for (const [email, name, role] of demo) await prisma.user.upsert({ where: { email }, update: {}, create: { email, name, role, passwordHash: hash, emailVerified: true, isSeller: email.startsWith('seller'), sellerVerified: email.startsWith('seller'), storeName: email.startsWith('seller') ? 'Demo Electronics' : null } });
  const seller = await prisma.user.findUnique({ where: { email: 'seller@retech.local' } });
  for (const c of RT_CATS) await prisma.category.upsert({ where: { id: c.id }, update: {}, create: { id: c.id, name: c.name, icon: c.icon } });
  for (const p of RT_PRODUCTS) {
    const url = `/assets/images/${p.id}.jpg`; // real photos go here (see assets/images/README.txt)
    await prisma.product.upsert({ where: { id: p.id }, update: {}, create: { id: p.id, name: p.name, brand: p.brand, categoryId: p.category, price: p.price, previousPrice: p.previousPrice, condition: p.condition, description: p.description, specs: JSON.stringify(p.specs || {}), stock: p.stock, rating: p.rating, location: p.location, warranty: p.warranty, status: 'APPROVED', sellerId: seller.id, images: { create: [{ url, isMain: true }] } } });
  }
  await prisma.setting.upsert({ where: { key: 'delivery' }, update: {}, create: { key: 'delivery', value: JSON.stringify({ delivery: 200, freeOver: 50000 }) } });
  console.log('Seeded. Demo password:', process.env.SEED_PASSWORD || 'ChangeMe!2026', '(change it)');
})().finally(() => prisma.$disconnect());
