// src/components/PrivateRoute.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const { session } = useAuth();

  // Si NO hay sesión...
  if (!session) {
    // Redirige al usuario a la página de Login
    return <Navigate to="/login" replace />;
  }

  // Si HAY sesión, muestra el componente hijo (ej: DashboardPage)
  return children;
}