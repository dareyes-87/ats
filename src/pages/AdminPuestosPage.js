// src/pages/AdminPuestosPage.js
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

// Estilos (los pondremos aquí mismo para simplificar)
const formStyle = {
  padding: '20px',
  backgroundColor: '#3a3f4b',
  borderRadius: '8px',
  marginBottom: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};
const inputStyle = {
  padding: '8px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: '#4a4f5b',
  color: 'white',
};
const buttonStyle = {
  padding: '10px 15px',
  backgroundColor: '#61dafb',
  color: '#282c34',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
};
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '20px',
};
const thTdStyle = {
  border: '1px solid #4a4f5b',
  padding: '12px',
  textAlign: 'left',
};
const thStyle = {
  ...thTdStyle,
  backgroundColor: '#3a3f4b',
};

// --- Componente Principal ---
export default function AdminPuestosPage() {
  // 1. Estados
  const { userProfile } = useOutletContext(); // Para verificar el rol
  const [puestos, setPuestos] = useState([]);
  const [gerentes, setGerentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el formulario de "Nuevo Puesto"
  const [newPuesto, setNewPuesto] = useState({
    titulo: '',
    descripcion: '',
    gerente_id: '',
  });

  // 2. Carga de Datos (Puestos y Gerentes)
  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);
      setError(null);

      // A. Cargar la lista de Gerentes para el <select>
      // (Esto funciona gracias a la política RLS que creamos en el Paso 1)
      const { data: gerentesData, error: gerentesError } = await supabase
        .from('usuarios')
        .select('id, nombre_completo')
        .eq('rol', 'Gerente_Area');

      if (gerentesError) {
        setError(gerentesError.message);
        setLoading(false);
        return;
      }
      setGerentes(gerentesData);

      // B. Cargar la lista de Puestos existentes
      // (Hacemos un join para traernos el nombre del gerente)
      const { data: puestosData, error: puestosError } = await supabase
        .from('puestos')
        .select(`
          id,
          titulo,
          estado,
          usuarios ( nombre_completo ) 
        `);
      
      if (puestosError) {
        setError(puestosError.message);
      } else {
        setPuestos(puestosData);
      }
      
      setLoading(false);
    }

    loadAdminData();
  }, []); // Cargar solo una vez

  // 3. Manejador del Formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewPuesto((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!newPuesto.titulo || !newPuesto.descripcion || !newPuesto.gerente_id) {
      alert('Por favor, llena todos los campos.');
      return;
    }

    // Insertar el nuevo puesto
    const { data: insertedData, error } = await supabase
      .from('puestos')
      .insert({
        titulo: newPuesto.titulo,
        descripcion: newPuesto.descripcion,
        gerente_id: newPuesto.gerente_id,
        estado: 'Abierto', // Los puestos se crean como "Abierto" por defecto
      })
      .select('*, usuarios ( nombre_completo )') // Devuelve el nuevo puesto con el join
      .single();

    if (error) {
      setError(error.message);
    } else {
      // Añadir el nuevo puesto a la lista local (para UI instantánea)
      setPuestos([insertedData, ...puestos]);
      // Limpiar el formulario
      setNewPuesto({ titulo: '', descripcion: '', gerente_id: '' });
    }
  };

  // 4. Manejador de Acciones (Cerrar/Abrir puesto)
  const handleToggleEstado = async (puestoId, currentEstado) => {
    const nuevoEstado = currentEstado === 'Abierto' ? 'Cerrado' : 'Abierto';
    
    // Actualizar en Supabase
    const { data, error } = await supabase
      .from('puestos')
      .update({ estado: nuevoEstado })
      .eq('id', puestoId)
      .select('id, estado')
      .single();

    if (error) {
      alert(error.message);
    } else {
      // Actualizar la lista local (UI instantánea)
      setPuestos(
        puestos.map((p) =>
          p.id === puestoId ? { ...p, estado: data.estado } : p
        )
      );
    }
  };

  // --- Renderizado ---

  // Guardia de Seguridad (Doble chequeo por si el usuario es Gerente y escribe la URL)
  if (userProfile.rol !== 'Reclutador_RH') {
    return <p>Acceso denegado. Esta página es solo para RH.</p>;
  }

  if (loading) return <p>Cargando administración de puestos...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <h1>Administrar Puestos de Trabajo</h1>
      
      {/* --- SECCIÓN 1: Formulario de Nuevo Puesto --- */}
      <h2>Crear Nuevo Puesto</h2>
      <form onSubmit={handleFormSubmit} style={formStyle}>
        <label>Título del Puesto</label>
        <input
          type="text"
          name="titulo"
          value={newPuesto.titulo}
          onChange={handleFormChange}
          style={inputStyle}
          placeholder="Ej: Desarrollador React"
        />
        
        <label>Descripción</label>
        <textarea
          name="descripcion"
          value={newPuesto.descripcion}
          onChange={handleFormChange}
          style={{ ...inputStyle, minHeight: '80px' }}
          placeholder="Ej: Requerimientos del puesto..."
        />
        
        <label>Gerente de Área Asignado</label>
        <select
          name="gerente_id"
          value={newPuesto.gerente_id}
          onChange={handleFormChange}
          style={inputStyle}
        >
          <option value="">-- Selecciona un Gerente --</option>
          {gerentes.map((gerente) => (
            <option key={gerente.id} value={gerente.id}>
              {gerente.nombre_completo}
            </option>
          ))}
        </select>
        
        <button type="submit" style={buttonStyle}>Crear Puesto</button>
      </form>

      {/* --- SECCIÓN 2: Tabla de Puestos Existentes --- */}
      <h2>Puestos Existentes</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Título</th>
            <th style={thStyle}>Gerente Asignado</th>
            <th style={thStyle}>Estado</th>
            <th style={thStyle}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {puestos.map((puesto) => (
            <tr key={puesto.id}>
              <td style={thTdStyle}>{puesto.titulo}</td>
              <td style={thTdStyle}>{puesto.usuarios?.nombre_completo || 'N/A'}</td>
              <td style={thTdStyle}>{puesto.estado}</td>
              <td style={thTdStyle}>
                <button 
                  onClick={() => handleToggleEstado(puesto.id, puesto.estado)}
                  style={{...buttonStyle, backgroundColor: puesto.estado === 'Abierto' ? '#e63946' : '#2a9d8f'}}
                >
                  {puesto.estado === 'Abierto' ? 'Cerrar' : 'Re-Abrir'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}