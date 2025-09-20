import { useState, useEffect, createContext, useContext } from 'react';
import { mockUser } from '../data/mockdata';

// Create context
const AuthContext = createContext();

// Custom hook to use auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check localStorage for existing session
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Simulate login API
  const login = async (email, password, role) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const userData = { ...mockUser, email, role };
    setUser(userData);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setIsLoading(false);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
