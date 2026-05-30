import { useEffect } from "react";
import { useAppDispatch, useTypedSelector } from "@/app/hook";
import { logout, updateCredentials } from "@/features/auth/authSlice";
import { useRefreshMutation } from "@/features/auth/authAPI";

const useAuthExpiration = () => {
  const {
    accessToken,
    expiresAt,
  } = useTypedSelector((state) => state.auth);

  const dispatch = useAppDispatch();
  const [refreshToken] = useRefreshMutation()

  useEffect(() => {
    // const handleLogout = () => {
    //   console.log("Token expired, logging out...");
    //   dispatch(logout());
    // };

    const triggerRefresh = async () => {
      console.log("Access token expired/near expiry, attempting refresh...");
      try {
        // unwrap() is important here to catch errors in the catch block
        const result = await refreshToken({}).unwrap();
        dispatch(updateCredentials({ 
          accessToken: result.accessToken, 
          expiresAt: result.expiresAt 
        }));
      } catch (error) {
        console.error("Refresh failed, logging out:", error);
        dispatch(logout());
      }
    };

    // const handleTokenRefresh = async () => {
    //     try {
    //       const {accessToken, expiresAt} = await refreshToken({}).unwrap();
    //       dispatch(updateCredentials({accessToken, expiresAt}));
    //       console.log("Token refreshed successfully");
    //     } catch (error) {
    //       console.error("Token refresh failed, logging out...", error);
    //       handleLogout();
    //     }
    //   };

    if (accessToken && expiresAt) {
        const currentTime = Date.now();
        const timeUntilExpiration = expiresAt - currentTime;
      if (timeUntilExpiration <= 0) {
        // Token is already expired
        triggerRefresh()
      } else {
        // Set timer to refresh 10 seconds BEFORE it actually expires
      // This prevents API calls from failing due to timing lag
      const timer = setTimeout(triggerRefresh, timeUntilExpiration - 10000);
      return () => clearTimeout(timer);
 
      }
    }
  }, [accessToken, dispatch, expiresAt, refreshToken]);
};

export default useAuthExpiration;