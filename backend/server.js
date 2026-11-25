require('dotenv').config();
const express = require('express'), helmet = require('helmet'), cookieParser = require('cookie-parser'), rateLimit = require('express-rate-limit'), path = require('path');
const { router: authRouter, loadUser, csrfGuard } = require('./src/auth'), { router: catalog } = require('./src/catalog'), { router: orders } = require('./src/orders'), { errorHandler } = require('./src/util');
const app = express(), ROOT = path.join(__dirname, '..');
app.disable('x-powered-by');
// The frontend uses inline onerror handlers and data: images, so the CSP allows those; tighten after the inline handlers are removed
app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], scriptSrcAttr: ["'unsafe-inline'"], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", 'data:', 'blob:'], upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null } } }));
app.use(express.json({ limit: '100kb' })); app.use(cookieParser());
app.use('/api', loadUser, csrfGuard);
const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
app.use(['/api/auth/login', '/api/auth/register'], authLimit);
app.use('/api/auth', authRouter);
app.use('/api', catalog); app.use('/api/orders', orders);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));
// Serve the existing frontend; never expose backend source, env files or dotfiles
app.use((req, res, next) => /^\/backend(\/|$)/i.test(req.path) ? res.status(404).end() : next());
app.use(express.static(ROOT, { dotfiles: 'deny', index: 'index.html' }));
app.use(errorHandler);
app.listen(process.env.PORT || 4000, () => console.log('ReTech Nepal on http://localhost:' + (process.env.PORT || 4000)));
