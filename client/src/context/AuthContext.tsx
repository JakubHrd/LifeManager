import React, { createContext, useContext, useState, useEffect } from "react";
import serverUrl from "../config";

interface AuthContextType {
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
      if (token) {
        try {
          const res = await fetch(`${serverUrl}/api/user/profile`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include", // podpora i pro cookie-based login
          });
          const data = await res.json();
          if (res.ok) setUsername(data.username || null);
        } catch (error) {
          console.error("Chyba při získávání uživatelských údajů:", error);
          setUsername(null);
        }
      } else {
        setUsername(null);
      }
    };

    if (isAuthenticated) fetchUserData();
  }, [token, isAuthenticated]);

  const login = (newToken: string) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
      setToken(newToken);
    } else {
      // cookie-based login → nemáme token, ale chceme označit jako přihlášeného
      setToken("cookie"); // fiktivní hodnota jen aby bylo truthy
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
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
