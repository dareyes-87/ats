import { useEffect, useState } from 'react';
import { supabase } from './utils/supabaseClient';

function Dashboard() {
  const [candidatos, setCandidatos] = useState([]);

  useEffect(() => {
    // Función para cargar candidatos
    async function fetchCandidatos() {
      // ¡Aquí es donde la magia de RLS (Row Level Security) actuará!
      // Si eres RH, verás todos. Si eres Gerente, solo los tuyos.
      // No necesitas cambiar tu código React para esto.
      const { data, error } = await supabase
        .from('Candidatos')
        .select(`
          id,
          nombre_completo,
          email,
          estado_actual,
          Puestos ( titulo )
        `);
      
      if (error) console.error('Error cargando candidatos:', error);
      else setCandidatos(data);
    }
    fetchCandidatos();
  }, []);

  // Esta función se llamaría desde un botón o un Drag-and-Drop
  const moverCandidato = async (candidatoId, nuevoEstado) => {
    const { data, error } = await supabase
      .from('Candidatos')
      .update({ estado_actual: nuevoEstado })
      .eq('id', candidatoId);
    
    if (error) {
      alert(`Error al mover: ${error.message}`);
    } else {
      // Actualizar la lista local
      setCandidatos(prev => 
        prev.map(c => 
          c.id === candidatoId ? { ...c, estado_actual: nuevoEstado } : c
        )
      );
      // ¡Y el Trigger que creamos en SQL ya guardó esto en el Historial! 
      // No necesitas hacer nada más.
    }
  };

  // ... Tu JSX para mostrar los candidatos en columnas (Kanban) ...
}