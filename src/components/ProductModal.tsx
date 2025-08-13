import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addProduct, updateProduct } from '../store/productsSlice';
import type { Product, ProductFormData } from '../types';
import './ProductModal.css';

interface ProductModalProps {
  onClose: () => void;
  mode: 'add' | 'edit';
  product?: Product;
}

const ProductModal: React.FC<ProductModalProps> = ({ onClose, mode, product }) => {
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState<ProductFormData>({
    imageUrl: '',
    name: '',
    count: 1,
    width: 100,
    height: 100,
    weight: '',
  });

  const [errors, setErrors] = useState<Partial<ProductFormData>>({});

  useEffect(() => {
    if (mode === 'edit' && product) {
      setFormData({
        imageUrl: product.imageUrl,
        name: product.name,
        count: product.count,
        width: product.size.width,
        height: product.size.height,
        weight: product.weight,
      });
    }
  }, [mode, product]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'Image URL is required';
    }

    if (formData.count < 1) {
      newErrors.count = 'Count must be at least 1';
    }

    if (formData.width <= 0) {
      newErrors.width = 'Width must be greater than 0';
    }

    if (formData.height <= 0) {
      newErrors.height = 'Height must be greater than 0';
    }

    if (!formData.weight.trim()) {
      newErrors.weight = 'Weight is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (mode === 'add') {
      dispatch(addProduct(formData) as any);
    } else if (mode === 'edit' && product) {
      dispatch(updateProduct({ id: product.id, productData: formData }) as any);
    }
    
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{mode === 'add' ? 'Add New Product' : 'Edit Product'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Image URL *</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
              className={errors.imageUrl ? 'error' : ''}
            />
            {errors.imageUrl && <span className="error-message">{errors.imageUrl}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="count">Count *</label>
            <input
              type="number"
              id="count"
              name="count"
              value={formData.count}
              onChange={handleInputChange}
              min="1"
              className={errors.count ? 'error' : ''}
            />
            {errors.count && <span className="error-message">{errors.count}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="width">Width *</label>
              <input
                type="number"
                id="width"
                name="width"
                value={formData.width}
                onChange={handleInputChange}
                min="0.1"
                step="0.1"
                className={errors.width ? 'error' : ''}
              />
              {errors.width && <span className="error-message">{errors.width}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="height">Height *</label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                min="0.1"
                step="0.1"
                className={errors.height ? 'error' : ''}
              />
              {errors.height && <span className="error-message">{errors.height}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="weight">Weight *</label>
            <input
              type="text"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              placeholder="e.g., 200g"
              className={errors.weight ? 'error' : ''}
            />
            {errors.weight && <span className="error-message">{errors.weight}</span>}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="confirm-button">
              {mode === 'add' ? 'Add Product' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
