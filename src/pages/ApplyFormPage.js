import { useParams } from 'react-router-dom';

export default function ApplyFormPage() {
  // Esto lee el ID del puesto desde la URL (ej: /apply/123)
  const { puestoId } = useParams();

  return (
    <div>
      <h1>Aplicar para el Puesto</h1>
      <p>Este es el formulario para el puesto con ID: {puestoId}</p>
      <p>Aquí irá el formulario para subir el CV.</p>
    </div>
  );
}