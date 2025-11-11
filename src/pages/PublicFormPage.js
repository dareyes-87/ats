import { useState } from 'react';
import { supabase } from './utils/supabaseClient';

function PublicForm({ puestoId }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cvFile) {
      alert('¡Debes subir un CV!');
      return;
    }
    setLoading(true);

    try {
      // 1. Subir el CV a Storage
      // Creamos un path único (ej: puesto_id/nombre_archivo_timestamp)
      const fileExt = cvFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `public/${puestoId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('cvs') // El bucket que creamos
        .upload(filePath, cvFile);

      if (uploadError) throw uploadError;

      // 2. Obtener la URL pública (temporalmente)
      // En un caso real, usarías RLS para crear una URL firmada y segura
      const { data: urlData } = supabase.storage
        .from('cvs')
        .getPublicUrl(filePath);

      const cv_url = urlData.publicUrl;

      // 3. Insertar el candidato en la base de datos
      const { error: insertError } = await supabase
        .from('Candidatos')
        .insert({
          nombre_completo: nombre,
          email: email,
          cv_url: cv_url, // Guardamos la URL del CV
          puesto_id: puestoId,
          estado_actual: 'Aplicacion_Recibida', // Estado inicial
        });
      
      if (insertError) throw insertError;

      alert('¡Aplicación enviada con éxito!');
      // Limpiar formulario...

    } catch (error) {
      console.error('Error aplicando:', error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ... Aquí va tu JSX con el formulario ...
  // <form onSubmit={handleSubmit}>
  //   <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
  //   <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
  //   <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
  //   <button type="submit" disabled={loading}>
  //     {loading ? 'Enviando...' : 'Aplicar'}
  //   </button>
  // </form>
}