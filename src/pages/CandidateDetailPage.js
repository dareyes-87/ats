// src/pages/CandidateDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function CandidateDetailPage() {
  const { candidatoId } = useParams(); // Lee el ID de la URL
  const { session } = useAuth(); // Para saber QUIÉN comenta

  const [candidato, setCandidato] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [cvUrl, setCvUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const [nuevoComentario, setNuevoComentario] = useState('');

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);

      // 1. Cargar datos del candidato
      const { data: cData } = await supabase
        .from('candidatos')
        .select('*, puestos(titulo)')
        .eq('id', candidatoId)
        .single(); // .single() trae solo 1 objeto, no un array

      setCandidato(cData);

      // 2. Cargar historial de estados
      const { data: hData } = await supabase
        .from('historial_estados')
        .select('*')
        .eq('candidato_id', candidatoId)
        .order('fecha_cambio', { ascending: false });

      setHistorial(hData);

      // 3. Cargar comentarios internos (con el nombre de quién comentó)
      const { data: comData } = await supabase
        .from('comentarios_internos')
        .select('*, usuarios(nombre_completo)')
        .eq('candidato_id', candidatoId)
        .order('fecha_creacion', { ascending: false });

      setComentarios(comData);

      // 4. Generar URL de descarga del CV
      if (cData.cv_url) {
        const { data, error } = await supabase.storage
          .from('cvs')
          .createSignedUrl(cData.cv_url, 60); // URL válida por 60 segundos

        if (data) setCvUrl(data.signedUrl);
        else console.error('Error generando URL de CV:', error);
      }

      setLoading(false);
    }

    fetchAllData();
  }, [candidatoId]); // Se re-ejecuta si el ID cambia

  // --- Función para AÑADIR un comentario ---
  const handleNewComment = async (e) => {
    e.preventDefault();
    if (nuevoComentario.trim() === '') return;

    const { data, error } = await supabase
      .from('comentarios_internos')
      .insert({
        candidato_id: candidatoId,
        usuario_id: session.user.id, // El ID del admin logueado
        comentario: nuevoComentario
      })
      .select('*, usuarios(nombre_completo)') // Devuelve el comentario creado
      .single();

    if (error) {
      alert(error.message);
    } else {
      // Añadir el nuevo comentario a la lista EN VIVO
      setComentarios([data, ...comentarios]);
      setNuevoComentario(''); // Limpiar el input
    }
  };

  if (loading) return <p>Cargando detalles del candidato...</p>;
  if (!candidato) return <p>Candidato no encontrado.</p>;

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* --- Columna 1: Información --- */}
      <div style={{ flex: 1, backgroundColor: '#3a3f4b', padding: '20px', borderRadius: '8px' }}>
        <h2>{candidato.nombre_completo}</h2>
        <p><strong>Puesto:</strong> {candidato.puestos.titulo}</p>
        <p><strong>Email:</strong> {candidato.email}</p>
        <p><strong>Teléfono:</strong> {candidato.telefono}</p>
        <p><strong>Estado Actual:</strong> {candidato.estado_actual}</p>
        {cvUrl ? (
          <a href={cvUrl} target="_blank" rel="noopener noreferrer" style={applyButtonStyle}>
            Descargar CV
          </a>
        ) : (
          <p>Error al cargar CV</p>
        )}

        <hr style={{ margin: '20px 0' }} />

        <h3>Historial de Estados</h3>
        {historial.length > 0 ? (
          <ul style={{ paddingLeft: '20px' }}>
            {historial.map(h => (
              <li key={h.id}>
                Pasó de <strong>{h.estado_anterior}</strong> a <strong>{h.estado_nuevo}</strong>
                <br />
                <small>{new Date(h.fecha_cambio).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>Sin historial de cambios.</p>
        )}
      </div>

      {/* --- Columna 2: Comentarios --- */}
      <div style={{ flex: 1, backgroundColor: '#3a3f4b', padding: '20px', borderRadius: '8px' }}>
        <h2>Comentarios Internos</h2>

        {/* Formulario para nuevo comentario */}
        <form onSubmit={handleNewComment}>
          <textarea
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            placeholder="Escribe tu opinión (el candidato no verá esto)"
            style={{ width: '100%', minHeight: '80px' }}
          />
          <button type="submit" style={applyButtonStyle}>Añadir Comentario</button>
        </form>

        {/* Lista de comentarios */}
        <div style={{ marginTop: '20px' }}>
          {comentarios.length > 0 ? (
            comentarios.map(c => (
              <div key={c.id} style={{ borderBottom: '1px solid #555', padding: '10px 0' }}>
                <p><strong>{c.comentario}</strong></p>
                <small>
                  Por: {c.usuarios?.nombre_completo || 'Usuario desconocido'}
                  <br />
                  {new Date(c.fecha_creacion).toLocaleString()}
                </small>
              </div>
            ))
          ) : (
            <p>No hay comentarios para este candidato.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Estilo del botón (puedes moverlo a CSS)
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