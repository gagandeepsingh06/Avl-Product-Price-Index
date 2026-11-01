import React, { useState, useMemo } from 'react';

const CATEGORIES = ['Electronics', 'Displays', 'Accessories', 'Audio', 'Storage', 'Home Office', 'Stationery', 'Other'];
const PRESETS = [499, 999, 1649, 2499, 4199, 6799, 9299, 15999];

export default function ProductManager({
  products = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetData,
  lastOpComplexity,
  loading,
}) {
  const [showForm, setShowForm] = useState(false);
  const [showComplexity, setShowComplexity] = useState(false);
  const [compTab, setCompTab] = useState('add');
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [sortBy, setSortBy] = useState('price-asc');
  const [dismissedOp, setDismissedOp] = useState(false);

  const priceFreq = useMemo(() =>
    products.reduce((a, p) => { a[p.price] = (a[p.price] || 0) + 1; return a; }, {}),
    [products]
  );

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const q = search.toLowerCase();
      return (
        (p.name.toLowerCase().includes(q) ||
         p.category.toLowerCase().includes(q) ||
         String(p.price).includes(q)) &&
        (filterCat === 'All' || p.category === filterCat)
      );
    });
    if (sortBy === 'price-asc')  list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sortBy === 'name-asc')   list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, search, filterCat, sortBy]);

  const openAdd = () => { setEditId(null); setName(''); setCategory(''); setPrice(''); setShowForm(true); };
  const openEdit = p => { setEditId(p.id); setName(p.name); setCategory(p.category); setPrice(String(p.price)); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const closeForm = () => { setShowForm(false); setEditId(null); setName(''); setCategory(''); setPrice(''); };

  const handleSubmit = e => {
    e.preventDefault();
    const num = parseFloat(price);
    if (isNaN(num) || num < 0) { alert('Enter a valid price in ₹'); return; }
    setDismissedOp(false);
    if (editId !== null) { onUpdateProduct(editId, { name, category, price: num }); }
    else                 { onAddProduct({ name, category, price: num }); }
    closeForm();
  };

  const fmtINR = v => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="page">
      {/* ── Section Header ── */}
      <div className="section-header">
        <div>
          <div className="section-title">Product Catalog</div>
          <div className="section-sub">{products.length} products indexed in the self-balancing AVL Tree</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary" onClick={onResetData} title="Reload 10 demo products">
            📦 Pre-add 10 Products
          </button>
          <button
            type="button"
            className={`btn ${showComplexity ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowComplexity(v => !v)}
          >
            ⚡ {showComplexity ? 'Hide Complexities' : 'AVL Complexities'}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { if (showForm) closeForm(); else openAdd(); }}>
            {showForm && editId === null ? 'Cancel' : '+ Add Product'}
          </button>
        </div>
      </div>

      {/* ── Last operation complexity banner ── */}
      {lastOpComplexity && !dismissedOp && (
        <div className="card complexity-banner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.3rem' }}>⚡</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  AVL Operation:{' '}
                  <span style={{ color: lastOpComplexity.operation === 'add' ? 'var(--emerald)' : 'var(--amber)' }}>
                    {lastOpComplexity.operation === 'add' ? 'Insertion' : 'Deletion'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '2px' }}>
                  {lastOpComplexity.explanation}
                </div>
              </div>
            </div>
            <button type="button" className="close-btn" onClick={() => setDismissedOp(true)}>✕</button>
          </div>
          <div className="comp-metric-row">
            {[
              ['Time', lastOpComplexity.time_complexity],
              ['Comparisons', `${lastOpComplexity.comparisons} levels`],
              ['Rotations', lastOpComplexity.rotations_count > 0 ? lastOpComplexity.rotations.join(', ') : '0'],
              ['Tree Height', lastOpComplexity.tree_height_after],
            ].map(([k, v]) => (
              <div key={k} className="comp-metric-chip">
                <span style={{ color: 'var(--muted)', marginRight: 4 }}>{k}:</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Complexity Guide (collapsible) ── */}
      {showComplexity && (
        <div className="card" style={{ borderLeft: '3px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <div className="card-title">📐 AVL Algorithmic Complexities</div>
              <div className="card-sub">Theoretical and structural analysis for price index operations</div>
            </div>
            <div className="seg-ctrl">
              <button type="button" className={`seg-btn${compTab === 'add' ? ' active' : ''}`} onClick={() => setCompTab('add')}>Adding</button>
              <button type="button" className={`seg-btn${compTab === 'remove' ? ' active' : ''}`} onClick={() => setCompTab('remove')}>Removing</button>
            </div>
          </div>

          {compTab === 'add' ? (
            <>
              <div className="comp-grid">
                <div className="comp-box"><span className="comp-box-title">Best Case</span><span className="comp-box-val text-emerald">O(1)</span><span className="comp-box-sub">Duplicate price → just append</span></div>
                <div className="comp-box"><span className="comp-box-title">Average / Worst</span><span className="comp-box-val text-indigo">O(log n)</span><span className="comp-box-sub">Bounded by 1.44 × log₂(n+2)</span></div>
                <div className="comp-box"><span className="comp-box-title">Max Rotations</span><span className="comp-box-val text-emerald">≤ 1</span><span className="comp-box-sub">Single (LL/RR) or Double (LR/RL)</span></div>
              </div>
              <div className="steps-list">
                <strong style={{ fontSize: '0.82rem' }}>Phases when adding a product:</strong>
                <ol style={{ marginTop: '8px' }}>
                  <li><strong>BST Descent O(log n):</strong> Traverse from root, comparing price keys to find insertion point.</li>
                  <li><strong>Node Attach O(1):</strong> Create new AVLNode or append to existing node's product list.</li>
                  <li><strong>Height Update O(log n):</strong> Unwind recursion, recalculate heights up to root.</li>
                  <li><strong>Balance Check:</strong> Verify BF = height(left) − height(right) ∈ [−1, +1] at each ancestor.</li>
                  <li><strong>At most 1 Rotation O(1):</strong> If |BF| &gt; 1, one single or double rotation restores AVL invariant — then stops.</li>
                </ol>
              </div>
            </>
          ) : (
            <>
              <div className="comp-grid">
                <div className="comp-box"><span className="comp-box-title">Best Case</span><span className="comp-box-val text-emerald">O(1)</span><span className="comp-box-sub">Shared price node — pop from list</span></div>
                <div className="comp-box"><span className="comp-box-title">Average / Worst</span><span className="comp-box-val text-indigo">O(log n)</span><span className="comp-box-sub">Lookup + splice + cascade</span></div>
                <div className="comp-box"><span className="comp-box-title">Max Rotations</span><span className="comp-box-val text-amber">O(log n)</span><span className="comp-box-sub">Cascade from leaf to root</span></div>
              </div>
              <div className="steps-list">
                <strong style={{ fontSize: '0.82rem' }}>Phases when removing a product:</strong>
                <ol style={{ marginTop: '8px' }}>
                  <li><strong>BST Search O(log n):</strong> Locate product's price node via binary search.</li>
                  <li><strong>Bucket Check O(1):</strong> If other products share this price, remove from list only — tree unchanged.</li>
                  <li><strong>Node Splice:</strong> Empty node is removed. Two children → find in-order successor (min of right subtree) in O(log n).</li>
                  <li><strong>Height Recalculation:</strong> Ancestors updated on the way back to root.</li>
                  <li><strong>Cascade Rebalancing O(log n):</strong> Unlike insertion, deletion can propagate imbalances upward — multiple rotations may occur up to the root.</li>
                </ol>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Add / Edit Form ── */}
      {showForm && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div className="card-title">
              {editId !== null ? `Edit Product #${editId}` : 'Add New Product'}
            </div>
            <button type="button" className="close-btn" onClick={closeForm}>✕</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label">Product Name</label>
                <input className="input" type="text" placeholder="e.g. Mechanical Keyboard" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Category</label>
                <input className="input" type="text" list="cat-opts" placeholder="e.g. Electronics" value={category} onChange={e => setCategory(e.target.value)} required />
                <datalist id="cat-opts">{CATEGORIES.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <div className="input-group">
                <label className="input-label">Price (₹ INR)</label>
                <input className="input" type="number" step="0.01" min="0" placeholder="e.g. 2499.00" value={price} onChange={e => setPrice(e.target.value)} required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Quick presets:</span>
              {PRESETS.map(p => (
                <button key={p} type="button" className="preset-chip" onClick={() => setPrice(String(p))}>
                  ₹{p.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {editId !== null ? 'Save Changes' : '+ Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Products Table ── */}
      <div className="card" style={{ padding: '0' }}>
        {/* Toolbar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="toolbar" style={{ marginBottom: 0 }}>
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search by name, category or price…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select className="select" style={{ width: 'auto' }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="select" style={{ width: 'auto' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="name-asc">Name A–Z</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p style={{ fontWeight: 600 }}>No products found</p>
            <p>Click <strong>"📦 Pre-add 10 Products"</strong> to load the demo catalog.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 60 }}>ID</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price (₹ INR)</th>
                  <th>AVL Node</th>
                  <th style={{ textAlign: 'right', width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--muted)', fontFamily: 'monospace', fontSize: '0.8rem' }}>#{p.id}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><span className="tag">{p.category}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>{fmtINR(p.price)}</td>
                    <td>
                      {priceFreq[p.price] > 1
                        ? <span className="tag tag-warn" title={`${priceFreq[p.price]} products share this price`}>Shared ({priceFreq[p.price]})</span>
                        : <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Unique</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" className="action-btn action-btn-edit" onClick={() => openEdit(p)}>Edit</button>
                      <span style={{ color: 'var(--border)', margin: '0 6px' }}>|</span>
                      <button type="button" className="action-btn action-btn-del" onClick={() => onDeleteProduct(p.id, p.name)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
