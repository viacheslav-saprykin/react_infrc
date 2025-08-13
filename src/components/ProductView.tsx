import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { addComment, deleteComment, fetchProducts, deleteProduct } from '../store/productsSlice';
import ProductModal from './ProductModal';
import ConfirmModal from './ConfirmModal';
import type { Comment } from '../types';
import './ProductView.css';
import SafeImage from './SafeImage';

const ProductView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector((state: RootState) => state.products);
  
  const product = products.find(p => p.id === parseInt(id || '0'));
  
  useEffect(() => {
    if (!product && !loading) {
      dispatch(fetchProducts() as any);
    }
  }, [dispatch, product, loading]);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteCommentModalOpen, setIsDeleteCommentModalOpen] = useState(false);
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  if (loading && !product) {
    return (
      <div className="product-view">
        <div className="not-found">
          <h2>Loading...</h2>
          <Link to="/">← Back to products</Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-view">
        <div className="not-found">
          <h2>Product not found</h2>
          <Link to="/">← Back to products</Link>
        </div>
      </div>
    );
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCommentText.trim()) {
      dispatch(addComment({
        productId: product.id,
        description: newCommentText.trim()
      }) as any);
      setNewCommentText('');
    }
  };

  const handleDeleteCommentClick = (comment: Comment) => {
    setCommentToDelete(comment);
    setIsDeleteCommentModalOpen(true);
  };

  const handleDeleteCommentConfirm = () => {
    if (commentToDelete) {
      dispatch(deleteComment(commentToDelete.id) as any);
      setIsDeleteCommentModalOpen(false);
      setCommentToDelete(null);
    }
  };

  const handleDeleteProductClick = () => {
    setIsDeleteProductModalOpen(true);
  };

  const handleDeleteProductConfirm = () => {
    dispatch(deleteProduct(product.id) as any);
    // Redirect to product list after deletion
    window.location.href = '/';
  };

  return (
    <div className="product-view">
      <div className="product-view-header">
        <Link to="/" className="back-link">← Back to products</Link>
        <div className="product-actions">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="edit-button"
          >
            Edit
          </button>
          <button
            onClick={handleDeleteProductClick}
            className="delete-button"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="product-details">
        <div className="product-image">
          <SafeImage src={product.imageUrl} alt={product.name} />
        </div>
        <div className="product-info">
          <h1>{product.name}</h1>
          <div className="detail-row">
            <span className="label">Count:</span>
            <span className="value">{product.count}</span>
          </div>
          <div className="detail-row">
            <span className="label">Size:</span>
            <span className="value">{product.size.width} x {product.size.height}</span>
          </div>
          <div className="detail-row">
            <span className="label">Weight:</span>
            <span className="value">{product.weight}</span>
          </div>
        </div>
      </div>

      <div className="comments-section">
        <h2>Comments</h2>
        
        <form onSubmit={handleAddComment} className="add-comment-form">
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Add a comment..."
            required
          />
          <button type="submit">Add Comment</button>
        </form>

        <div className="comments-list">
          {product.comments.length === 0 ? (
            <p className="no-comments">No comments yet.</p>
          ) : (
            product.comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-date">{comment.date}</span>
                  <button
                    onClick={() => handleDeleteCommentClick(comment)}
                    className="delete-comment-button"
                  >
                    Delete
                  </button>
                </div>
                <p className="comment-text">{comment.description}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <ProductModal
          onClose={() => setIsEditModalOpen(false)}
          mode="edit"
          product={product}
        />
      )}

      {isDeleteCommentModalOpen && (
        <ConfirmModal
          message="Are you sure you want to delete this comment?"
          onConfirm={handleDeleteCommentConfirm}
          onCancel={() => setIsDeleteCommentModalOpen(false)}
        />
      )}

      {isDeleteProductModalOpen && (
        <ConfirmModal
          message={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
          onConfirm={handleDeleteProductConfirm}
          onCancel={() => setIsDeleteProductModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductView;
