/* Central API client for the backend (all pages). */
const RTApi = {
  async call(path, { method = 'GET', body } = {}) {
    let res;
    try { res = await fetch('/api' + path, { method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' }, body: body ? JSON.stringify(body) : undefined }); }
    catch { throw new Error('Network problem. Check your connection and try again.'); }
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { const e = new Error(data.error || 'Please log in'); e.status = 401; throw e; }
    if (!res.ok) { const e = new Error(data.error || 'Request failed'); e.status = res.status; e.details = data.details; throw e; }
    return data;
  },
  me: () => RTApi.call('/auth/me'), login: (b) => RTApi.call('/auth/login', { method: 'POST', body: b }), register: (b) => RTApi.call('/auth/register', { method: 'POST', body: b }), logout: () => RTApi.call('/auth/logout', { method: 'POST' }),
  products: (params = {}) => RTApi.call('/products?' + new URLSearchParams(params)), product: (id) => RTApi.call('/products/' + id), categories: () => RTApi.call('/categories'),
  placeOrder: (b) => RTApi.call('/orders', { method: 'POST', body: b }), orders: () => RTApi.call('/orders'), cancelOrder: (id) => RTApi.call('/orders/' + id + '/cancel', { method: 'POST' })
};
/* Global helper used across the pages: api('/path', { method, body }) */
const api = (path, opts = {}) => RTApi.call(path, opts);
