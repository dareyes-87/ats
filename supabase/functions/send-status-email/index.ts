// supabase/functions/send-status-email/index.ts
// --- VERSIÓN CORREGIDA CON MANEJO DE CORS ---

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend'

// --- 1. AÑADIMOS LOS HEADERS DE CORS ---
// Esto le dice al navegador "está bien enviar solicitudes desde cualquier URL"
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Trae la API key que guardaste en los Secretos
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
if (!RESEND_API_KEY) {
  console.error("Error: RESEND_API_KEY no está configurada.")
}
const resend = new Resend(RESEND_API_KEY)

// (La función getEmailContent no cambia)
function getEmailContent(status: string, candidateName: string) {
  const name = candidateName.split(' ')[0]
  switch (status) {
    case 'Revision_Gerente':
      return { subject: '¡Hemos avanzado en tu postulación!', body: `¡Hola ${name}! Buenas noticias. El equipo de RH ha revisado tu perfil y lo ha pasado a la siguiente fase. El Gerente de Área lo revisará pronto. ¡Mucho éxito!` }
    case 'Entrevista_Agendada':
      return { subject: '¡Queremos conocerte! (Entrevista)', body: `¡Hola ${name}! Al Gerente de Área le ha gustado tu perfil y queremos agendar una entrevista contigo. RH se pondrá en contacto pronto para coordinar una fecha.` }
    case 'Rechazado':
      return { subject: 'Actualización sobre tu postulación', body: `Hola ${name}, te agradecemos por tu interés. En esta ocasión, hemos decidido continuar el proceso con otros candidatos. Te deseamos mucho éxito en tu búsqueda.` }
    default:
      return { subject: 'Tu postulación se ha actualizado', body: `Hola ${name}, tu postulación ha cambiado al estado: ${status}.` }
  }
}

serve(async (req: Request) => {
  // --- 2. AÑADIMOS EL MANEJO DE OPTIONS ---
  // Si es una solicitud OPTIONS (de verificación), responde OK y termina.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Si llegamos aquí, es la solicitud POST real con datos.
  try {
    // 3. Ahora esto SÍ funcionará (porque ya no es OPTIONS)
    const { candidateEmail, candidateName, newStatus } = await req.json()

    // 4. Generar el correo
    const { subject, body } = getEmailContent(newStatus, candidateName)

    // 5. Enviar el correo
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // (Usa tu email verificado de Resend)
      to: [candidateEmail],
      subject: subject,
      html: `<p>${body}</p><p>Saludos,<br>El equipo de Contratación</p>`,
    })

    if (error) throw error

    // 6. Responder a React con éxito
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: unknown) {
    let errorMessage = "Un error desconocido ocurrió."
    if (error instanceof Error) errorMessage = error.message
    
    // 7. Responder a React con error
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})