const wrap = { maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px', fontFamily: 'var(--ff-body)', color: 'var(--ink)' }
const h1 = { fontFamily: 'var(--ff-display)', fontSize: '1.8rem', marginBottom: 8 }
const h2 = { fontFamily: 'var(--ff-ui)', fontSize: '.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--gold)', marginTop: 32, marginBottom: 10 }
const p = { fontSize: '1rem', lineHeight: 1.75, color: 'var(--ink-soft)', marginBottom: 14 }
const note = {
  background: 'var(--gold-pale)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
  padding: '14px 18px', fontFamily: 'var(--ff-ui)', fontSize: 13, color: 'var(--ink-soft)',
  marginBottom: 32, lineHeight: 1.6,
}

export default function PrivacyPolicyPage() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div style={wrap}>
        <h1 style={h1}>Política de Privacidad</h1>
        <p style={{ ...p, color: 'var(--muted)', fontSize: '.85rem' }}>Última actualización: [fecha]</p>

        <div style={note}>
          <strong>Nota para el despacho:</strong> esta es una plantilla base conforme a los requisitos
          generales del RGPD (Reglamento UE 2016/679) y la LOPDGDD. Debe ser revisada y completada por
          un profesional con los datos reales del despacho (responsable, DPO si aplica, finalidades
          exactas, plazos de conservación, etc.) antes de su publicación definitiva.
        </div>

        <h2>1. Responsable del tratamiento</h2>
        <p><strong>Identidad:</strong> [Nombre completo / razón social del despacho]</p>
        <p><strong>NIF/CIF:</strong> [NIF/CIF]</p>
        <p><strong>Dirección:</strong> [Dirección postal completa]</p>
        <p><strong>Email de contacto:</strong> abogada@bcorcino.com</p>
        <p><strong>Colegiación:</strong> [Número de colegiado/a e Ilustre Colegio de Abogados]</p>

        <h2>2. Finalidad del tratamiento</h2>
        <p>
          Los datos personales facilitados a través del formulario de consulta se tratan con las
          siguientes finalidades: gestionar la solicitud de información o solución enviada,
          contactar con el interesado para prestarle asesoramiento jurídico, y remitir por email la
          documentación solicitada relativa a su consulta en materia de extranjería.
        </p>

        <h2>3. Legitimación</h2>
        <p>
          La base legal para el tratamiento de los datos es el <strong>consentimiento explícito</strong>{' '}
          del interesado, otorgado al marcar las casillas correspondientes antes de enviar el
          formulario (art. 6.1.a RGPD).
        </p>

        <h2>4. Destinatarios</h2>
        <p>
          Los datos no se cederán a terceros salvo obligación legal. Podrán acceder a ellos
          proveedores de servicios que actúan como encargados del tratamiento (por ejemplo,
          proveedor de alojamiento web o servicio de envío de correo electrónico), con los que se
          suscribirán los correspondientes contratos de encargo conforme al art. 28 RGPD.
        </p>

        <h2>5. Plazo de conservación</h2>
        <p>
          Los datos se conservarán mientras exista una relación con el interesado o mientras no se
          solicite su supresión, y en todo caso durante los plazos legalmente exigibles para atender
          eventuales responsabilidades derivadas del tratamiento.
        </p>

        <h2>6. Derechos de las personas interesadas</h2>
        <p>
          Cualquier persona tiene derecho a obtener confirmación sobre si en este despacho se están
          tratando datos personales que le conciernan, y en tal caso, a ejercer sus derechos de{' '}
          <strong>acceso, rectificación, supresión, oposición, limitación del tratamiento y
          portabilidad de los datos</strong>, dirigiendo una solicitud por escrito a la dirección de
          contacto indicada en el apartado 1, adjuntando copia de documento identificativo.
        </p>
        <p>
          Asimismo, tiene derecho a presentar una reclamación ante la Agencia Española de Protección
          de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>www.aepd.es</a>) si considera que el tratamiento no se ajusta a la normativa vigente.
        </p>

        <h2>7. Medidas de seguridad</h2>
        <p>
          Se han adoptado las medidas técnicas y organizativas necesarias para garantizar la
          seguridad de los datos personales y evitar su alteración, pérdida, tratamiento o acceso no
          autorizado.
        </p>
      </div>
    </div>
  )
}
