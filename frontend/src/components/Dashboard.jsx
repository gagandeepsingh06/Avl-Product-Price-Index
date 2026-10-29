import React from 'react';

export default function Dashboard({
  stats,
  products,
  onNavigateToProducts,
  onNavigateToTree,
  onNavigateToSearch,
  onTriggerRotation,
}) {
  const {
    total_products = 0,
    distinct_prices = 0,
    min_price = 0,
    max_price = 0,
    avg_price = 0,
    tree_height = 0,
    is_balanced = true,
  } = stats || {};

  // Compute category breakdown
  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  // Compute theoretical maximum height bound: 1.44 * log2(n + 2)
  const theoreticalMaxHeight = distinct_prices > 0
    ? Math.ceil(1.44 * Math.log2(distinct_prices + 2))
    : 0;

  // Price Distribution Buckets for the Histogram Chart
  const buckets = [
    { label: '< $20', min: 0, max: 20, count: 0 },
    { label: '$20 - $40', min: 20, max: 40, count: 0 },
    { label: '$40 - $80', min: 40, max: 80, count: 0 },
    { label: '$80+', min: 80, max: Infinity, count: 0 },
  ];

  products.forEach((p) => {
    const b = buckets.find((b) => p.price >= b.min && p.price < b.max);
    if (b) b.count += 1;
  });

  const maxBucketCount = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div>
      {/* 6 Core Metrics Grid */}
      <div className="stats-grid-6">
        <div className="stat-tile">
          <div className="stat-tile-top">
            <span className="stat-tile-title">Total Products</span>
            <span className="stat-tile-icon">📦</span>
          </div>
          <div className="stat-tile-number">{total_products}</div>
          <div className="stat-tile-desc">Catalog items in memory</div>
        </div>

        <div className="stat-tile">
          <div className="stat-tile-top">
            <span className="stat-tile-title">Distinct Prices</span>
            <span className="stat-tile-icon">🏷️</span>
          </div>
          <div className="stat-tile-number">{distinct_prices}</div>
          <div className="stat-tile-desc">Unique keys in AVL Tree</div>
        </div>

        <div className="stat-tile">
          <div className="stat-tile-top">
            <span className="stat-tile-title">Lowest Price</span>
            <span className="stat-tile-icon">⬇️</span>
          </div>
          <div className="stat-tile-number" style={{ color: '#10b981' }}>
            ${min_price.toFixed(2)}
          </div>
          <div className="stat-tile-desc">Leftmost tree leaf</div>
        </div>

        <div className="stat-tile">
          <div className="stat-tile-top">
            <span className="stat-tile-title">Highest Price</span>
            <span className="stat-tile-icon">⬆️</span>
          </div>
          <div className="stat-tile-number" style={{ color: '#06b6d4' }}>
            ${max_price.toFixed(2)}
          </div>
          <div className="stat-tile-desc">Rightmost tree leaf</div>
        </div>

        <div className="stat-tile">
          <div className="stat-tile-top">
            <span className="stat-tile-title">Average Price</span>
            <span className="stat-tile-icon">📊</span>
          </div>
          <div className="stat-tile-number">
            ${avg_price.toFixed(2)}
          </div>
          <div className="stat-tile-desc">Across all catalog items</div>
        </div>

        <div className="stat-tile">
          <div className="stat-tile-top">
            <span className="stat-tile-title">Tree Height</span>
            <span className="stat-tile-icon">🌲</span>
          </div>
          <div className="stat-tile-number">
            {tree_height}
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '4px' }}>
              / max {theoreticalMaxHeight}
            </span>
          </div>
          <div className="stat-tile-desc">
            <span className={`node-pill-bf ${is_balanced ? 'bf-zero' : 'bf-invalid'}`}>
              {is_balanced ? '✓ Strict AVL Balance' : '⚠ Unbalanced'}
            </span>
          </div>
        </div>
      </div>

      {/* Rotation Simulator Quick Bar */}
      <div className="simulator-box">
        <div className="simulator-header">
          <div className="simulator-title">
            <span>⚡</span>
            <span>Interactive Viva Demo: Simulate AVL Rotations</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            One-click demonstration sequences for college viva examiners
          </span>
        </div>

        <div className="simulator-actions">
          <button
            type="button"
            className="sim-btn"
            onClick={() => onTriggerRotation('LL')}
            title="Inserts [30.00, 20.00, 10.00] to trigger Right Rotation"
          >
            ▶ Simulate LL (Right Rotate)
          </button>
          <button
            type="button"
            className="sim-btn"
            onClick={() => onTriggerRotation('RR')}
            title="Inserts [10.00, 20.00, 30.00] to trigger Left Rotation"
          >
            ▶ Simulate RR (Left Rotate)
          </button>
          <button
            type="button"
            className="sim-btn"
            onClick={() => onTriggerRotation('LR')}
            title="Inserts [30.00, 10.00, 20.00] to trigger Double LR Rotation"
          >
            ▶ Simulate LR (Double Rotate)
          </button>
          <button
            type="button"
            className="sim-btn"
            onClick={() => onTriggerRotation('RL')}
            title="Inserts [10.00, 30.00, 20.00] to trigger Double RL Rotation"
          >
            ▶ Simulate RL (Double Rotate)
          </button>
        </div>
      </div>

      {/* Middle Grid: Price Distribution & Algorithmic Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Visual Histogram Chart */}
        <div className="glass-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 className="card-heading" style={{ fontSize: '1.05rem' }}>
              <span>📈</span> Price Bracket Distribution
            </h4>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {total_products} items total
            </span>
          </div>
          <p className="card-subtext" style={{ marginBottom: '10px' }}>
            Frequency of products grouped by price tier:
          </p>

          <div className="price-distribution-chart">
            {buckets.map((b) => {
              const heightPercent = Math.max(Math.round((b.count / maxBucketCount) * 100), 8);
              return (
                <div key={b.label} className="hist-bar-col">
                  <span className="hist-val">{b.count}</span>
                  <div
                    className="hist-bar"
                    style={{ height: `${heightPercent}%` }}
                    title={`${b.count} products in ${b.label}`}
                  />
                  <span className="hist-label">{b.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Theoretical Benchmark Comparison */}
        <div className="glass-card" style={{ marginBottom: 0 }}>
          <h4 className="card-heading" style={{ fontSize: '1.05rem', marginBottom: '6px' }}>
            <span>⚡</span> AVL Tree vs Unsorted Array (Benchmark)
          </h4>
          <p className="card-subtext" style={{ marginBottom: '14px' }}>
            Complexity performance for current catalog of {total_products} items:
          </p>

          <div className="table-wrapper-modern">
            <table className="modern-table" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th>Operation</th>
                  <th>AVL Tree (O-notation)</th>
                  <th>Array / List</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Exact Price Search</td>
                  <td><span className="price-pill-bold" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>O(log n) &approx; {tree_height} ops</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>O(N) &approx; {total_products} ops</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Insert Product</td>
                  <td><span className="price-pill-bold" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>O(log n)</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>O(1)</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Delete Product</td>
                  <td><span className="price-pill-bold" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>O(log n)</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>O(N)</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Sorted Traversal</td>
                  <td><span className="price-pill-bold" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>O(N) In-Order</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>O(N log N) Sort</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Action Shortcuts */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <h4 className="card-heading" style={{ fontSize: '1.05rem', marginBottom: '12px' }}>
          <span>📁</span> Catalog Department Breakdown
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
          {Object.entries(categoryCounts).map(([cat, count]) => (
            <span
              key={cat}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-color)',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: 'var(--text-main)',
              }}
            >
              <span>{cat}</span>
              <span style={{ background: 'var(--primary)', color: 'white', padding: '1px 6px', borderRadius: '9999px', fontSize: '0.75rem' }}>
                {count}
              </span>
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn-modern btn-modern-primary" onClick={onNavigateToTree}>
            🌲 Open AVL Tree Visualizer &rarr;
          </button>
          <button className="btn-modern btn-modern-secondary" onClick={onNavigateToProducts}>
            📦 Manage Catalog Products &rarr;
          </button>
          <button className="btn-modern btn-modern-secondary" onClick={onNavigateToSearch}>
            🔍 Test O(log n) Price Search &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
