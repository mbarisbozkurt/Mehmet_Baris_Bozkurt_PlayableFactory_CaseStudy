import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/store/store';
import { API_BASE } from '@/lib/config';

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  items: OrderItemInput[];
  shippingAddress: {
    street: string; city: string; state: string; zipCode: string;
  };
}

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createOrder: builder.mutation<{ status: string; data?: any }, CreateOrderInput>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
    }),
    getOrders: builder.query<{ status: string; data: { orders: any[] } }, void>({
      query: () => ({ url: '/orders' }),
    }),
  }),
});

export const { useCreateOrderMutation, useGetOrdersQuery } = orderApi;


