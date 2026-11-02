import { useEffect, useState } from 'react';
import { fetchProducts, fetchBrands, fetchCategories } from './api';
import useDebounce from './useDebounce';

const INITIAL = { q: '', category: '', brand: [], minPrice: '', maxPrice: '', inStock: false, minRating: '', sort: 'newest', page: 1 };

function CategoryList({ nodes, active, onPick, depth = 0 }) {
  return (
    <ul className="cats">
      {nodes.map((c) => (
        <li key={c._id}>
          <button className={active === c.slug ? 'on' : ''} style={{ paddingLeft: 8 + depth * 14 }} onClick={() => onPick(c.slug)}>{c.name}</button>
          {c.children?.length > 0 && <CategoryList nodes={c.children} active={active} onPick={onPick} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const [f, setF] = useState(INITIAL);
  const [cats, setCats] = useState([]);
  const [brands, setBrands] = useState([]);
  const [res, setRes] = useState({ data: [], pagination: { page: 1, pages: 1, total: 0 } });
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const dq = useDebounce(f.q);
  const dmin = useDebounce(f.minPrice), dmax = useDebounce(f.maxPrice);

  useEffect(() => { fetchCategories().then((r) => setCats(r.data)).catch(() => {}); fetchBrands().then((r) => setBrands(r.data)).catch(() => {}); }, []);

  useEffect(() => {
    let stale = false;
    setState('loading');
    fetchProducts({ ...f, q: dq, minPrice: dmin, maxPrice: dmax, brand: f.brand.join(','), sort: dq && f.sort === 'newest' ? 'relevance' : f.sort, limit: 12 })
      .then((r) => { if (!stale) { setRes(r); setState('ready'); } })
      .catch((e) => { if (!stale) { setError(e.message); setState('error'); } });
    return () => { stale = true; };
  }, [dq, dmin, dmax, f.category, f.brand, f.inStock, f.minRating, f.sort, f.page]);

  const set = (patch) => setF((p) => ({ ...p, page: 1, ...patch }));
  const toggleBrand = (b) => set({ brand: f.brand.includes(b) ? f.brand.filter((x) => x !== b) : [...f.brand, b] });
  const { page, pages, total } = res.pagination;

  return (
    <div className="shell">
      <header>
        <h1>Catalog</h1>
        <input className="search" type="search" placeholder="Search products, brands, tags" value={f.q} onChange={(e) => set({ q: e.target.value })} aria-label="Search products" />
      </header>

      <aside>
        <h2>Category</h2>
        <button className={!f.category ? 'on all' : 'all'} onClick={() => set({ category: '' })}>All products</button>
        <CategoryList nodes={cats} active={f.category} onPick={(slug) => set({ category: slug })} />

        <h2>Brand</h2>
        {brands.map((b) => (
          <label key={b} className="check"><input type="checkbox" checked={f.brand.includes(b)} onChange={() => toggleBrand(b)} />{b}</label>
        ))}

        <h2>Price</h2>
        <div className="range">
          <input type="number" min="0" placeholder="Min" value={f.minPrice} onChange={(e) => set({ minPrice: e.target.value })} aria-label="Minimum price" />
          <input type="number" min="0" placeholder="Max" value={f.maxPrice} onChange={(e) => set({ maxPrice: e.target.value })} aria-label="Maximum price" />
        </div>

        <h2>Availability</h2>
        <label className="check"><input type="checkbox" checked={f.inStock} onChange={(e) => set({ inStock: e.target.checked })} />In stock only</label>
        <select value={f.minRating} onChange={(e) => set({ minRating: e.target.value })} aria-label="Minimum rating">
          <option value="">Any rating</option><option value="4">4 and up</option><option value="4.5">4.5 and up</option>
        </select>
        <button className="reset" onClick={() => setF(INITIAL)}>Clear filters</button>
      </aside>

      <main>
        <div className="bar">
          <span>{state === 'loading' ? 'Loading…' : `${total} products`}</span>
          <select value={f.sort} onChange={(e) => set({ sort: e.target.value })} aria-label="Sort">
            <option value="newest">Newest</option><option value="price_asc">Price, low to high</option>
            <option value="price_desc">Price, high to low</option><option value="rating">Top rated</option>
          </select>
        </div>

        {state === 'error' && <p className="note">Couldn’t load products: {error}. Check that the API is running on port 5000.</p>}
        {state === 'ready' && res.data.length === 0 && <p className="note">No products match these filters. Try removing a brand or widening the price range.</p>}

        <div className="grid">
          {res.data.map((p) => (
            <article key={p._id} className={p.stock ? '' : 'out'}>
              <div className="thumb">
                {p.image ? <img src={p.image} alt={p.name} loading="lazy" onError={(e) => { e.currentTarget.remove(); }} /> : null}
                <span aria-hidden="true">{p.name.charAt(0)}</span>
              </div>
              <small>{p.category?.name} · {p.brand}</small>
              <h3>{p.name}</h3>
              <p className="meta">★ {p.rating} {p.stock ? `· ${p.stock} left` : '· Sold out'}</p>
              <strong>₹{p.price.toLocaleString('en-IN')}</strong>
            </article>
          ))}
        </div>

        {pages > 1 && (
          <nav className="pager" aria-label="Pagination">
            <button disabled={page <= 1} onClick={() => setF({ ...f, page: page - 1 })}>Previous</button>
            <span>Page {page} of {pages}</span>
            <button disabled={page >= pages} onClick={() => setF({ ...f, page: page + 1 })}>Next</button>
          </nav>
        )}
      </main>
    </div>
  );
}
