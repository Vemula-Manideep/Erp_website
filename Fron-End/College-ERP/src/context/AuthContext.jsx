import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Restore user from localStorage on mount (no JWT, no /api/auth/me call)
    try {
      const role = localStorage.getItem('userRole');
      const studentData = localStorage.getItem('studentData');
      const professorData = localStorage.getItem('professorData');
      const hodData = localStorage.getItem('hodData');

      if (role === 'student' && studentData) {
        const data = JSON.parse(studentData);
        setUser({ ...data, id: data.id, role: 'STUDENT' });
      } else if (role === 'professor' && professorData) {
        const data = JSON.parse(professorData);
        setUser({ ...data, id: data.id, role: 'PROFESSOR' });
      } else if (role === 'hod' && hodData) {
        const data = JSON.parse(hodData);
        setUser({ ...data, id: data.id, role: 'HOD' });
      }
    } catch (error) {
      console.error('Error restoring user session:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (role, userData) => {
    setUser({ ...userData, role });
    localStorage.setItem('userRole', role.toLowerCase());
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('studentData');
    localStorage.removeItem('studentId');
    localStorage.removeItem('professorData');
    localStorage.removeItem('professorId');
    localStorage.removeItem('hodData');
    localStorage.removeItem('hodId');
    navigate('/');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
