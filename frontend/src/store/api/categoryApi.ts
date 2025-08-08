import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE } from '@/lib/config';

export interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE}/api` }),
  endpoints: (builder) => ({
    getCategories: builder.query<
      { status: string; data: { categories: Category[]; pagination: Pagination } },
      { page?: number; limit?: number; active?: boolean } | void
    >({
      query: (params) => ({ url: '/categories', params: { limit: 8, ...(params as any) } }),
    }),
  }),
});

export const { useGetCategoriesQuery } = categoryApi;


