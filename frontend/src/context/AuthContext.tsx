import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AuthContextValue, RegisterPayload } from "@/types/auth";
import { useLogin, useMe, useRegister } from "@/api/auth/auth-api";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string>(localStorage.getItem("access_token") || "");
  const { data: user, isLoading: loading, refetch: refetchUser } = useMe();
  const { mutateAsync: handleLoginAsync, isSuccess: loginSuccess, isPending: loginPending } = useLogin();
  const { mutateAsync: handleRegisterAsync, isSuccess: registerSuccess, isPending: registerPending } = useRegister();


  const login = async (email: string, password: string) => {
    const tokens = await handleLoginAsync({ email, password });
    if (tokens.access_token && tokens.refresh_token) {
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
      setToken(tokens.access_token);
    }
    refetchUser();
  };

  const register = async (data: RegisterPayload) => {
    const tokens = await handleRegisterAsync(data);
    if (tokens) {
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
      setToken(tokens.access_token);
    }
    refetchUser();
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setToken("");
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, loginSuccess, registerSuccess, token, loginPending, registerPending }),
    [user, loading, login, register, logout, loginSuccess, registerSuccess, token,
      loginPending, registerPending
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
