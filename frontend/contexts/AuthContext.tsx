import { useRouter } from "expo-router";
import { createContext, useMemo, useState, type ReactNode } from "react";

type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
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
