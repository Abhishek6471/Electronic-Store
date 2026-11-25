const { ZodError } = require('zod');
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) return res.status(400).json({ error: 'Invalid input', details: err.issues.map(i => ({ field: i.path.join('.'), message: i.message })) });
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  console.error(err); res.status(500).json({ error: 'Something went wrong' });
}
module.exports = { HttpError, wrap, errorHandler };
