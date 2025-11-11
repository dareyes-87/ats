// src/pages/ApplyFormPage.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function ApplyFormPage() {
  // Hooks
  const { puestoId } = useParams(); // Obtiene el ID del puesto desde la URL
  const navigate = useNavigate(); // Para redirigir al usuario
  
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [cvFile, setCvFile] = useState(null);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Manejador para el archivo CV
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCvFile(e.target.files[0]);
    }
  };

  // Manejador del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cvFile) {
      setError('Debes adjuntar un archivo de CV.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Crear un path único para el archivo
      const fileExt = cvFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${puestoId}/${fileName}`; // Ej: 'id-del-puesto/1678886400000.pdf'

      // 2. Subir el CV a Supabase Storage (al bucket 'cvs')
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(filePath, cvFile);

      if (uploadError) {
        throw new Error(`Error subiendo CV: ${uploadError.message}`);
      }

      // 3. Insertar el candidato en la tabla 'candidatos'
      const { error: insertError } = await supabase
        .from('candidatos') // ¡Nombre de tabla en minúscula!
        .insert({
          nombre_completo: nombre,
          email: email,
          telefono: telefono,
          puesto_id: puestoId,
          cv_url: uploadData.path, // ¡Guardamos el 'path', no la URL pública!
          estado_actual: 'Aplicacion_Recibida', // Estado inicial del flujo
        });

      if (insertError) {
        throw new Error(`Error guardando candidato: ${insertError.message}`);
      }

      // 4. ¡Éxito!
      setLoading(false);
      setSuccess(true);
      // Opcional: redirigir después de unos segundos
      setTimeout(() => navigate('/'), 3000); // Vuelve al Home

    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Si ya se envió, mostrar mensaje de éxito
  if (success) {
    return (
      <div style={formContainerStyle}>
        <h1>¡Aplicación Enviada!</h1>
        <p>Hemos recibido tu CV. El equipo de RH se pondrá en contacto contigo. Serás redirigido al inicio...</p>
      </div>
    );
  }

  // Renderizado del formulario
  return (
    <div style={formContainerStyle}>
      <h1>Aplicar para el Puesto</h1>
      <p>Estás aplicando para el puesto ID: {puestoId}</p>

      <form onSubmit={handleSubmit}>
        <div style={inputGroupStyle}>
          <label>Nombre Completo:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div style={inputGroupStyle}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div style={inputGroupStyle}>
          <label>Teléfono (Opcional):</label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={inputGroupStyle}>
          <label>Adjuntar CV (PDF, .doc, .docx):</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            required
            style={inputStyle}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading} style={submitButtonStyle}>
          {loading ? 'Enviando Aplicación...' : 'Enviar Aplicación'}
        </button>
      </form>
    </div>
  );
}

// Estilos básicos para el formulario
const formContainerStyle = {
  maxWidth: '600px',
  margin: '20px auto',
  padding: '20px',
  backgroundColor: '#3a3f4b',
  borderRadius: '8px',
};

const inputGroupStyle = {
  marginBottom: '15px',
};

const inputStyle = {
  width: 'calc(100% - 16px)', // Ajuste para padding
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #555',
  backgroundColor: '#fff',
  color: '#333'
};

const submitButtonStyle = {
  padding: '12px 20px',
  backgroundColor: '#61dafb',
  color: '#282c34',
  border: 'none',
  borderRadius: '5px',
  fontWeight: 'bold',
  cursor: 'pointer',
};