// src/components/AdminLayout.js
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/'); // Redirigir al home público
  };

  return (
    <div>
      <nav style={{ padding: '20px', borderBottom: '1px solid #444', backgroundColor: '#333' }}>
        <Link to="/dashboard" style={{ marginRight: '15px' }}>Dashboard</Link>
        {/* Aquí pondremos "Crear Puesto", "Ver Puestos", etc. */}

        <button onClick={handleLogout} style={{ float: 'right' }}>
          Cerrar Sesión
        </button>
      </nav>

      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
}