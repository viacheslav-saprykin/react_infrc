import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../store';
import { fetchProducts, deleteProduct, setSortBy } from '../store/productsSlice';
import type { Product, SortOption } from '../types';
import ProductModal from './ProductModal';
import SafeImage from './SafeImage';
import ConfirmModal from './ConfirmModal';
import './ProductList.css';

const ProductList: React.FC = () => {
  const dispatch = useDispatch();
  const { items: products, loading, error, sortBy } = useSelector(
    (state: RootState) => state.products
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  useEffect(() => {
    dispatch(fetchProducts() as any);
  }, [dispatch]);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      dispatch(deleteProduct(productToDelete.id) as any);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const handleEditClick = (product: Product) => {
    setProductToEdit(product);
    setIsEditModalOpen(true);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setSortBy(e.target.value as SortOption));
  };

  const sortedProducts = React.useMemo(() => {
    const sorted = [...products].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'nameDesc':
          return b.name.localeCompare(a.name);
        case 'count':
          return a.count - b.count;
        case 'countDesc':
          return b.count - a.count;
        default:
          return 0;
      }
    });
    return sorted;
  }, [products, sortBy]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="product-list">
      <div className="product-list-header">
        <h1>Products</h1>
        <div className="controls">
          <select value={sortBy} onChange={handleSortChange} className="sort-select">
            <option value="name">Alphabetical (A-Z)</option>
            <option value="nameDesc">Alphabetical (Z-A)</option>
            <option value="count">Count (Low to High)</option>
            <option value="countDesc">Count (High to Low)</option>
          </select>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="add-button"
          >
            Add Product
          </button>
        </div>
      </div>

      <div className="products-grid">
        {sortedProducts.map((product) => (
          <div key={product.id} className="product-card">
            <Link to={`/product/${product.id}`} className="product-card-link">
              <SafeImage src={product.imageUrl} alt={product.name} />
              <div className="product-info">
                <h3>{product.name}</h3>
                <p>Count: {product.count}</p>
                <p>Size: {product.size.width}x{product.size.height}</p>
                <p>Weight: {product.weight}</p>
              </div>
            </Link>
            <div className="product-actions">
              <button
                onClick={() => handleEditClick(product)}
                className="edit-button"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(product)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAddModalOpen && (
        <ProductModal
          onClose={() => setIsAddModalOpen(false)}
          mode="add"
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmModal
          message={`Are you sure you want to delete "${productToDelete?.name}"?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}

      {isEditModalOpen && (
        <ProductModal
          onClose={() => setIsEditModalOpen(false)}
          mode="edit"
          product={productToEdit}
        />
      )}
    </div>
  );
};

export default ProductList;
