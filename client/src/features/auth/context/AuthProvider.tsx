import React, { createContext, useContext, useState, useEffect } from "react";
import { meApi } from "../api";

export interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  username: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [username, setUsername] = useState<string | null>(null);

  const isAuthenticated = !!token;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!isAuthenticated) { setUsername(null); return; }
        const profile = await meApi(); // token/cookies řeší apiFetch
        setUsername(profile.username || null);
      } catch {
        // 401 už apiFetch odhlásil z localStorage
        setUsername(null);
        setToken(null);
      }
    };
    fetchUserData();
  }, [isAuthenticated]);

  const login = (newToken: string) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
      setToken(newToken);
    } else {
      // cookie-based fallback (nepoužíváš teď, ale nechávám kompatibilitu)
      setToken("cookie");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within an AuthProvider");
  return ctx;
};
