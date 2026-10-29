import React, { useState, useMemo } from 'react';

export default function ProductManager({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetData,
  loading,
}) {
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  const categories = ['Electronics', 'Displays', 'Accessories', 'Audio', 'Storage', 'Home Office', 'Stationery', 'Other'];
  const pricePresets = [9.99, 12.99, 19.50, 29.99, 49.99, 79.90, 110.00];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !category.trim() || price === '') return;

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      alert('Please enter a valid positive price.');
      return;
    }

    if (editingId !== null) {
      onUpdateProduct(editingId, { name, category, price: numPrice });
      handleCancelEdit();
    } else {
      onAddProduct({ name, category, price: numPrice });
      setName('');
      setCategory('');
      setPrice('');
    }
  };

  const handleStartEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category);
    setPrice(product.price.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setCategory('');
    setPrice('');
  };

  // Group products by price to identify duplicate price nodes
  const priceFrequency = useMemo(() => {
    return products.reduce((acc, p) => {
      acc[p.price] = (acc[p.price] || 0) + 1;
      return acc;
    }, {});
  }, [products]);

  // Filter products by search term and category filter
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.price.toString().includes(searchTerm);
      const matchesCat =
        selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [products, searchTerm, selectedCategoryFilter]);

  return (
    <div>
      {/* Product Entry & Edit Form */}
      <div className="glass-card">
        <div className="card-header-row">
          <div>
            <h3 className="card-heading">
              <span>{editingId !== null ? '✏️' : '➕'}</span>
              <span>{editingId !== null ? `Edit Product #${editingId}` : 'Add New Product to AVL Index'}</span>
            </h3>
            <p className="card-subtext">
              Every addition or price modification automatically indexes the price key into the AVL Tree in O(log n) time.
            </p>
          </div>
          {editingId !== null && (
            <button
              type="button"
              className="btn-modern btn-modern-secondary btn-xs"
              onClick={handleCancelEdit}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid-3">
            <div className="form-group-custom">
              <label className="form-label-custom">Product Name</label>
              <input
                type="text"
                className="form-input-custom"
                placeholder="e.g. Ergonomic Bluetooth Mouse"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group-custom">
              <label className="form-label-custom">Category</label>
              <input
                type="text"
                list="category-suggestions"
                className="form-input-custom"
                placeholder="Select or type category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
              <datalist id="category-suggestions">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div className="form-group-custom">
              <label className="form-label-custom">Price ($ USD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input-custom"
                placeholder="e.g. 29.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                className="btn-modern btn-modern-primary"
                disabled={loading}
              >
                {editingId !== null ? 'Update Item' : '+ Add Product'}
              </button>
            </div>
          </div>

          {/* Quick Price Presets (Helps quickly test duplicate prices) */}
          <div className="price-presets-row">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '4px' }}>
              Quick Presets:
            </span>
            {pricePresets.map((preset) => (
              <button
                key={preset}
                type="button"
                className="preset-chip"
                onClick={() => setPrice(preset.toString())}
              >
                ${preset.toFixed(2)}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Product List Table Card */}
      <div className="glass-card">
        <div className="table-filter-bar">
          <div>
            <h3 className="card-heading" style={{ fontSize: '1.15rem' }}>
              <span>📦</span> Products Catalog ({products.length})
            </h3>
            <p className="card-subtext">
              Natural ascending price ordering guaranteed by AVL In-Order Traversal (O(N)).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              className="table-search-input"
              placeholder="🔍 Filter list by name/price..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="button"
              className="btn-modern btn-modern-secondary"
              onClick={onResetData}
              title="Reset catalog to demo products"
            >
              🔄 Reset Demo Data
            </button>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '8px' }}>
          {['All', ...categories].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategoryFilter(cat)}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '9999px',
                border: '1px solid var(--border-color)',
                background: selectedCategoryFilter === cat ? 'var(--primary)' : 'var(--bg-card-subtle)',
                color: selectedCategoryFilter === cat ? 'white' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p>No products match your filter criteria.</p>
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
                  <th>AVL Node Group</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isDuplicate = priceFrequency[p.price] > 1;
                  return (
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
                      <td>
                        {isDuplicate ? (
                          <span className="node-badge-shared">
                            ● Shared Node ({priceFrequency[p.price]} items)
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Unique Key
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            className="btn-modern btn-modern-secondary btn-xs"
                            onClick={() => handleStartEdit(p)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-modern btn-modern-danger btn-xs"
                            onClick={() => onDeleteProduct(p.id, p.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
