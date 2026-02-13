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
    const { customerEmail, customerName, amount, oxxoNumber, expiresAt } = req.body;

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
      currency: 'MXN'
    }).format(amount / 100);

    const expiresFormatted = expiresAt 
      ? new Date(expiresAt * 1000).toLocaleDateString('es-MX', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'En 3 días';

    const mailOptions = {
      from: `"SportConnect" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: '🏪 Instrucciones para pagar en OXXO - SportConnect',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #00D09C, #0A7B8A); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .oxxo-box { background: #FFF3CD; border: 2px solid #FFD93D; border-radius: 12px; padding: 25px; margin: 20px 0; text-align: center; }
            .oxxo-number { font-size: 28px; font-weight: bold; color: #222; letter-spacing: 3px; font-family: monospace; background: white; padding: 15px 20px; border-radius: 8px; display: inline-block; margin: 15px 0; word-break: break-all; }
            .amount { font-size: 36px; font-weight: bold; color: #00D09C; text-align: center; margin: 20px 0; }
            .expires { color: #dc3545; font-weight: 600; font-size: 16px; margin-top: 15px; }
            .steps { background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0; }
            .step { margin-bottom: 12px; padding-left: 30px; position: relative; }
            .step:before { content: counter(step); counter-increment: step; position: absolute; left: 0; background: #00D09C; color: white; width: 22px; height: 22px; border-radius: 50%; text-align: center; font-size: 12px; line-height: 22px; }
            .steps-list { counter-reset: step; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏋️ SportConnect</h1>
            </div>
            <div class="content">
              <h2 style="text-align: center;">¡Hola ${customerName}!</h2>
              <p style="text-align: center; color: #666;">Tu solicitud de pago ha sido generada. Usa estas instrucciones para pagar en OXXO.</p>
              
              <div class="oxxo-box">
                <p style="margin: 0; font-weight: 600;">🏪 Número de referencia OXXO:</p>
                <div class="oxxo-number">${oxxoNumber}</div>
                <p class="expires">⏰ Vence: ${expiresFormatted}</p>
              </div>
              
              <div class="amount">${amountFormatted}</div>
              
              <div class="steps">
                <h3>📋 Pasos para pagar:</h3>
                <div class="steps-list">
                  <div class="step">Acude a cualquier tienda OXXO</div>
                  <div class="step">Indica que deseas hacer un pago de servicio</div>
                  <div class="step">Proporciona el número: <strong>${oxxoNumber}</strong></div>
                  <div class="step">Paga <strong>${amountFormatted}</strong></div>
                  <div class="step">Guarda tu ticket como comprobante</div>
                </div>
              </div>
              
              <p style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <strong>⚠️ Importante:</strong> Tu pago puede tardar hasta 24 horas en reflejarse. Recibirás confirmación por email.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} SportConnect. Todos los derechos reservados.</p>
            </div>
          </div>
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
