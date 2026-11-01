import React, { useState } from 'react';

export default function Dashboard({
  stats = {},
  products = [],
  lastOpComplexity,
  onNavigateToProducts,
  onNavigateToTree,
  onNavigateToSearch,
  onAddProduct,
  onQuickDelete,
}) {
  const {
    total_products = 0,
    distinct_prices = 0,
    min_price = 0,
    max_price = 0,
    avg_price = 0,
    tree_height = 0,
    is_balanced = true,
  } = stats;

  const [compTab, setCompTab] = useState('add');
  const [busy, setBusy] = useState(false);

  // ── price distribution buckets ──────────────────────────────────────────
  const buckets = [
    { label: 'Under ₹2,000',       min: 0,     max: 2000,    count: 0 },
    { label: '₹2,000 – ₹5,000',   min: 2000,  max: 5000,    count: 0 },
    { label: '₹5,000 – ₹10,000',  min: 5000,  max: 10000,   count: 0 },
    { label: 'Above ₹10,000',      min: 10000, max: Infinity, count: 0 },
  ];
  products.forEach(p => {
    const b = buckets.find(b => p.price >= b.min && p.price < b.max);
    if (b) b.count++;
  });
  const maxBucket = Math.max(...buckets.map(b => b.count), 1);

  // ── category breakdown ──────────────────────────────────────────────────
  const cats = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  // ── theoretical bounds ──────────────────────────────────────────────────
  const n = distinct_prices;
  const theoreticalH = n > 0 ? Math.ceil(1.44 * Math.log2(n + 2)) : 0;
  const expectedCmp  = n > 0 ? Math.ceil(Math.log2(n + 1))        : 1;

  // ── quick test handlers ─────────────────────────────────────────────────
  const handleQuickInsert = async () => {
    if (busy || !onAddProduct) return;
    setBusy(true);
    const prices = [1299, 3499, 4999, 7499, 11999];
    const p = prices[Math.floor(Math.random() * prices.length)];
    await onAddProduct({ name: `Demo Item ₹${p}`, category: 'Electronics', price: p });
    setBusy(false);
  };

  const handleQuickRemove = async () => {
    if (busy || !onQuickDelete || products.length === 0) return;
    setBusy(true);
    const last = products[products.length - 1];
    await onQuickDelete(last.id);
    setBusy(false);
  };

  const fmtINR = (v) =>
    typeof v === 'number'
      ? `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
      : '₹0.00';

  return (
    <div className="page">
      {/* ── 4 Metric Cards ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{total_products}</div>
          <div className="stat-hint">{distinct_prices} unique price nodes</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Lowest Price</div>
          <div className="stat-value text-emerald">{fmtINR(min_price)}</div>
          <div className="stat-hint">Leftmost AVL leaf</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Highest Price</div>
          <div className="stat-value text-indigo">{fmtINR(max_price)}</div>
          <div className="stat-hint">Rightmost AVL leaf</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">AVL Tree Status</div>
          <div className={`stat-value ${is_balanced ? 'text-emerald' : 'text-amber'}`}>
            {is_balanced ? '✓ Balanced' : '⚠ Rebalancing'}
          </div>
          <div className="stat-hint">Height {tree_height} / max {theoreticalH} · BF ∈ [−1, +1]</div>
        </div>
      </div>

      {/* ── Live AVL Complexity Monitor ── */}
      <div className="card complexity-card">
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="card-title">⚡ Live AVL Complexity Monitor</div>
              <span className="live-pill">
                <span className="pulse-dot" />
                Live
              </span>
            </div>
            <div className="card-sub" style={{ marginTop: '4px' }}>
              Real-time O(log n) comparisons &amp; rotations — updated on every insert / delete
            </div>
          </div>
          {/* Quick test buttons */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleQuickInsert}
              disabled={busy}
              title="Insert a test product and watch complexity update"
            >
              + Test Insert
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleQuickRemove}
              disabled={busy || products.length === 0}
              title="Delete the last product and watch complexity update"
            >
              − Test Remove
            </button>
          </div>
        </div>

        {/* Operation feedback box */}
        <div className={`op-box ${lastOpComplexity
          ? (lastOpComplexity.operation === 'add' ? 'op-box-add' : 'op-box-del')
          : 'op-box-idle'}`}
        >
          {lastOpComplexity ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`op-badge ${lastOpComplexity.operation === 'add' ? 'op-badge-add' : 'op-badge-del'}`}>
                    {lastOpComplexity.operation === 'add' ? 'INSERTION' : 'DELETION'}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                    {lastOpComplexity.operation === 'add'
                      ? `"${lastOpComplexity.entity}" at ${fmtINR(lastOpComplexity.price)}`
                      : `Product #${lastOpComplexity.product_id} at ${fmtINR(lastOpComplexity.price)}`}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  Height: {lastOpComplexity.tree_height_before} → {lastOpComplexity.tree_height_after}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '6px 0 2px', lineHeight: '1.55' }}>
                {lastOpComplexity.explanation}
              </div>
              <div className="chips-row">
                <div className="chip-stat">
                  <span className="chip-stat-k">Time:</span>
                  <span className="chip-stat-v text-indigo">{lastOpComplexity.time_complexity}</span>
                </div>
                <div className="chip-stat">
                  <span className="chip-stat-k">Comparisons:</span>
                  <span className="chip-stat-v text-emerald">{lastOpComplexity.comparisons} levels</span>
                </div>
                <div className="chip-stat">
                  <span className="chip-stat-k">Rotations:</span>
                  <span className="chip-stat-v">
                    {lastOpComplexity.rotations_count > 0
                      ? lastOpComplexity.rotations.join(', ')
                      : '0 (balanced)'}
                  </span>
                </div>
                <div className="chip-stat">
                  <span className="chip-stat-k">Max allowed:</span>
                  <span className="chip-stat-v">
                    {lastOpComplexity.operation === 'add' ? '≤ 1 rotation' : 'O(log n) cascade'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              <strong>Monitor active</strong> — Catalog has {total_products} products across {distinct_prices} price nodes.
              Click <em>"+ Test Insert"</em> or <em>"− Test Remove"</em> to see live O(log n) metrics appear here.
            </div>
          )}
        </div>

        {/* Algorithmic comparison: Add vs Remove */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>
              Algorithmic Comparison · N = {n} unique keys
            </span>
            <div className="seg-ctrl">
              <button type="button" className={`seg-btn${compTab === 'add' ? ' active' : ''}`} onClick={() => setCompTab('add')}>
                Adding (Insertion)
              </button>
              <button type="button" className={`seg-btn${compTab === 'remove' ? ' active' : ''}`} onClick={() => setCompTab('remove')}>
                Removing (Deletion)
              </button>
            </div>
          </div>

          {compTab === 'add' ? (
            <div className="comp-grid">
              <div className="comp-box">
                <span className="comp-box-title">Time Complexity</span>
                <span className="comp-box-val text-indigo">O(log n)</span>
                <span className="comp-box-sub">~{expectedCmp} comparisons now</span>
              </div>
              <div className="comp-box">
                <span className="comp-box-title">Max Rotations</span>
                <span className="comp-box-val text-emerald">≤ 1</span>
                <span className="comp-box-sub">Single (LL/RR) or Double (LR/RL)</span>
              </div>
              <div className="comp-box">
                <span className="comp-box-title">Space (Aux)</span>
                <span className="comp-box-val text-indigo">O(1)</span>
                <span className="comp-box-sub">O(log n) call stack</span>
              </div>
              <div className="comp-box">
                <span className="comp-box-title">Height Bound</span>
                <span className="comp-box-val text-indigo">1.44 log₂(n)</span>
                <span className="comp-box-sub">Max {theoreticalH} for current n</span>
              </div>
            </div>
          ) : (
            <div className="comp-grid">
              <div className="comp-box">
                <span className="comp-box-title">Time Complexity</span>
                <span className="comp-box-val text-indigo">O(log n)</span>
                <span className="comp-box-sub">Lookup + splice + rebalance</span>
              </div>
              <div className="comp-box">
                <span className="comp-box-title">Max Rotations</span>
                <span className="comp-box-val text-amber">O(log n)</span>
                <span className="comp-box-sub">Cascade up to root</span>
              </div>
              <div className="comp-box">
                <span className="comp-box-title">Successor Find</span>
                <span className="comp-box-val text-indigo">O(log n)</span>
                <span className="comp-box-sub">Min of right subtree</span>
              </div>
              <div className="comp-box">
                <span className="comp-box-title">Space (Aux)</span>
                <span className="comp-box-val text-indigo">O(1)</span>
                <span className="comp-box-sub">O(log n) call stack</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Price Distribution + Categories ── */}
      <div className="two-col">
        {/* Price distribution */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div className="card-title">Price Distribution</div>
              <div className="card-sub">Products by INR price tier</div>
            </div>
            <span className="badge-pill">Avg: {fmtINR(avg_price)}</span>
          </div>
          <div>
            {buckets.map(b => {
              const pct = Math.max(Math.round((b.count / maxBucket) * 100), b.count > 0 ? 8 : 0);
              return (
                <div key={b.label} className="bar-row">
                  <span className="bar-label">{b.label}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="bar-count">{b.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories + Quick links */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div className="card-title">Categories</div>
              <div className="card-sub">Inventory by department</div>
            </div>
            <span className="badge-pill">{Object.keys(cats).length} depts</span>
          </div>
          <div className="cat-grid">
            {Object.entries(cats).map(([cat, cnt]) => (
              <span key={cat} className="cat-pill">
                {cat}
                <span className="cat-count">{cnt}</span>
              </span>
            ))}
            {Object.keys(cats).length === 0 && (
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>No products yet</span>
            )}
          </div>
          <hr className="divider" style={{ margin: '12px 0' }} />
          <div className="quick-links">
            <button type="button" className="link-btn" onClick={onNavigateToTree}>🌳 AVL Tree</button>
            <button type="button" className="link-btn" onClick={onNavigateToProducts}>📦 Products</button>
            <button type="button" className="link-btn" onClick={onNavigateToSearch}>🔍 Search</button>
          </div>
        </div>
      </div>
    </div>
  );
}
