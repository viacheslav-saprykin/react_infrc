import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Product, Comment, ProductFormData, SortOption, ProductsState } from '../types';
import { getProducts, createProduct, modifyProduct, removeProduct, createComment, removeComment } from '../services/dataProvider';

// Async thunks для API calls
export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  return await getProducts();
});

export const addProduct = createAsyncThunk('products/addProduct', async (productData: ProductFormData) => {
  return await createProduct(productData);
});

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }: { id: number; productData: ProductFormData }) => {
    return await modifyProduct(id, productData);
  }
);

export const deleteProduct = createAsyncThunk('products/deleteProduct', async (id: number) => {
  return await removeProduct(id);
});

export const addComment = createAsyncThunk(
  'products/addComment',
  async ({ productId, description }: { productId: number; description: string }) => {
    return await createComment(productId, description);
  }
);

export const deleteComment = createAsyncThunk('products/deleteComment', async (commentId: number) => {
  return await removeComment(commentId);
});

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
  sortBy: 'name',
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSortBy: (state, action: PayloadAction<SortOption>) => {
      state.sortBy = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })

      // Add product
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      })

      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        const productIndex = state.items.findIndex(
          item => item.id === action.payload.productId
        );
        if (productIndex !== -1) {
          state.items[productIndex].comments.push(action.payload);
        }
      })

      // Delete comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.items.forEach(product => {
          product.comments = product.comments.filter(
            comment => comment.id !== action.payload
          );
        });
      });
  },
});

export const { setSortBy } = productsSlice.actions;
export default productsSlice.reducer;
