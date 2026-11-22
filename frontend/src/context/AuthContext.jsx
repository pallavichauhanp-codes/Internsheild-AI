import { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, logoutApi, getMeApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('internshield_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Check existing session on boot
  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const token = localStorage.getItem('internshield_token');
        if (token) {
          const profile = await getMeApi();
          if (isMounted) {
            setUser(profile);
            localStorage.setItem('internshield_user', JSON.stringify(profile));
          }
        }
      } catch (err) {
        // If session is expired or invalid, clear token
        if (isMounted) {
          localStorage.removeItem('internshield_token');
          localStorage.removeItem('internshield_user');
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkSession();
    return () => { isMounted = false; };
  }, []);

  // Update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('internshield_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('internshield_user');
    }
  }, [user]);

  /**
   * Real Login API call
   */
  const login = async (email, password) => {
    const res = await loginApi(email, password);
    const authenticatedUser = res.data;
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  /**
   * Real Registration API call
   */
  const register = async (userData) => {
    const res = await registerApi(userData);
    const newUser = res.data;
    setUser(newUser);
    return newUser;
  };

  /**
   * Real Logout API call
   */
  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  /**
   * 1-Click login helper for testing using real seeded MySQL fixtures
   */
  const loginAsDemo = async (role = 'student') => {
    if (role === 'admin') {
      return await login('security.admin@internshield.ai', 'Admin@123');
    } else {
      return await login('alex.student@college.edu', 'Password@123');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated: !!user, 
      login, 
      register, 
      logout, 
      loginAsDemo 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
