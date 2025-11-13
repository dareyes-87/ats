// src/components/AdminLayout.js
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';

export default function AdminLayout() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  // --- LÓGICA DE PERFIL MOVIDA AQUÍ ---
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }

    async function fetchUserProfile() {
      if (!session.user) { // Guardia extra por si la sesión se está cerrando
        navigate('/login');
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('usuarios')
        .select('rol, nombre_completo')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error cargando perfil en Layout:', error);
        alert("Error al cargar tu perfil, por favor inicia sesión de nuevo.");
        await signOut();
        navigate('/login');
      } else {
        setUserProfile(data);
      }
      setLoading(false);
    }

    fetchUserProfile();
  }, [session, navigate, signOut]);
  // --- FIN DE LÓGICA DE PERFIL ---

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Muestra "Cargando..." mientras se obtiene el rol
  if (loading) {
    return <p>Cargando perfil de usuario...</p>;
  }

  // Si algo salió muy mal y no hay perfil
  if (!userProfile) {
    return <p>Error al cargar perfil. Redirigiendo a login...</p>;
  }

  // ¡Ahora el layout SÍ SABE el rol!
  return (
    <div style={layoutStyle}>
      <nav style={sidebarStyle}>
        <h3>ATS Dashboard</h3>
        <p>Rol: {userProfile.rol.replace('_', ' ')}</p>
        <hr />
        <ul>
          <li style={navLinkStyle}>
            <Link to="/dashboard" style={linkStyle}>Mi Dashboard (Kanban)</Link>
          </li>
          
          {/* --- ¡NUEVO ENLACE CONDICIONAL! --- */}
          {userProfile.rol === 'Reclutador_RH' && (
            <li style={navLinkStyle}>
              <Link to="/dashboard/admin-puestos" style={linkStyle}>
                Administrar Puestos
              </Link>
            </li>
          )}
          {/* --- FIN DE NUEVO ENLACE --- */}

        </ul>
        <button onClick={handleSignOut} style={logoutButtonStyle}>
          Cerrar Sesión
        </button>
      </nav>
      <main style={mainContentStyle}>
        {/* Pasamos el perfil a las páginas hijas (DashboardPage, AdminPuestosPage) */}
        <Outlet context={{ userProfile }} />
      </main>
    </div>
  );
}

// Estilos (sin cambios)
const layoutStyle = {
  display: 'flex',
  minHeight: '100vh',
};

const sidebarStyle = {
  width: '250px',
  backgroundColor: '#3a3f4b',
  padding: '20px',
  color: 'white',
};

const mainContentStyle = {
  flex: 1,
  padding: '20px',
  backgroundColor: '#282c34',
  color: 'white',
};

const navLinkStyle = {
  listStyle: 'none',
  marginBottom: '10px',
};

const linkStyle = {
  color: '#61dafb',
  textDecoration: 'none',
};

const logoutButtonStyle = {
  marginTop: 'auto',
  width: '100%',
  padding: '8px 12px',
  backgroundColor: '#e63946',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};