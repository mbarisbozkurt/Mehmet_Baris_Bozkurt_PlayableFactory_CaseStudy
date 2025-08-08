import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE } from '@/lib/config';
import type { RootState } from '@/store/store';

export interface ReviewInput {
  productId: string;
  rating: number;
  comment: string;
}

export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getReviews: builder.query<{ status: string; data: { reviews: any[] } }, string>({
      query: (productId) => ({ url: `/reviews/${productId}` }),
    }),
    addReview: builder.mutation<{ status: string; data: { review: any } }, ReviewInput>({
      query: (body) => ({ url: '/reviews', method: 'POST', body }),
    }),
  }),
});

export const { useGetReviewsQuery, useAddReviewMutation } = reviewApi;


