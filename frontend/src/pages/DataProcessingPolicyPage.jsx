const wrap = { maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px', fontFamily: 'var(--ff-body)', color: 'var(--ink)' }
const h1 = { fontFamily: 'var(--ff-display)', fontSize: '1.8rem', marginBottom: 8 }
const h2 = { fontFamily: 'var(--ff-ui)', fontSize: '.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--gold)', marginTop: 32, marginBottom: 10 }
const p = { fontSize: '1rem', lineHeight: 1.75, color: 'var(--ink-soft)', marginBottom: 14 }
const note = {
  background: 'var(--gold-pale)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
  padding: '14px 18px', fontFamily: 'var(--ff-ui)', fontSize: 13, color: 'var(--ink-soft)',
  marginBottom: 32, lineHeight: 1.6,
}

export default function DataProcessingPolicyPage() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <div style={wrap}>
        <h1 style={h1}>Política de Tratamiento de Datos Personales</h1>
        <p style={{ ...p, color: 'var(--muted)', fontSize: '.85rem' }}>Última actualización: [fecha]</p>

        <div style={note}>
          <strong>Nota para el despacho:</strong> plantilla base conforme al RGPD (Reglamento UE
          2016/679) para el consentimiento específico de tratamiento de datos personales en el
          contexto del formulario de consulta gratuita. Revísese junto con la Política de Privacidad
          antes de su publicación definitiva.
        </div>

        <h2>1. Qué datos se tratan</h2>
        <p>
          Al utilizar el formulario "Enviar solución a mi email" se recogen los siguientes datos:
          nombre, apellidos, nacionalidad, teléfono y dirección de correo electrónico.
        </p>

        <h2>2. Con qué finalidad específica</h2>
        <p>
          Estos datos se emplean exclusivamente para remitir por correo electrónico la solución o
          documento correspondiente a la consulta realizada, y para poder contactar con el
          interesado en relación con dicha consulta si fuera necesario. No se utilizan para fines
          comerciales ni se incorporan a listas de distribución salvo consentimiento adicional
          expreso.
        </p>

        <h2>3. Consentimiento informado</h2>
        <p>
          Al marcar la casilla correspondiente, el interesado consiente de forma libre, específica,
          informada e inequívoca el tratamiento de sus datos personales para la finalidad descrita
          en el punto anterior, pudiendo retirar dicho consentimiento en cualquier momento sin que
          ello afecte a la licitud del tratamiento previo a su retirada.
        </p>

        <h2>4. Transferencias internacionales</h2>
        <p>
          No se realizan transferencias internacionales de datos fuera del Espacio Económico
          Europeo, salvo que el proveedor de servicios de correo electrónico o alojamiento utilizado
          por el despacho las requiera, en cuyo caso se garantizarán las salvaguardas exigidas por el
          RGPD (cláusulas contractuales tipo, decisión de adecuación, etc.).
        </p>

        <h2>5. Ejercicio de derechos</h2>
        <p>
          El interesado puede ejercer sus derechos de acceso, rectificación, supresión, oposición,
          limitación y portabilidad en cualquier momento, así como retirar su consentimiento,
          escribiendo a <strong>abogada@bcorcino.com</strong>.
        </p>

        <h2>6. Menores de edad</h2>
        <p>
          El formulario está dirigido a personas mayores de edad. En caso de que un menor facilite
          datos personales, se recomienda que lo haga con la autorización de su representante legal.
        </p>
      </div>
    </div>
  )
}
