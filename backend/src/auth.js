const crypto = require('crypto'), bcrypt = require('bcryptjs'), { z } = require('zod'), express = require('express');
const prisma = require('./db'), { HttpError, wrap } = require('./util');
const COOKIE = 'rt_sid', DAYS = 7, sha = s => crypto.createHash('sha256').update(s).digest('hex');
const cookieOpts = () => ({ httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: DAYS * 864e5, path: '/' });
const publicUser = u => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, isSeller: u.isSeller, sellerVerified: u.sellerVerified, storeName: u.storeName, emailVerified: u.emailVerified });
// Attaches req.user from the session cookie (token is stored hashed)
const loadUser = wrap(async (req, _res, next) => {
  const t = req.cookies[COOKIE]; if (t) {
    const s = await prisma.session.findUnique({ where: { tokenHash: sha(t) }, include: { user: true } });
    if (s && s.expiresAt > new Date() && s.user.status === 'ACTIVE') req.user = s.user;
  } next();
});
const requireAuth = (req, _res, next) => req.user ? next() : next(new HttpError(401, 'Please log in'));
const requireRole = (...roles) => (req, _res, next) => !req.user ? next(new HttpError(401, 'Please log in')) : roles.includes(req.user.role) ? next() : next(new HttpError(403, 'Not allowed'));
// CSRF defence: cookie is SameSite=Lax and every state-changing request must carry a custom header (cross-site forms cannot set it)
const csrfGuard = (req, _res, next) => (['GET', 'HEAD', 'OPTIONS'].includes(req.method) || req.get('X-Requested-With') === 'fetch') ? next() : next(new HttpError(403, 'Missing request header'));
async function startSession(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  await prisma.session.create({ data: { tokenHash: sha(token), userId, expiresAt: new Date(Date.now() + DAYS * 864e5) } });
  res.cookie(COOKIE, token, cookieOpts());
}
const router = express.Router();
const reg = z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().toLowerCase().email(), password: z.string().min(8).max(100), wantsToSell: z.boolean().optional(), storeName: z.string().trim().max(80).optional() });
router.post('/register', wrap(async (req, res) => {
  const b = reg.parse(req.body);
  if (await prisma.user.findUnique({ where: { email: b.email } })) throw new HttpError(409, 'Email already registered');
  // role is ALWAYS USER here: clients can never choose an admin role
  const u = await prisma.user.create({ data: { name: b.name, email: b.email, passwordHash: await bcrypt.hash(b.password, 12), isSeller: !!b.wantsToSell, storeName: b.wantsToSell ? b.storeName || b.name + "'s Store" : null } });
  await startSession(res, u.id); res.status(201).json({ user: publicUser(u) });
}));
router.post('/login', wrap(async (req, res) => {
  const b = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) }).parse(req.body);
  const u = await prisma.user.findUnique({ where: { email: b.email } });
  if (!u || !(await bcrypt.compare(b.password, u.passwordHash))) throw new HttpError(401, 'Incorrect email or password');
  if (u.status !== 'ACTIVE') throw new HttpError(403, 'This account is suspended');
  await startSession(res, u.id); res.json({ user: publicUser(u) });
}));
router.post('/logout', wrap(async (req, res) => {
  const t = req.cookies[COOKIE]; if (t) await prisma.session.deleteMany({ where: { tokenHash: sha(t) } });
  res.clearCookie(COOKIE, { path: '/' }); res.json({ ok: true });
}));
router.get('/me', (req, res) => res.json({ user: req.user ? publicUser(req.user) : null }));
module.exports = { router, loadUser, requireAuth, requireRole, csrfGuard, publicUser };
