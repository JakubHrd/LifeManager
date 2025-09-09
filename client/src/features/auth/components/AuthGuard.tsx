import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  const loc = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: loc }} replace />;
  return <>{children}</>;
}
