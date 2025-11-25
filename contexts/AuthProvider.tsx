import { useMemo, useState, type ReactNode } from "react";
import {
  AuthContext,
  type AuthContextValue,
  type AuthUser,
} from "./AuthContext";

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login: AuthContextValue["login"] = (userData) => {
    setUser(userData);
  };

  const logout: AuthContextValue["logout"] = () => {
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
