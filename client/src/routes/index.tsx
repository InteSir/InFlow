import { BrowserRouter, Route, Routes } from "react-router-dom";
// import {
//   authenticationRoutePaths,
//   protectedRoutePaths,
// } from "./common/routes";
import AppLayout from "@/layouts/app-layout";
import BaseLayout from "@/layouts/base-layout";
import AuthRoute from "./authRoute";
import ProtectedRoute from "./protectedRoute";
import useAuthExpiration from "@/hooks/use-auth-expiration";

import SignIn from "@/pages/auth/sign-in";
import SignUp from "@/pages/auth/sign-up";
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Account from "@/pages/settings/account";
import Appearance from "@/pages/settings/appearance";
import Billing from "@/pages/settings/billing";
import ForgotPassword from "@/pages/auth/forgotPassword/forgot-password";
import ResetPassword from "@/pages/auth/resetPassword/reset-password";
import VerifyMFA from "@/pages/auth/mfa/verify-mfa";
import SecuritySetting from "@/pages/settings/_components/security";
import ReportSettings from "@/pages/settings/_components/reportSettings";
import LandingPage from "@/pages/landingPage/landingPage";


function AppRoutes() {
  useAuthExpiration();
  return (
    <BrowserRouter>
      <Routes>

        {/* Auth Routes */}
        {/* <Route path="/" element={<AuthRoute />}>
          <Route element={<BaseLayout />}>
            {authenticationRoutePaths.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>
        </Route> */}

      

        <Route  element={<AuthRoute />}>   {/* if user logged in then route to another page */}
          <Route path="/" element={<LandingPage />} />
          <Route element={<BaseLayout />}>
            <Route path="/sign-in" element={<SignIn />}/>
            <Route path="/sign-up" element={<SignUp />}/>
            <Route path="/forgot-password" element={<ForgotPassword />}/>
            <Route path="/reset-password" element={<ResetPassword />}/>
            <Route path="/verify-mfa" element={<VerifyMFA />}/>
          </Route>
        </Route>


        
        {/* Protected Route */}
        <Route element={<ProtectedRoute />}>
          {/* <Route element={<AppLayout />}>
            {protectedRoutePaths.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              >
                {route.children?.map((childRoute) => (
                  <Route
                    key={childRoute.path || 'index'}
                    index={childRoute.index}
                    path={childRoute.path}
                    element={childRoute.element}
                  />
                ))}
              </Route>
            ))}
          </Route> */}
            <Route element={<AppLayout />}>
              <Route path="/overview" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/reports" element={<Reports />} />

              <Route path="/settings" element={<Settings />}>
                  <Route index element={<Account />} />
                  <Route path="/settings/appearance" element={<Appearance />} />
                  <Route path="/settings/billing" element={<Billing />} />
                  <Route path="/settings/security" element={<SecuritySetting/>} />
                  <Route path="/settings/report" element={<ReportSettings/>} />

              </Route>
            </Route>

        </Route>

        {/* Catch-all for undefined routes */}
        <Route path="*" element={<>404</>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;