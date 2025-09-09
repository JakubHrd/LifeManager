import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "@/features/auth/context/AuthProvider";

export default function GuestRoute() {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
