const BASE = '/api/v1';
async function get(path, params = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null && v !== false)).toString();
  const res = await fetch(`${BASE}${path}${qs ? '?' + qs : ''}`);
  const body = await res.json();
  if (!res.ok) throw new Error(body.details?.join(', ') || body.message);
  return body;
}
export const fetchProducts = (p) => get('/products', p);
export const fetchBrands = () => get('/products/brands');
export const fetchCategories = () => get('/categories');
