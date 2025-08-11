import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE } from '@/lib/config';
import type { RootState } from '@/store/store';

export interface AdminStatsResponse {
  status: string;
  data: {
    totalSales: number;
    ordersCount: number;
    customersCount: number;
    popularProducts: Array<{ productId: string; name: string; qty: number; averageRating?: number }>;
    recentOrders?: Array<{ _id: string; createdAt: string; totalAmount: number; status: string; user?: { email: string } }>;
    statusDistribution?: Record<string, number>;
    salesTrend?: Array<{ _id: string; total: number }>;
  };
}

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['AdminOrders', 'AdminUsers'],
  endpoints: (builder) => ({
    getAdminStats: builder.query<AdminStatsResponse, void>({
      query: () => ({ url: '/admin/stats' }),
    }),
    // Admin Orders
    getAdminOrders: builder.query<
      { status: string; data: { orders: any[]; pagination?: any } },
      { status?: string; page?: number | string; limit?: number | string; sortBy?: string; order?: 'asc' | 'desc' } | undefined
    >({
      query: (params: { status?: string; page?: number | string; limit?: number | string; sortBy?: string; order?: 'asc' | 'desc' } = {}) => ({ url: '/orders', params }),
      providesTags: ['AdminOrders'],
    }),
    updateOrderStatus: builder.mutation<
      { status: string; data: { order: any } },
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['AdminOrders'],
    }),
    // Admin Users
    getAdminUsers: builder.query<
      { status: string; data: { users: any[] } },
      { search?: string } | undefined
    >({
      query: (params: { search?: string } = {}) => ({ url: '/admin/users', params }),
      providesTags: ['AdminUsers'],
    }),
    getAdminUserDetail: builder.query<
      { status: string; data: { user: any; orders: any[] } },
      string
    >({
      query: (id) => ({ url: `/admin/users/${id}` }),
      providesTags: (_r, _e, id) => ['AdminUsers'],
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetAdminUsersQuery,
  useGetAdminUserDetailQuery,
} = adminApi;


