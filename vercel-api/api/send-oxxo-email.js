const nodemailer = require('nodemailer');

// Configuración de email
const getEmailTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    console.warn('Email configuration not set (EMAIL_USER, EMAIL_PASSWORD)');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerEmail, customerName, amount, oxxoNumber, expiresAt, entrenadorNombre, fecha, hora, hostedVoucherUrl } = req.body;

    // Validar datos requeridos
    if (!customerEmail || !customerName || !amount || !oxxoNumber) {
      return res.status(400).json({
        error: 'Missing required fields: customerEmail, customerName, amount, oxxoNumber'
      });
    }

    const transporter = getEmailTransporter();
    if (!transporter) {
      return res.status(500).json({
        error: 'Email configuration not set. Configure EMAIL_USER and EMAIL_PASSWORD in Vercel.'
      });
    }

    const amountFormatted = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(amount / 100);

    // Calcular días restantes
    const ahora = new Date();
    const expira = expiresAt ? new Date(expiresAt * 1000) : new Date(ahora.getTime() + 3 * 24 * 60 * 60 * 1000);
    const diasRestantes = Math.ceil((expira - ahora) / (1000 * 60 * 60 * 24));
    
    const expiresFormatted = expira.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Generar URL del código de barras usando barcodeapi.org
    const barcodeUrl = `https://barcodeapi.org/api/128/${encodeURIComponent(oxxoNumber)}`;

    // Formatear número de referencia con espacios para legibilidad
    const formatearReferencia = (ref) => {
      if (!ref) return '';
      return ref.replace(/(.{4})/g, '$1 ').trim();
    };

    // Detalles de la reserva
    const fechaReserva = fecha 
      ? new Date(fecha).toLocaleDateString('es-MX', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }) 
      : '';

    const mailOptions = {
      from: `"Sportconnecta" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: '🏪 Tu ficha de pago OXXO - Sportconnecta',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Ficha de pago OXXO</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                  
                  <!-- Header con logo OXXO -->
                  <tr>
                    <td style="padding: 30px 40px 20px 40px; text-align: center; border-bottom: 1px solid #e6e6e6;">
                      <div style="background: #CC0000; color: white; font-weight: bold; font-size: 28px; padding: 12px 30px; display: inline-block; border-radius: 6px; letter-spacing: 2px;">
                        OXXO
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Monto -->
                  <tr>
                    <td style="padding: 30px 40px 10px 40px; text-align: center;">
                      <div style="font-size: 42px; font-weight: 600; color: #1a1a2e;">
                        MXN ${(amount / 100).toFixed(2)}
                      </div>
                      <div style="font-size: 14px; color: #666; margin-top: 8px;">
                        Vence el ${expiresFormatted}
                        <span style="background: #ffeeba; color: #856404; padding: 2px 8px; border-radius: 4px; margin-left: 8px; font-weight: 500;">
                          ${diasRestantes} días
                        </span>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Código de barras -->
                  <tr>
                    <td style="padding: 25px 40px; text-align: center;">
                      <img src="${barcodeUrl}" alt="Código de barras" style="max-width: 100%; height: 70px;" />
                      <div style="font-family: 'Courier New', monospace; font-size: 14px; color: #333; margin-top: 10px; letter-spacing: 2px;">
                        ${formatearReferencia(oxxoNumber)}
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Instrucciones -->
                  <tr>
                    <td style="padding: 20px 40px 30px 40px;">
                      <div style="font-weight: 600; color: #1a1a2e; margin-bottom: 15px; font-size: 15px;">
                        Instrucciones para pagar con OXXO:
                      </div>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 8px 0; color: #525f7f; font-size: 14px; line-height: 1.5;">
                            <span style="color: #1a1a2e; font-weight: 600;">1.</span> Entrega el vale al cajero para que escanee el código de barras.
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #525f7f; font-size: 14px; line-height: 1.5;">
                            <span style="color: #1a1a2e; font-weight: 600;">2.</span> Proporciona el pago en efectivo al cajero.
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #525f7f; font-size: 14px; line-height: 1.5;">
                            <span style="color: #1a1a2e; font-weight: 600;">3.</span> Una vez hecho el pago, guarda el recibo para tus registros.
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #525f7f; font-size: 14px; line-height: 1.5;">
                            <span style="color: #1a1a2e; font-weight: 600;">4.</span> Si tienes alguna pregunta, ponte en contacto con Sportconnecta.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  ${hostedVoucherUrl ? `
                  <!-- Botón ver voucher oficial -->
                  <tr>
                    <td style="padding: 0 40px 25px 40px; text-align: center;">
                      <a href="${hostedVoucherUrl}" target="_blank" style="display: inline-block; background: #635bff; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px;">
                        Ver ficha de pago oficial
                      </a>
                    </td>
                  </tr>
                  ` : ''}
                  
                  <!-- Detalles de la reserva -->
                  ${(entrenadorNombre || fechaReserva || hora) ? `
                  <tr>
                    <td style="padding: 20px 40px; background: #f8fafc; border-top: 1px solid #e6e6e6;">
                      <div style="font-weight: 600; color: #1a1a2e; margin-bottom: 12px; font-size: 14px;">
                        📅 Detalles de tu reserva:
                      </div>
                      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; color: #525f7f;">
                        ${entrenadorNombre ? `<tr><td style="padding: 4px 0;"><strong>Entrenador:</strong> ${entrenadorNombre}</td></tr>` : ''}
                        ${fechaReserva ? `<tr><td style="padding: 4px 0;"><strong>Fecha:</strong> ${fechaReserva}</td></tr>` : ''}
                        ${hora ? `<tr><td style="padding: 4px 0;"><strong>Horario:</strong> ${hora}</td></tr>` : ''}
                      </table>
                    </td>
                  </tr>
                  ` : ''}
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 25px 40px; text-align: center; border-top: 1px solid #e6e6e6;">
                      <div style="font-size: 12px; color: #8898aa; margin-bottom: 8px;">
                        Este correo fue enviado por Sportconnecta
                      </div>
                      <div style="font-size: 11px; color: #aab7c4;">
                        © ${new Date().getFullYear()} Sportconnecta. Todos los derechos reservados.
                      </div>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ OXXO voucher email sent to:', customerEmail);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Email enviado correctamente' 
    });

  } catch (error) {
    console.error('❌ Error sending OXXO email:', error);
    return res.status(500).json({
      error: error.message || 'Error sending email'
    });
  }
};
