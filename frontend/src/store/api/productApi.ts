import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE } from '@/lib/config';

export interface ProductVariant {
  sku: string;
  price: number;
  stock: number;
  size?: string;
  color?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  images: string[];
  category: { _id: string; name: string } | string;
  tags?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  variants?: ProductVariant[];
  averageRating?: number;
  totalReviews?: number;
  brand?: string;
  createdAt?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface GetProductsParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  category?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  rating?: number | string;
  tags?: string;
  brand?: string;
  featured?: boolean | string;
  active?: boolean | string;
  inStock?: boolean | string;
  popular?: boolean | string;
  sortBy?: string;
  order?: 'asc' | 'desc' | string;
}

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE}/api` }),
  endpoints: (builder) => ({
    getProducts: builder.query<
      { status: string; data: { products: Product[]; pagination: Pagination } },
      GetProductsParams | undefined
    >({
      query: (params) => ({
        url: '/products',
        params,
      }),
    }),
    getProductById: builder.query<
      { status: string; data: { product: Product } },
      string
    >({
      query: (id) => ({ url: `/products/${id}` }),
    }),
    getRelatedProducts: builder.query<
      { status: string; data: { products: Product[] } },
      { id: string; limit?: number }
    >({
      query: ({ id, limit = 8 }) => ({ url: `/products/${id}/related`, params: { limit } }),
    }),
    getPopularProducts: builder.query<
      { status: string; data: { products: Product[]; pagination: Pagination } },
      { limit?: number }
    >({
      query: ({ limit = 8 } = {}) => ({
        url: '/products',
        params: { popular: true, limit },
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetRelatedProductsQuery,
  useGetPopularProductsQuery,
} = productApi;


