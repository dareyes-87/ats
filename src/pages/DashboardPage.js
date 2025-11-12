// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { Link } from 'react-router-dom'; // <-- IMPORTANTE: Importar Link

// Los estados de tu flujo de trabajo
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
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 1. Cargar Datos ---
  useEffect(() => {
    async function fetchCandidatos() {
      setLoading(true);
      setError(null);
      
      // Hacemos un "join" para traernos también el título del puesto
      const { data, error } = await supabase
        .from('candidatos')
        .select(`
          id,
          nombre_completo,
          email,
          estado_actual,
          puestos ( titulo ) 
        `);
        
      if (error) {
        console.error('Error cargando candidatos:', error);
        setError(error.message);
      } else {
        setCandidatos(data);
      }
      setLoading(false);
    }

    fetchCandidatos();
  }, []); // El array vacío [] hace que se ejecute solo al montar

  // --- 2. Mover Candidato ---
  const handleMoverCandidato = async (candidatoId, nuevoEstado) => {
    // Actualizar la UI localmente (Optimistic Update)
    // para que sea instantáneo
    setCandidatos(prevCandidatos =>
      prevCandidatos.map(c =>
        c.id === candidatoId ? { ...c, estado_actual: nuevoEstado } : c
      )
    );

    // Actualizar la base de datos en segundo plano
    const { error } = await supabase
      .from('candidatos')
      .update({ estado_actual: nuevoEstado })
      .eq('id', candidatoId);
    
    if (error) {
      console.error('Error al mover candidato:', error);
      setError('Error al actualizar, por favor recarga.');
      // Opcional: Revertir el cambio local si falla
    }
    
    // El TRIGGER que creamos en la base de datos
    // registrará este cambio en la tabla 'historial_estados'
    // ¡automáticamente!
  };

  // --- 3. Renderizado ---
  if (loading) {
    return <p>Cargando panel de candidatos...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  return (
    <div>
      <h1>Dashboard de Candidatos</h1>
      <p>¡Bienvenido, {session.user.email}!</p>
      
      {/* Contenedor del Kanban */}
      <div style={kanbanBoardStyle}>
        {ESTADOS_FLUJO.map((estado) => (
          // --- Columna del Kanban ---
          <div key={estado} style={kanbanColumnStyle}>
            <h3 style={columnTitleStyle}>{estado.replace('_', ' ')}</h3>
            
            {/* Filtrar y mapear candidatos para esta columna */}
            {candidatos
              .filter(c => c.estado_actual === estado)
              .map(candidato => (
                // --- Tarjeta del Candidato ---
                <div key={candidato.id} style={candidateCardStyle}>
                  
                  {/* --- CÓDIGO ACTUALIZADO --- */}
                  <h4 style={{ marginTop: 0 }}>
                    <Link 
                      to={`/dashboard/candidato/${candidato.id}`} 
                      style={{ color: 'white', textDecoration: 'none' }}
                    >
                      {candidato.nombre_completo}
                    </Link>
                  </h4>
                  {/* --- FIN DEL CÓDIGO ACTUALIZADO --- */}
                  
                  <p style={{ fontSize: '0.9em', color: '#ccc' }}>
                    {/* El '?' es opcional por si un candidato no tuviera puesto */}
                    {candidato.puestos?.titulo} 
                  </p>
                  
                  {/* El "Wow": Mover al candidato */}
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
        ))}
      </div>
    </div>
  );
}

// --- Estilos para el Kanban ---
const kanbanBoardStyle = {
  display: 'flex',
  flexDirection: 'row',
  gap: '16px',
  overflowX: 'auto', // Permite scroll horizontal
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