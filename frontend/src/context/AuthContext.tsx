import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../services/api";

import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
} from "../types";


interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}


const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);


export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      api.get<User>("/auth/me")
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);


  const login = async (data: LoginRequest) => {
    const response = await api.post<TokenResponse>(
      "/auth/login",
      data
    );

    localStorage.setItem(
      "token",
      response.data.access_token
    );

    const userResponse = await api.get<User>("/auth/me");

    setUser(userResponse.data);
  };


  const register = async (data: RegisterRequest) => {
    await api.post("/auth/register", data);
  };


  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}