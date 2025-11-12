// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Layouts y Guardia
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';
import PrivateRoute from './components/PrivateRoute';

// Páginas Públicas
import PublicHomePage from './pages/PublicHomePage';
import ApplyFormPage from './pages/ApplyFormPage';
import LoginPage from './pages/LoginPage';

// Páginas de Admin
import DashboardPage from './pages/DashboardPage';

// Otros
import NotFoundPage from './pages/NotFoundPage';

import CandidateDetailPage from './pages/CandidateDetailPage';

function App() {
  return (
    <Routes>
      {/* --- RUTAS PÚBLICAS --- */}
      {/* Todas las rutas aquí dentro usan el PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<PublicHomePage />} />
        <Route path="/apply/:puestoId" element={<ApplyFormPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* --- RUTAS PRIVADAS (ADMIN) --- */}
      {/* Todo aquí dentro está protegido por PrivateRoute Y usa el AdminLayout */}
      <Route 
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/candidato/:candidatoId" element={<CandidateDetailPage />} />
        {/* Aquí irían más rutas de admin, ej: /dashboard/puestos, /dashboard/usuarios */}
      </Route>
      
      {/* --- RUTA DE ERROR --- */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;