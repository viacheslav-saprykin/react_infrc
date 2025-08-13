import type { Product, Comment, ProductFormData } from '../types';

const API_BASE_URL = 'http://localhost:3001';

// ---------- Remote (JSON Server) implementation ----------
async function tryFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

async function remoteGetProducts(): Promise<Product[]> {
  const response = await tryFetch(`${API_BASE_URL}/products`);
  const products: Product[] = await response.json();

  const productsWithComments = await Promise.all(
    products.map(async (product) => {
      const commentsResponse = await tryFetch(
        `${API_BASE_URL}/comments?productId=${product.id}`
      );
      const comments: Comment[] = await commentsResponse.json();
      return { ...product, comments } as Product;
    })
  );

  return productsWithComments;
}

async function remoteCreateProduct(productData: ProductFormData): Promise<Product> {
  const newProduct = {
    imageUrl: productData.imageUrl,
    name: productData.name,
    count: productData.count,
    size: {
      width: productData.width,
      height: productData.height,
    },
    weight: productData.weight,
    comments: [],
  };

  const response = await tryFetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProduct),
  });
  const created = await response.json();
  return { ...created, comments: [] } as Product;
}

async function remoteUpdateProduct(id: number, productData: ProductFormData): Promise<Product> {
  const response = await tryFetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      imageUrl: productData.imageUrl,
      name: productData.name,
      count: productData.count,
      size: { width: productData.width, height: productData.height },
      weight: productData.weight,
    }),
  });
  const result = await response.json();

  const commentsResponse = await tryFetch(`${API_BASE_URL}/comments?productId=${id}`);
  const comments: Comment[] = await commentsResponse.json();
  return { ...result, comments } as Product;
}

async function remoteDeleteProduct(id: number): Promise<number> {
  await tryFetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });

  const commentsResponse = await tryFetch(`${API_BASE_URL}/comments?productId=${id}`);
  const comments: Comment[] = await commentsResponse.json();
  await Promise.all(
    comments.map((comment) => tryFetch(`${API_BASE_URL}/comments/${comment.id}`, { method: 'DELETE' }))
  );

  return id;
}

function formatNow(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear();
  return `${hours}:${minutes} ${day}.${month}.${year}`;
}

