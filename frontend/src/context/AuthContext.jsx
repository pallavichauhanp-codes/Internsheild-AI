import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize with a default demo user so reviewer can explore dashboards immediately,
  // but allow logging out or switching to admin role.
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('internshield_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      name: 'Alex Sharma',
      email: 'alex.student@college.edu',
      role: 'student', // 'student' or 'admin'
      college: 'National Institute of Technology',
      avatarUrl: '',
      isDemo: true
    };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('internshield_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('internshield_user');
    }
  }, [user]);

  const login = (email, password, role = 'student') => {
    const newUser = {
      name: role === 'admin' ? 'Security Admin' : (email.split('@')[0] || 'College Student'),
      email: email || 'student@demo.college.edu',
      role: role,
      college: role === 'admin' ? 'InternShield Security Team' : 'Demo Institute of Technology',
      isDemo: true
    };
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole) => {
    if (!user) return;
    setUser(prev => ({
      ...prev,
      role: newRole,
      name: newRole === 'admin' ? 'Security Admin' : 'Alex Sharma'
    }));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, switchRole }}>
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
