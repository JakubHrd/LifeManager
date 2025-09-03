import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

export default function GuestRoute() {
  const { username } = useAuthContext();
  return username ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
