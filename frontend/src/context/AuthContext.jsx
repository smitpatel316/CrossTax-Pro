import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // For demo, auto-login a user
  const [user] = useState({
    id: 'demo-user',
    email: 'demo@crosstax.com',
    firstName: 'Demo',
    lastName: 'User',
  });

  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = async (email, password) => {
    // Simulated login
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
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

export default AuthContext;
