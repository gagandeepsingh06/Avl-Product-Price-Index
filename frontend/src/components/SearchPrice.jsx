import React, { useState } from 'react';

export default function SearchPrice({
  onSearchExact,
  onSearchRange,
  onClearSearch,
  searchResults,
  searchTrace,
  isSearching,
  totalProductsCount,
}) {
  const [searchMode, setSearchMode] = useState('exact'); // 'exact' or 'range'
  const [exactPrice, setExactPrice] = useState('');
  const [minPrice, setMinPrice] = useState('10.00');
  const [maxPrice, setMaxPrice] = useState('80.00');
  const [hasSearched, setHasSearched] = useState(false);

  const quickPriceTests = [12.99, 19.50, 29.99, 49.99, 189.00];

  const handleExactSubmit = (e) => {
    if (e) e.preventDefault();
    if (!exactPrice) return;
    const priceVal = parseFloat(exactPrice);
    if (isNaN(priceVal)) return;

    setHasSearched(true);
    onSearchExact(priceVal);
  };

  const handleRangeSubmit = (e) => {
    if (e) e.preventDefault();
    if (!minPrice || !maxPrice) return;
    const minVal = parseFloat(minPrice);
    const maxVal = parseFloat(maxPrice);
    if (isNaN(minVal) || isNaN(maxVal) || minVal > maxVal) {
      alert('Please enter a valid range where Minimum Price <= Maximum Price.');
      return;
    }

    setHasSearched(true);
    onSearchRange(minVal, maxVal);
  };

  const handleQuickPriceClick = (price) => {
    setExactPrice(price.toString());
    setHasSearched(true);
    onSearchExact(price);
  };

  const handleResetSearch = () => {
    setExactPrice('');
    setHasSearched(false);
    onClearSearch();
  };

  return (
    <div>
      <div className="glass-card">
        <div className="card-header-row">
          <div>
            <h3 className="card-heading">
              <span>🔍</span> Search Products by Price
            </h3>
            <p className="card-subtext">
              Demonstrate O(log n) binary tree lookups and subtree pruning in real time.
            </p>
          </div>

          {/* Search Mode Toggle */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`btn-modern ${searchMode === 'exact' ? 'btn-modern-primary' : 'btn-modern-secondary'}`}
              onClick={() => {
                setSearchMode('exact');
                handleResetSearch();
              }}
            >
              Exact Price Match
            </button>
            <button
              type="button"
              className={`btn-modern ${searchMode === 'range' ? 'btn-modern-primary' : 'btn-modern-secondary'}`}
              onClick={() => {
                setSearchMode('range');
                handleResetSearch();
              }}
            >
              Price Range Filter
            </button>
          </div>
        </div>

        {/* Exact Price Search */}
        {searchMode === 'exact' && (
          <div>
            <form onSubmit={handleExactSubmit}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-group-custom" style={{ flex: '1', minWidth: '220px' }}>
                  <label className="form-label-custom">Target Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input-custom"
                    placeholder="e.g. 49.99 or 12.99"
                    value={exactPrice}
                    onChange={(e) => setExactPrice(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" className="btn-modern btn-modern-primary" disabled={isSearching}>
                    {isSearching ? 'Searching...' : 'Search Price'}
                  </button>
                  {hasSearched && (
                    <button type="button" className="btn-modern btn-modern-secondary" onClick={handleResetSearch}>
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Quick test pills */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick Viva Price Tests:</span>
                {quickPriceTests.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="preset-chip"
                    onClick={() => handleQuickPriceClick(p)}
                  >
                    ${p.toFixed(2)}
                  </button>
                ))}
              </div>
            </form>
          </div>
        )}

        {/* Range Search */}
        {searchMode === 'range' && (
          <form onSubmit={handleRangeSubmit}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group-custom" style={{ flex: '1', minWidth: '160px' }}>
                <label className="form-label-custom">Minimum Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input-custom"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-custom" style={{ flex: '1', minWidth: '160px' }}>
                <label className="form-label-custom">Maximum Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input-custom"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn-modern btn-modern-primary" disabled={isSearching}>
                  {isSearching ? 'Filtering...' : 'Filter Range'}
                </button>
                {hasSearched && (
                  <button type="button" className="btn-modern btn-modern-secondary" onClick={handleResetSearch}>
                    Clear
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Step-by-Step AVL Search Path Trace (Awesome for Viva!) */}
        {hasSearched && searchTrace && searchTrace.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🎯</span> AVL Binary Search Path Traversed:
              </h4>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px' }}>
                Visited {searchTrace.length} node{searchTrace.length > 1 ? 's' : ''} instead of {totalProductsCount || 10} linear checks
              </span>
            </div>

            <div className="search-trace-stepper">
              {searchTrace.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div
                    className="trace-step-card"
                    style={{
                      borderColor: step.action === 'match' ? '#10b981' : 'var(--border-color)',
                      backgroundColor: step.action === 'match' ? 'var(--success-bg)' : 'var(--bg-card)',
                    }}
                  >
                    <span className="trace-step-num">Step {idx + 1}</span>
                    <span className="trace-step-price">
                      {step.price !== null ? `$${step.price.toFixed(2)}` : 'N/A'}
                    </span>
                    <span
                      className="trace-step-action"
                      style={{ color: step.action === 'match' ? '#059669' : 'var(--primary)' }}
                    >
                      {step.message}
                    </span>
                  </div>
                  {idx < searchTrace.length - 1 && (
                    <span className="trace-arrow-separator">&rarr;</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="glass-card">
          <h3 className="card-heading" style={{ fontSize: '1.15rem', marginBottom: '16px' }}>
            <span>📋</span> Search Results ({searchResults ? searchResults.length : 0} matching items)
          </h3>

          {!searchResults || searchResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <p>No products found matching your price criteria in the AVL Tree index.</p>
            </div>
          ) : (
            <div className="table-wrapper-modern">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                        #{p.id}
                      </td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>
                        <span className="badge-category">{p.category}</span>
                      </td>
                      <td>
                        <span className="price-pill-bold">${p.price.toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
