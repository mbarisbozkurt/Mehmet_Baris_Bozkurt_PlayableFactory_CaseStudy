import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5000/api' }),
  endpoints: (builder) => ({
    login: builder.mutation<
      {
        status: string;
        data: {
          user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
          };
          token: string;
        };
      },
      { email: string; password: string }
    >({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
    register: builder.mutation<
      { status: string; data?: { user: { id: string; email: string; firstName: string; lastName: string; role: string }; token: string }; message?: string },
      { firstName: string; lastName: string; email: string; password: string; phoneNumber: string }
    >({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
    forgotPassword: builder.mutation<
      { status: string; message?: string },
      { email: string }
    >({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
    resetPassword: builder.mutation<
      { status: string; message?: string },
      { token: string; password: string }
    >({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
    verifyEmail: builder.mutation<
      { status: string; message?: string },
      { token: string }
    >({
      query: (body) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json' },
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useForgotPasswordMutation, useResetPasswordMutation, useVerifyEmailMutation } = authApi;