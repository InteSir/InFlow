import { Navigate, Outlet } from "react-router-dom";
import { AUTH_ROUTES } from "./common/routePath";
import { useTypedSelector } from "@/app/hook";

const ProtectedRoute = () => {
  const {accessToken,user}  = useTypedSelector((state)=>state.auth);
  if(!accessToken && !user) return <Navigate to={AUTH_ROUTES.SIGN_IN} replace />;
  return <Outlet/>
};

export default ProtectedRoute;