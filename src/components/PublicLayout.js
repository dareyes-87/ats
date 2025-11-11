// src/components/PublicLayout.js
import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div>
      <nav style={{ padding: '20px', borderBottom: '1px solid #444' }}>
        <Link to="/" style={{ marginRight: '15px' }}>Portal de Empleo</Link>
        <Link to="/login" style={{ float: 'right' }}>Admin Login</Link>
      </nav>

      <main style={{ padding: '20px' }}>
        {/* Outlet es el "hueco" donde se dibujarán las páginas (Home, Login) */}
        <Outlet />
      </main>
    </div>
  );
}