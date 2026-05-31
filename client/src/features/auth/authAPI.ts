import { apiClient } from "@/app/api-client";

export const authApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      })
    }),
    forgotPassword:builder.mutation({
      query:(credentials)=>({
        url:"/auth/forgot-password",
        method:"POST",
        body:credentials,
      })
    }),
    resetPassword:builder.mutation({
      query:(credentials)=>({
        url:"/auth/reset-password",
        method:"POST",
        body:credentials,
      })
    }),
    refresh: builder.mutation({
      query: () => ({
        url: '/auth/refresh',
        method: 'GET',
      })
    }),

    googleAuth:builder.mutation<{user:any;accessToken:string;expiresAt:string;reportSetting:any},{idToken:string}>({
      query:(body)=>({
        url:"/auth/google",
        method:"POST",
        body,
      }),
    })


  })
});

export const { useLoginMutation, useRefreshMutation, useRegisterMutation, useLogoutMutation, useForgotPasswordMutation ,useResetPasswordMutation,  useGoogleAuthMutation,} = authApi;