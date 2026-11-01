import React, { useState } from 'react';

export default function SearchPrice({
  onSearchExact,
  onSearchRange,
  onClearSearch,
  searchResults,
  searchTrace = [],
  isSearching,
  totalProductsCount = 0,
}) {
  const [mode, setMode] = useState('exact'); // 'exact' | 'range' | 'budget'
  const [exactPrice, setExactPrice] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [budget, setBudget] = useState('');

  const fmtINR = v => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleSubmit = e => {
    e.preventDefault();
    if (mode === 'exact') {
      if (!exactPrice) return;
      onSearchExact(parseFloat(exactPrice));
    } else if (mode === 'range') {
      if (!minPrice || !maxPrice) return;
      onSearchRange(parseFloat(minPrice), parseFloat(maxPrice));
    } else {
      if (!budget) return;
      onSearchRange(0, parseFloat(budget));
    }
  };

  const handleClear = () => {
    onClearSearch();
    setExactPrice(''); setMinPrice(''); setMaxPrice(''); setBudget('');
  };

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <div className="section-title">Price Search</div>
          <div className="section-sub">O(log n) binary search on the AVL price tree · {totalProductsCount} products indexed</div>
        </div>
      </div>

      {/* Search card */}
      <div className="card">
        {/* Mode tabs */}
        <div className="search-mode-tabs">
          {[['exact', 'Exact Price'], ['range', 'Price Range'], ['budget', 'Budget (≤)']].map(([k, label]) => (
            <button
              key={k}
              type="button"
              className={`search-tab-btn${mode === k ? ' active' : ''}`}
              onClick={() => { setMode(k); onClearSearch(); }}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'exact' && (
            <div className="input-group" style={{ maxWidth: 320 }}>
              <label className="input-label">Exact Price (₹ INR)</label>
              <input
                className="input"
                type="number" step="0.01" min="0"
                placeholder="e.g. 2499.00"
                value={exactPrice}
                onChange={e => setExactPrice(e.target.value)}
              />
            </div>
          )}
          {mode === 'range' && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div className="input-group" style={{ flex: 1, minWidth: 160 }}>
                <label className="input-label">Min Price (₹)</label>
                <input className="input" type="number" step="0.01" min="0" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
              </div>
              <div className="input-group" style={{ flex: 1, minWidth: 160 }}>
                <label className="input-label">Max Price (₹)</label>
                <input className="input" type="number" step="0.01" min="0" placeholder="10000" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
              </div>
            </div>
          )}
          {mode === 'budget' && (
            <div className="input-group" style={{ maxWidth: 320 }}>
              <label className="input-label">Maximum Budget (₹ INR)</label>
              <input
                className="input"
                type="number" step="0.01" min="0"
                placeholder="e.g. 5000"
                value={budget}
                onChange={e => setBudget(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>
                Shows all products priced ₹0 – ₹{budget || '...'}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button type="submit" className="btn btn-primary" disabled={isSearching}>
              {isSearching ? 'Searching…' : '🔍 Search'}
            </button>
            {searchResults !== null && (
              <button type="button" className="btn btn-secondary" onClick={handleClear}>Clear</button>
            )}
          </div>
        </form>
      </div>

      {/* Search Trace */}
      {searchTrace.length > 0 && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: '12px' }}>🔎 AVL Traversal Trace (O(log n) path)</div>
          <div>
            {searchTrace.map((step, i) => (
              <div key={i} className="trace-step">
                <span style={{ color: 'var(--muted)', fontSize: '0.75rem', width: 24, flexShrink: 0 }}>#{i + 1}</span>
                {i > 0 && <span className="trace-arrow">→</span>}
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{fmtINR(step.node)}</span>
                <span style={{ color: 'var(--muted)' }}>
                  {step.direction === 'found'
                    ? '✅ Found'
                    : step.direction === 'left'
                    ? '← go left (node > target)'
                    : '→ go right (node < target)'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {searchResults !== null && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div className="card-title">
              {searchResults.length > 0 ? `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}` : 'No results'}
            </div>
          </div>
          {searchResults.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p>No products match your search criteria.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>ID</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Price (₹ INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map(p => (
                    <tr key={p.id}>
                      <td style={{ color: 'var(--muted)', fontFamily: 'monospace', fontSize: '0.8rem' }}>#{p.id}</td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td><span className="tag">{p.category}</span></td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>{fmtINR(p.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Info card (idle) */}
      {searchResults === null && (
        <div className="card" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
          <div className="card-title" style={{ marginBottom: '10px' }}>How AVL Tree Search Works</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--muted)' }}>
            <div>🌳 <strong>Exact search:</strong> O(log n) binary search — each comparison halves the remaining nodes.</div>
            <div>📊 <strong>Range search:</strong> In-order traversal of the sorted AVL tree between min and max keys.</div>
            <div>💰 <strong>Budget filter:</strong> Efficiently returns all products priced ≤ your budget.</div>
            <div style={{ marginTop: 4, padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)' }}>
              With {totalProductsCount} products, the AVL tree guarantees results in at most <strong>{Math.ceil(Math.log2(totalProductsCount + 1))} comparisons</strong> (log₂ {totalProductsCount}).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
