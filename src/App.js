// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';
import PrivateRoute from './components/PrivateRoute';

import PublicHomePage from './pages/PublicHomePage';
import ApplyFormPage from './pages/ApplyFormPage';
import LoginPage from './pages/LoginPage';

import DashboardPage from './pages/DashboardPage';

import NotFoundPage from './pages/NotFoundPage';

import CandidateDetailPage from './pages/CandidateDetailPage';
import AdminPuestosPage from './pages/AdminPuestosPage';

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
        <Route path="/dashboard/admin-puestos" element={<AdminPuestosPage />} />
        {/* Aquí irían más rutas de admin, ej: /dashboard/puestos, /dashboard/usuarios */}
      </Route>
      
      {/* --- RUTA DE ERROR --- */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;