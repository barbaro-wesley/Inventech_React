import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

export type UserRole = 'admin' | 'cadastro' | 'tecnico' | 'visualizador' | 'usuario_comum';

interface User {
  id: number;
  email: string;
  nome: string;
  papel: UserRole;
  modulos: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<User>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await api.get('/usuarios/me');
      console.log('Dados do usuário em checkAuth:', response.data);
      setUser(response.data); // response.data já deve conter user.modulos
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, senha: string) => {
    await api.post('/usuarios/login', { email, senha });
    const me = await api.get("/usuarios/me"); // retorna usuário com modulos
    setUser(me.data);

    return me.data;
  };

  const logout = async () => {
    try {
      await api.post('/usuarios/logout');
    } catch (error) {
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};