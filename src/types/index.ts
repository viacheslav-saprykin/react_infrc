export interface Product {
  id: number;
  imageUrl: string;
  name: string;
  count: number;
  size: {
    width: number;
    height: number;
  };
  weight: string;
  comments: Comment[];
}

export interface Comment {
  id: number;
  productId: number;
  description: string;
  date: string;
}

export interface ProductFormData {
  imageUrl: string;
  name: string;
  count: number;
  width: number;
  height: number;
  weight: string;
}

export type SortOption = 'name' | 'count' | 'nameDesc' | 'countDesc';

export interface RootState {
  products: ProductsState;
}

export interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
  sortBy: SortOption;
}
