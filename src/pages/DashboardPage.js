// src/pages/DashboardPage.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
  const { session } = useAuth(); // Solo necesitamos la sesión

  if (!session) {
    return <p>Cargando...</p>; // Ocurre brevemente
  }

  return (
    <div>
      <h1>Dashboard de Candidatos</h1>
      <p>¡Bienvenido, {session.user.email}!</p>
      <hr style={{ margin: '20px 0' }} />
      <p>Aquí irá el panel Kanban (Aplicado, Revisión, etc.)</p>
    </div>
  );
}