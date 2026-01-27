'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/axios';
import LoginModal from '@/components/ui/LoginModal';

interface User {
  name: string;
  foto_perfil?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
        try {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            
            if (token && userData) {
              setUser(JSON.parse(userData));
            } else {
              // Validar si el token es válido o ha expirado si se desea
              setUser(null);
            }
        } catch (error) {
            console.error("Error parsing user data", error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };
    checkAuth();
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    closeLoginModal();
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateUser = (userData: User) => {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
  }

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, openLoginModal, closeLoginModal }}>
      {children}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
