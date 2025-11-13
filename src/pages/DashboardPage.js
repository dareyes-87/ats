// src/pages/DashboardPage.js
// --- VERSIÓN REFACTORIZADA (MÁS SIMPLE) ---
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { Link, useOutletContext } from 'react-router-dom'; // <-- Importar useOutletContext

const ESTADOS_FLUJO = [
  'Aplicacion_Recibida',
  'En_Revision_RH',
  'Revision_Gerente',
  'Entrevista_Agendada',
  'Contratado',
  'Rechazado'
];

export default function DashboardPage() {
  const { session } = useAuth();
  
  // --- ¡OBTENEMOS EL PERFIL DESDE EL LAYOUT! ---
  // "userProfile" es el objeto { rol, nombre_completo }
  const { userProfile } = useOutletContext(); 

  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si el perfil aún no llega (poco probable), no hacer nada
    if (!userProfile) return;

    async function fetchCandidatos() {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('candidatos')
        .select(`
          id,
          nombre_completo,
          email,
          estado_actual,
          puestos!inner (
            titulo,
            gerente_id 
          )
        `);
      
      // La lógica de roles sigue igual
      if (userProfile.rol === 'Gerente_Area') {
        query = query
          .eq('estado_actual', 'Revision_Gerente')
          .eq('puestos.gerente_id', session.user.id);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('Error cargando candidatos:', error);
        setError(error.message);
      } else {
        setCandidatos(data);
      }
      
      setLoading(false);
    }

    fetchCandidatos();
  }, [userProfile, session]); // Se re-ejecuta si el perfil carga

  // --- Mover Candidato (Sin Cambios) ---
  const handleMoverCandidato = async (candidatoId, nuevoEstado) => {
    setCandidatos(prevCandidatos =>
      prevCandidatos.map(c =>
        c.id === candidatoId ? { ...c, estado_actual: nuevoEstado } : c
      )
    );
    const { error } = await supabase
      .from('candidatos')
      .update({ estado_actual: nuevoEstado })
      .eq('id', candidatoId);
    
    if (error) {
      console.error('Error al mover candidato:', error);
      setError('Error al actualizar, por favor recarga.');
    }
  };

  // --- Renderizado ---
  
  if (loading) {
    return <p>Cargando panel de candidatos...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h1>Dashboard de Candidatos</h1>
      <p>¡Bienvenido, {userProfile.nombre_completo || session.user.email}!</p>
      
      {/* Contenedor del Kanban (sin cambios) */}
      <div style={kanbanBoardStyle}>
        {ESTADOS_FLUJO.map((estado) => (
          (userProfile.rol === 'Reclutador_RH' || estado === 'Revision_Gerente' || estado === 'Entrevista_Agendada' || estado === 'Contratado' || estado === 'Rechazado') && (
            <div key={estado} style={kanbanColumnStyle}>
              <h3 style={columnTitleStyle}>{estado.replace('_', ' ')}</h3>
              {candidatos
                .filter(c => c.estado_actual === estado)
                .map(candidato => (
                  <div key={candidato.id} style={candidateCardStyle}>
                    <h4 style={{ marginTop: 0 }}>
                      <Link 
                        to={`/dashboard/candidato/${candidato.id}`} 
                        style={{ color: 'white', textDecoration: 'none' }}
                      >
                        {candidato.nombre_completo}
                      </Link>
                    </h4>
                    <p style={{ fontSize: '0.9em', color: '#ccc' }}>
                      {candidato.puestos?.titulo}
                    </p>
                    <select 
                      value={candidato.estado_actual}
                      onChange={(e) => handleMoverCandidato(candidato.id, e.target.value)}
                      style={{ width: '100%', marginTop: '10px' }}
                    >
                      {ESTADOS_FLUJO.map(e => (
                        <option key={e} value={e}>Mover a: {e.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                ))}
            </div>
          )
        ))}
      </div>
    </div>
  );
}

// --- Estilos para el Kanban (Sin cambios) ---
const kanbanBoardStyle = {
  display: 'flex',
  flexDirection: 'row',
  gap: '16px',
  overflowX: 'auto',
  padding: '10px 0',
};
const kanbanColumnStyle = {
  minWidth: '280px',
  width: '280px',
  backgroundColor: '#3a3f4b',
  borderRadius: '8px',
  padding: '8px',
};
const columnTitleStyle = {
  textAlign: 'center',
  padding: '10px',
  margin: 0,
  borderBottom: '1px solid #555'
};
const candidateCardStyle = {
  backgroundColor: '#4a4f5b',
  borderRadius: '5px',
  padding: '12px',
  margin: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
};