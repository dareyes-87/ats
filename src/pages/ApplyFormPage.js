// src/pages/ApplyFormPage.js
// --- VERSIÓN CORREGIDA (MUESTRA EL TÍTULO DEL PUESTO) ---
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function ApplyFormPage() {
  const { puestoId } = useParams(); // Obtiene el ID de la URL
  const navigate = useNavigate(); // Para redirigir al final

  // --- ¡NUEVO ESTADO PARA EL TÍTULO DEL PUESTO! ---
  const [puestoTitulo, setPuestoTitulo] = useState('');
  const [loadingTitle, setLoadingTitle] = useState(true);

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    telefono: '',
  });
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // --- ¡NUEVO USEEFFECT PARA BUSCAR EL TÍTULO! ---
  useEffect(() => {
    async function fetchPuestoTitle() {
      setLoadingTitle(true);
      const { data, error } = await supabase
        .from('puestos')
        .select('titulo')
        .eq('id', puestoId)
        .single();
      
      if (data) {
        setPuestoTitulo(data.titulo);
      } else {
        console.error('Error fetching puesto title:', error);
        setPuestoTitulo('Puesto no encontrado');
      }
      setLoadingTitle(false);
    }
    fetchPuestoTitle();
  }, [puestoId]);
  // --- FIN DEL NUEVO USEEFFECT ---

  // Manejador para los inputs de texto
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Manejador para el archivo
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCvFile(e.target.files[0]);
    }
  };

  // Manejador del envío
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre_completo || !formData.email || !cvFile) {
      setError('Nombre, email y CV son obligatorios.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Subir el CV a Supabase Storage
      const fileExt = cvFile.name.split('.').pop();
      const fileName = `${formData.email}-${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('cvs') // Nombre de tu bucket
        .upload(filePath, cvFile);

      if (uploadError) throw uploadError;

      // 2. Insertar los datos en la tabla 'candidatos'
      const { error: insertError } = await supabase
        .from('candidatos')
        .insert({
          puesto_id: puestoId,
          nombre_completo: formData.nombre_completo,
          email: formData.email,
          telefono: formData.telefono || null,
          cv_url: filePath, // Guardamos la RUTA al archivo, no la URL
          estado_actual: 'Aplicacion_Recibida', // Estado inicial
        });

      if (insertError) throw insertError;

      // 3. ¡Éxito!
      setSuccess(true);
      setLoading(false);
      // Opcional: Redirigir después de unos segundos
      setTimeout(() => navigate('/'), 3000);

    } catch (error) {
      console.error('Error en la aplicación:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // --- RENDERIZADO ---

  if (success) {
    return (
      <div style={formContainerStyle}>
        <h2>¡Aplicación Enviada!</h2>
        <p>Hemos recibido tus datos correctamente. ¡Mucha suerte!</p>
      </div>
    );
  }

  return (
    <div style={formContainerStyle}>
      
      {/* --- ¡AQUÍ ESTÁ LA CORRECCIÓN! --- */}
      <h2 style={{ marginBottom: '20px' }}>
        {loadingTitle ? 'Cargando...' : `Aplicar para: ${puestoTitulo}`}
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={inputGroupStyle}>
          <label>Nombre Completo:</label>
          <input 
            type="text" 
            name="nombre_completo" 
            value={formData.nombre_completo}
            onChange={handleChange}
            style={inputStyle}
            required 
          />
        </div>
        
        <div style={inputGroupStyle}>
          <label>Email:</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email}
            onChange={handleChange}
            style={inputStyle}
            required 
          />
        </div>
        
        <div style={inputGroupStyle}>
          <label>Teléfono (Opcional):</label>
          <input 
            type="tel" 
            name="telefono" 
            value={formData.telefono}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={inputGroupStyle}>
          <label>Adjuntar CV (PDF, .doc, .docx):</label>
          <input 
            type="file" 
            name="cv"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            style={{ ...inputStyle, colorScheme: 'dark' }}
            required 
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={applyButtonStyle}
        >
          {loading ? 'Enviando...' : 'Enviar Aplicación'}
        </button>
        
        {error && <p style={{ color: 'red', marginTop: '10px' }}>Error: {error}</p>}
      </form>
    </div>
  );
}

// Estilos (los mismos de antes, para que se vea bien)
const formContainerStyle = {
  maxWidth: '600px',
  margin: '20px auto',
  padding: '20px',
  backgroundColor: '#3a3f4b',
  borderRadius: '8px',
};

const inputGroupStyle = {
  marginBottom: '15px',
  display: 'flex',
  flexDirection: 'column',
};

const inputStyle = {
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #555',
  backgroundColor: '#4a4f5b',
  color: 'white',
  marginTop: '5px',
};

const applyButtonStyle = {
  display: 'inline-block',
  padding: '10px 15px',
  backgroundColor: '#61dafb',
  color: '#282c34',
  textDecoration: 'none',
  borderRadius: '5px',
  fontWeight: 'bold',
  border: 'none',
  cursor: 'pointer'
};