async function remoteCreateComment(productId: number, description: string): Promise<Comment> {
  const response = await tryFetch(`${API_BASE_URL}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, description, date: formatNow() }),
  });
  return await response.json();
}

async function remoteDeleteComment(commentId: number): Promise<number> {
  await tryFetch(`${API_BASE_URL}/comments/${commentId}`, { method: 'DELETE' });
  return commentId;
}

// ---------- LocalStorage implementation ----------
type StorageShape = { products: Omit<Product, 'comments'>[]; comments: Comment[] };

const STORAGE_KEYS = {
  products: 'shopApp_products',
  comments: 'shopApp_comments',
};

const DEFAULT_DATA: StorageShape = {
  products: [
    {
      id: 1,
      imageUrl: 'https://via.placeholder.com/200x200',
      name: 'Apple iPhone 14',
      count: 5,
      size: { width: 146.7, height: 71.5 },
      weight: '172g',
    },
    {
      id: 2,
      imageUrl: 'https://via.placeholder.com/200x200',
      name: 'Samsung Galaxy S23',
      count: 3,
      size: { width: 151.0, height: 70.6 },
      weight: '168g',
    },
  ],
  comments: [
    {
      id: 1,
      productId: 1,
      description: 'Great phone with excellent camera quality!',
      date: '14:30 15.08.2024',
    },
  ],
};

function ensureInitialized(): void {
  if (!localStorage.getItem(STORAGE_KEYS.products)) {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(DEFAULT_DATA.products));
  }
  if (!localStorage.getItem(STORAGE_KEYS.comments)) {
    localStorage.setItem(STORAGE_KEYS.comments, JSON.stringify(DEFAULT_DATA.comments));
  }
}

function readProducts(): Omit<Product, 'comments'>[] {
  ensureInitialized();
  const raw = localStorage.getItem(STORAGE_KEYS.products);
  return raw ? (JSON.parse(raw) as Omit<Product, 'comments'>[]) : [];
}

function writeProducts(products: Omit<Product, 'comments'>[]): void {
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
}

function readComments(): Comment[] {
  ensureInitialized();
  const raw = localStorage.getItem(STORAGE_KEYS.comments);
  return raw ? (JSON.parse(raw) as Comment[]) : [];
}

function writeComments(comments: Comment[]): void {
  localStorage.setItem(STORAGE_KEYS.comments, JSON.stringify(comments));
}

async function localGetProducts(): Promise<Product[]> {
  const productsCore = readProducts();
  const allComments = readComments();
  return productsCore.map((p) => ({ ...p, comments: allComments.filter((c) => c.productId === p.id) }));
}

async function localCreateProduct(productData: ProductFormData): Promise<Product> {
  const productsCore = readProducts();
  const newId = productsCore.length === 0 ? 1 : Math.max(...productsCore.map((p) => p.id)) + 1;
  const createdCore = {
    id: newId,
    imageUrl: productData.imageUrl,
    name: productData.name,
    count: productData.count,
    size: { width: productData.width, height: productData.height },
    weight: productData.weight,
  };
  writeProducts([...productsCore, createdCore]);
  return { ...createdCore, comments: [] } as Product;
}

async function localUpdateProduct(id: number, productData: ProductFormData): Promise<Product> {
  const productsCore = readProducts();
  const idx = productsCore.findIndex((p) => p.id === id);
  if (idx === -1) {
    throw new Error('Product not found');
  }
  const updatedCore = {
    ...productsCore[idx],
    imageUrl: productData.imageUrl,
    name: productData.name,
    count: productData.count,
    size: { width: productData.width, height: productData.height },
    weight: productData.weight,
  };
  const next = [...productsCore];
  next[idx] = updatedCore;
  writeProducts(next);

  const comments = readComments().filter((c) => c.productId === id);
  return { ...updatedCore, comments } as Product;
}

async function localDeleteProduct(id: number): Promise<number> {
  const productsCore = readProducts();
  writeProducts(productsCore.filter((p) => p.id !== id));
  const comments = readComments();
  writeComments(comments.filter((c) => c.productId !== id));
  return id;
}

async function localCreateComment(productId: number, description: string): Promise<Comment> {
  const comments = readComments();
  const newId = comments.length === 0 ? 1 : Math.max(...comments.map((c) => c.id)) + 1;
  const created: Comment = { id: newId, productId, description, date: formatNow() };
  writeComments([...comments, created]);
  return created;
}

async function localDeleteComment(commentId: number): Promise<number> {
  const comments = readComments();
  writeComments(comments.filter((c) => c.id !== commentId));
  return commentId;
}

// ---------- Public API with transparent fallback ----------
export async function getProducts(): Promise<Product[]> {
  try {
    return await remoteGetProducts();
  } catch {
    return await localGetProducts();
  }
}

export async function createProduct(productData: ProductFormData): Promise<Product> {
  try {
    return await remoteCreateProduct(productData);
  } catch {
    return await localCreateProduct(productData);
  }
}

export async function modifyProduct(id: number, productData: ProductFormData): Promise<Product> {
  try {
    return await remoteUpdateProduct(id, productData);
  } catch {
    return await localUpdateProduct(id, productData);
  }
}

export async function removeProduct(id: number): Promise<number> {
  try {
    return await remoteDeleteProduct(id);
  } catch {
    return await localDeleteProduct(id);
  }
}

export async function createComment(productId: number, description: string): Promise<Comment> {
  try {
    return await remoteCreateComment(productId, description);
  } catch {
    return await localCreateComment(productId, description);
  }
}

export async function removeComment(commentId: number): Promise<number> {
  try {
    return await remoteDeleteComment(commentId);
  } catch {
    return await localDeleteComment(commentId);
  }
}


