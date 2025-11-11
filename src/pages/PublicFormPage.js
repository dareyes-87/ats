// src/pages/PublicHomePage.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Link } from 'react-router-dom'; // Para los botones de "Aplicar"

export default function PublicHomePage() {
  const [puestos, setPuestos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Función asíncrona para cargar los puestos
    async function fetchPuestos() {
      setLoading(true);
      
      // 2. Consulta a Supabase
      // Pedimos solo los puestos que cumplan la política RLS (Abiertos)
      const { data, error } = await supabase
        .from('puestos')
        .select('id, titulo, descripcion'); // Traemos solo lo que necesitamos

      if (error) {
        console.error('Error cargando los puestos:', error);
      } else {
        setPuestos(data);
      }
      
      setLoading(false);
    }

    fetchPuestos();
  }, []); // El array vacío [] significa que esto se ejecuta 1 sola vez

  // 3. Renderizado condicional
  if (loading) {
    return <p>Cargando vacantes...</p>;
  }

  if (puestos.length === 0) {
    return <p>No hay vacantes abiertas por el momento.</p>;
  }

  // 4. Mapeo y renderizado de la lista
  return (
    <div>
      <h1>Portal de Empleos</h1>
      <p>¡Encuentra tu próximo desafío! Estas son nuestras vacantes abiertas:</p>
      
      <div className="lista-puestos" style={{ marginTop: '20px' }}>
        {puestos.map((puesto) => (
          <div 
            key={puesto.id} 
            style={puestoCardStyle} // Estilo para la tarjeta
          >
            <h3 style={{ marginTop: 0 }}>{puesto.titulo}</h3>
            <p>{puesto.descripcion}</p>
            
            {/* Este Link te llevará a /apply/id-del-puesto */}
            <Link to={`/apply/${puesto.id}`} style={applyButtonStyle}>
              Aplicar ahora
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// Estilos en-línea para que se vea decente sin CSS
const puestoCardStyle = {
  border: '1px solid #555',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
  backgroundColor: '#3a3f4b'
};

const applyButtonStyle = {
  display: 'inline-block',
  padding: '10px 15px',
  backgroundColor: '#61dafb',
  color: '#282c34',
  textDecoration: 'none',
  borderRadius: '5px',
  fontWeight: 'bold'
};
