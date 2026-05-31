import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from './store';
import { setCredentials,logout } from '@/features/auth/authSlice';


const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const auth = (getState() as RootState).auth
      if (auth?.accessToken) {
        headers.set('Authorization', `Bearer ${auth.accessToken}`);
      }
      return headers;
    },
  }); 

  
// Interceptor query to automatically manage automatic silent re-authentication
const baseQueryWithResult:typeof baseQuery = async(args,api,extraOptions) => {
   let result = await baseQuery(args, api, extraOptions);
  // Check if an endpoint caught a 401 Unauthorized response status code
    if (result.error && result.error.status === 401) {
        
        // Extract the target endpoint layout safely
        const urlPath = typeof args === 'string' ? args : args.url;
        
        // Break out immediately if the refresh endpoint itself is throwing a 401
        // This is the safety switch that completely kills the infinite loops
        if (urlPath && urlPath.includes('auth/refresh')) {
            return result;
        }

        console.log("Access token expired, attempting silent token refresh...");

        // Fire a background GET request directly to your /auth/refresh endpoint
        const refreshResult = await baseQuery({ url: 'auth/refresh', method: 'GET',credentials:"include" }, api, extraOptions);
        
        if (refreshResult.data) {
            console.log("Token refresh successful! Syncing new credentials.");
            
            // Dispatch your explicit setCredentials action to update volatile RAM state
            api.dispatch(setCredentials(refreshResult.data));
            
            // Instantly re-fire the original network request that kicked off the failure
            result = await baseQuery(args, api, extraOptions);
        } else {
            console.warn("Refresh token expired or missing. Terminating user session.");
            
            // Dispatch your explicit lowercase logout action to clear state cleanly
            api.dispatch(logout());
            
            // Hard routing break to prevent background elements from spamming invalid hooks
            if (window.location.pathname !== '/signin') {
                window.location.href = '/signin';
            }
        }
    }
    return result;
}
export const apiClient = createApi({
    reducerPath: 'api', // Add API client reducer to root reducer
    baseQuery: baseQueryWithResult,
    refetchOnMountOrArgChange: true, // Refetch on mount or arg change
    tagTypes: ['transactions','analytics','billingSubscription','Session','MFA','Subscription'], // Tag types for RTK Query
    endpoints: () => ({}), // Endpoints for RTK Query
  })
  