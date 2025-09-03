import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { username } = useAuthContext();
  return username ? <Outlet /> : <Navigate to="/login" replace />;
}
