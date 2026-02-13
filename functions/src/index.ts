import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import cors from 'cors';
import { defineString } from 'firebase-functions/params';
import * as nodemailer from 'nodemailer';

// Definir parámetros de entorno
const stripeSecretKey = defineString('STRIPE_SECRET_KEY');

// Inicializar Firebase Admin
admin.initializeApp();

// Inicializar Stripe con la clave secreta desde variables de entorno
const stripe = new Stripe(stripeSecretKey.value() || process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

// Configurar CORS
const corsHandler = cors({ origin: true });

// Firestore reference
const db = admin.firestore();

// URL base de la aplicación (para links en emails)
const APP_BASE_URL = 'http://localhost:4200'; // Cambiar a producción cuando se despliegue

/**
 * Generar token de confirmación único
 */
function generateConfirmationToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Crear token de confirmación y guardarlo en Firestore
 */
async function createConfirmationToken(
  email: string,
  paymentIntentId: string,
  reservaId?: string,
  entrenadorId?: string
): Promise<string> {
  const token = generateConfirmationToken();
  
  await db.collection('confirmation_tokens').doc(token).set({
    email: email,
    paymentIntentId: paymentIntentId,
    reservaId: reservaId || null,
    entrenadorId: entrenadorId || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
    used: false,
  });

  return token;
}

// ========== CONFIGURACIÓN DE EMAIL ==========
// Para usar Gmail, configura estas variables de entorno:
// firebase functions:config:set email.user="tu-email@gmail.com" email.password="tu-app-password"
// Nota: Usa una "App Password" de Google, no tu contraseña normal
// https://support.google.com/accounts/answer/185833

const getEmailTransporter = () => {
  const emailConfig = functions.config().email || {};
  
  if (!emailConfig.user || !emailConfig.password) {
    console.warn('Email configuration not set. Emails will not be sent.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailConfig.user,
      pass: emailConfig.password,
    },
  });
};

/**
 * Enviar email de confirmación de pago
 */
async function sendPaymentConfirmationEmail(
  customerEmail: string,
  customerName: string,
  amount: number,
  reservaId?: string,
  entrenadorNombre?: string,
  confirmationToken?: string
): Promise<boolean> {
  const transporter = getEmailTransporter();
  
  if (!transporter) {
    console.log('Email transporter not configured, skipping email');
    return false;
  }

  const amountFormatted = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount / 100);

  // Link de confirmación/registro
  const confirmLink = confirmationToken 
    ? `${APP_BASE_URL}/auth/confirm?token=${confirmationToken}`
    : `${APP_BASE_URL}/auth/login`;

  const mailOptions = {
    from: `"SportConnect" <${functions.config().email?.user}>`,
    to: customerEmail,
    subject: '✅ Pago Confirmado - SportConnect',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #00d9a5 0%, #0095ff 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 30px; }
          .success-icon { font-size: 64px; text-align: center; margin-bottom: 20px; }
          .amount { font-size: 36px; font-weight: bold; color: #00d9a5; text-align: center; margin: 20px 0; }
          .details { background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0; }
          .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
          .details-row:last-child { border-bottom: none; }
          .footer { background: #222b45; color: #8f9bb3; padding: 20px; text-align: center; font-size: 14px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #00d9a5 0%, #00c896 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: 600; margin: 20px 0; font-size: 16px; }
          .highlight-box { background: #e8f5e9; border: 2px solid #00d9a5; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚽ SportConnect</h1>
          </div>
          <div class="content">
            <div class="success-icon">✅</div>
            <h2 style="text-align: center; color: #222b45;">¡Pago Confirmado!</h2>
            <p style="text-align: center; color: #8f9bb3;">Hola ${customerName}, tu pago ha sido procesado exitosamente.</p>
            
            <div class="amount">${amountFormatted}</div>
            
            <div class="highlight-box">
              <h3 style="margin: 0 0 10px 0; color: #222b45;">🎉 ¡Ya casi es hora de entrenar!</h3>
              <p style="margin: 0 0 15px 0; color: #666;">Haz clic en el botón para acceder a tu cuenta y ver los detalles de tu reserva.</p>
              <a href="${confirmLink}" class="btn">Acceder a Mi Cuenta</a>
            </div>
            
            <div class="details">
              <div class="details-row">
                <span><strong>Cliente:</strong></span>
                <span>${customerName}</span>
              </div>
              ${entrenadorNombre ? `
              <div class="details-row">
                <span><strong>Entrenador:</strong></span>
                <span>${entrenadorNombre}</span>
              </div>
              ` : ''}
              ${reservaId ? `
              <div class="details-row">
                <span><strong>Reserva ID:</strong></span>
                <span>${reservaId}</span>
              </div>
              ` : ''}
              <div class="details-row">
                <span><strong>Estado:</strong></span>
                <span style="color: #00d9a5; font-weight: 600;">Pagado ✓</span>
              </div>
              <div class="details-row">
                <span><strong>Fecha:</strong></span>
                <span>${new Date().toLocaleDateString('es-MX', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>
            
            <p style="text-align: center; color: #8f9bb3; font-size: 14px;">
              Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
              <a href="${confirmLink}" style="color: #00d9a5;">${confirmLink}</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SportConnect. Todos los derechos reservados.</p>
            <p>Si tienes alguna pregunta, contáctanos en soporte@sportconnect.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Payment confirmation email sent to:', customerEmail);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Enviar email con instrucciones para pago en OXXO
 */
async function sendOxxoVoucherEmail(
  customerEmail: string,
  customerName: string,
  amount: number,
  oxxoNumber: string,
  expiresAt: Date,
  reservaId?: string,
  entrenadorNombre?: string,
  confirmationToken?: string
): Promise<boolean> {
  const transporter = getEmailTransporter();
  
  if (!transporter) {
    console.warn('No email transporter configured, skipping OXXO email');
    return false;
  }

  const amountFormatted = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount / 100);

  const expiresFormatted = expiresAt.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Link de confirmación/registro
  const confirmLink = confirmationToken 
    ? `${APP_BASE_URL}/auth/confirm?token=${confirmationToken}`
    : `${APP_BASE_URL}/auth/login`;

  const mailOptions = {
    from: '"SportConnect" <noreply@sportconnect.com>',
    to: customerEmail,
    subject: '🏪 Instrucciones para pagar en OXXO - SportConnect',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #00D09C, #0A7B8A); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 30px; }
          .oxxo-box { background: #FFF3CD; border: 2px solid #FFD93D; border-radius: 12px; padding: 25px; margin: 20px 0; text-align: center; }
          .oxxo-logo { font-size: 40px; margin-bottom: 10px; }
          .oxxo-number { font-size: 32px; font-weight: bold; color: #222; letter-spacing: 4px; font-family: monospace; background: white; padding: 15px 20px; border-radius: 8px; display: inline-block; margin: 15px 0; }
          .amount { font-size: 36px; font-weight: bold; color: #00D09C; text-align: center; margin: 20px 0; }
          .expires { color: #dc3545; font-weight: 600; font-size: 16px; margin-top: 15px; }
          .steps { background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0; }
          .step { display: flex; align-items: flex-start; margin-bottom: 15px; }
          .step-number { background: #00D09C; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
          .details { background: #e8f5e9; padding: 20px; border-radius: 12px; margin: 20px 0; }
          .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.1); }
          .details-row:last-child { border-bottom: none; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏋️ SportConnect</h1>
          </div>
          <div class="content">
            <h2 style="text-align: center; color: #222;">¡Hola ${customerName}!</h2>
            <p style="text-align: center; color: #666; font-size: 16px;">
              Tu solicitud de pago ha sido generada. Sigue las instrucciones para completar tu pago en OXXO.
            </p>
            
            <div class="oxxo-box">
              <div class="oxxo-logo">🏪</div>
              <p style="margin: 0; font-weight: 600; color: #222;">Número de referencia OXXO:</p>
              <div class="oxxo-number">${oxxoNumber}</div>
              <p class="expires">⏰ Vence: ${expiresFormatted}</p>
            </div>
            
            <div class="amount">${amountFormatted}</div>
            
            <div class="steps">
              <h3 style="margin-top: 0; color: #222;">📋 Pasos para pagar:</h3>
              <div class="step">
                <div class="step-number">1</div>
                <div>Acude a cualquier tienda OXXO</div>
              </div>
              <div class="step">
                <div class="step-number">2</div>
                <div>Indica que deseas hacer un pago de servicio</div>
              </div>
              <div class="step">
                <div class="step-number">3</div>
                <div>Proporciona el número de referencia: <strong>${oxxoNumber}</strong></div>
              </div>
              <div class="step">
                <div class="step-number">4</div>
                <div>Paga el monto exacto: <strong>${amountFormatted}</strong></div>
              </div>
              <div class="step">
                <div class="step-number">5</div>
                <div>Guarda tu ticket como comprobante</div>
              </div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong> Tu pago puede tardar hasta 24 horas en reflejarse. 
              Recibirás un correo de confirmación cuando se procese exitosamente.
            </div>
            
            <div class="details">
              ${entrenadorNombre ? `
              <div class="details-row">
                <span><strong>Entrenador:</strong></span>
                <span>${entrenadorNombre}</span>
              </div>
              ` : ''}
              ${reservaId ? `
              <div class="details-row">
                <span><strong>Reserva ID:</strong></span>
                <span>${reservaId}</span>
              </div>
              ` : ''}
              <div class="details-row">
                <span><strong>Estado:</strong></span>
                <span style="color: #ffc107; font-weight: 600;">Pendiente de pago</span>
              </div>
            </div>
            
            <div style="background: #e8f5e9; border: 2px solid #00D09C; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
              <h3 style="margin: 0 0 10px 0; color: #222;">📱 Una vez que pagues</h3>
              <p style="margin: 0 0 15px 0; color: #666;">Después de pagar, haz clic en este enlace para completar tu registro y acceder a tu cuenta:</p>
              <a href="${confirmLink}" style="display: inline-block; background: linear-gradient(135deg, #00D09C 0%, #00B386 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px;">Completar Registro</a>
            </div>
            
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SportConnect. Todos los derechos reservados.</p>
            <p>Si tienes alguna pregunta, contáctanos en soporte@sportconnect.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OXXO voucher email sent to:', customerEmail);
    return true;
  } catch (error) {
    console.error('Error sending OXXO email:', error);
    return false;
  }
}

/**
 * Crear PaymentIntent para OXXO
 * OXXO es un método de pago en efectivo muy popular en México
 */
export const createOxxoPaymentIntent = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // Solo permitir POST
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const { amount, currency = 'mxn', customerEmail, customerName, description, metadata = {} } = req.body;

      // Validaciones
      if (!amount || amount < 1000) { // Mínimo $10 MXN (1000 centavos)
        res.status(400).json({ error: 'El monto mínimo es $10 MXN' });
        return;
      }

      if (!customerEmail) {
        res.status(400).json({ error: 'El email del cliente es requerido' });
        return;
      }

      if (!customerName) {
        res.status(400).json({ error: 'El nombre del cliente es requerido' });
        return;
      }

      // Crear el PaymentIntent con OXXO
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // Monto en centavos
        currency: currency,
        payment_method_types: ['oxxo'],
        metadata: {
          ...metadata,
          customerEmail,
          customerName,
          createdAt: new Date().toISOString(),
        },
        description: description || `Reserva SportConnect - ${customerName}`,
      });

      // Guardar en Firestore para tracking
      await db.collection('payment_intents').doc(paymentIntent.id).set({
        paymentIntentId: paymentIntent.id,
        amount: amount,
        currency: currency,
        customerEmail: customerEmail,
        customerName: customerName,
        status: paymentIntent.status,
        paymentMethod: 'oxxo',
        metadata: metadata,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });

    } catch (error: any) {
      console.error('Error creating OXXO PaymentIntent:', error);
      res.status(500).json({ 
        error: 'Error al crear el pago',
        message: error.message 
      });
    }
  });
});

/**
 * Crear PaymentIntent para Tarjeta
 */
export const createCardPaymentIntent = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const { amount, currency = 'mxn', customerEmail, customerName, description, metadata = {} } = req.body;

      if (!amount || amount < 500) { // Mínimo $5 MXN
        res.status(400).json({ error: 'El monto mínimo es $5 MXN' });
        return;
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency: currency,
        payment_method_types: ['card'],
        metadata: {
          ...metadata,
          customerEmail,
          customerName,
          createdAt: new Date().toISOString(),
        },
        description: description || `Reserva SportConnect - ${customerName}`,
      });

      // Guardar en Firestore
      await db.collection('payment_intents').doc(paymentIntent.id).set({
        paymentIntentId: paymentIntent.id,
        amount: amount,
        currency: currency,
        customerEmail: customerEmail,
        customerName: customerName,
        status: paymentIntent.status,
        paymentMethod: 'card',
        metadata: metadata,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });

    } catch (error: any) {
      console.error('Error creating Card PaymentIntent:', error);
      res.status(500).json({ 
        error: 'Error al crear el pago',
        message: error.message 
      });
    }
  });
});

/**
 * Obtener estado de un PaymentIntent
 */
export const getPaymentIntentStatus = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      // Obtener ID del path: /getPaymentIntentStatus/:id
      const pathParts = req.path.split('/');
      const paymentIntentId = pathParts[pathParts.length - 1];

      if (!paymentIntentId || paymentIntentId === 'getPaymentIntentStatus') {
        res.status(400).json({ error: 'PaymentIntent ID is required' });
        return;
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      res.status(200).json({
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        paymentMethod: paymentIntent.payment_method_types[0],
      });

    } catch (error: any) {
      console.error('Error getting PaymentIntent status:', error);
      res.status(500).json({ 
        error: 'Error al obtener el estado del pago',
        message: error.message 
      });
    }
  });
});

/**
 * Webhook para recibir eventos de Stripe
 * Configura este endpoint en Stripe Dashboard -> Webhooks
 */
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = functions.config().stripe?.webhook_secret || process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Webhook secret not configured');
    res.status(500).send('Webhook secret not configured');
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Manejar el evento
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent succeeded:', paymentIntentSucceeded.id);
      
      // Actualizar estado en Firestore
      await db.collection('payment_intents').doc(paymentIntentSucceeded.id).update({
        status: 'succeeded',
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Actualizar la reserva si existe
      if (paymentIntentSucceeded.metadata.reservaId) {
        await db.collection('reservas').doc(paymentIntentSucceeded.metadata.reservaId).update({
          estadoPago: 'PAGADO',
          paymentIntentId: paymentIntentSucceeded.id,
          fechaPago: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // ========== ENVIAR EMAIL DE CONFIRMACIÓN ==========
      const customerEmail = paymentIntentSucceeded.metadata.customerEmail;
      const customerName = paymentIntentSucceeded.metadata.customerName;
      
      if (customerEmail && customerName) {
        // Crear token de confirmación
        const confirmToken = await createConfirmationToken(
          customerEmail,
          paymentIntentSucceeded.id,
          paymentIntentSucceeded.metadata.reservaId,
          paymentIntentSucceeded.metadata.entrenadorId
        );

        await sendPaymentConfirmationEmail(
          customerEmail,
          customerName,
          paymentIntentSucceeded.amount,
          paymentIntentSucceeded.metadata.reservaId,
          paymentIntentSucceeded.metadata.entrenadorNombre,
          confirmToken
        );
      }
      break;

    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent failed:', paymentIntentFailed.id);
      
      await db.collection('payment_intents').doc(paymentIntentFailed.id).update({
        status: 'failed',
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
        failureMessage: paymentIntentFailed.last_payment_error?.message,
      });
      break;

    case 'payment_intent.canceled':
      const paymentIntentCanceled = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent canceled:', paymentIntentCanceled.id);
      
      await db.collection('payment_intents').doc(paymentIntentCanceled.id).update({
        status: 'canceled',
        canceledAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      break;

    // OXXO específico: cuando el voucher expira
    case 'payment_intent.requires_action':
      const paymentIntentAction = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent requires action:', paymentIntentAction.id);
      
      // Para OXXO, esto significa que el voucher fue generado
      if (paymentIntentAction.payment_method_types.includes('oxxo')) {
        await db.collection('payment_intents').doc(paymentIntentAction.id).update({
          status: 'awaiting_payment',
          voucherGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Enviar email con instrucciones de OXXO
        const oxxoNextAction = paymentIntentAction.next_action?.oxxo_display_details;
        if (oxxoNextAction && paymentIntentAction.metadata.customerEmail) {
          const oxxoNumber = oxxoNextAction.number || 'Ver en la app';
          const expiresAt = oxxoNextAction.expires_after 
            ? new Date(oxxoNextAction.expires_after * 1000) 
            : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default: 24 horas

          // Crear token de confirmación para OXXO (durante desarrollo)
          const oxxoConfirmToken = await createConfirmationToken(
            paymentIntentAction.metadata.customerEmail,
            paymentIntentAction.id,
            paymentIntentAction.metadata.reservaId,
            paymentIntentAction.metadata.entrenadorId
          );

          await sendOxxoVoucherEmail(
            paymentIntentAction.metadata.customerEmail,
            paymentIntentAction.metadata.customerName || 'Cliente',
            paymentIntentAction.amount,
            oxxoNumber,
            expiresAt,
            paymentIntentAction.metadata.reservaId,
            paymentIntentAction.metadata.entrenadorNombre,
            oxxoConfirmToken
          );
        }
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

/**
 * Cancelar un PaymentIntent
 */
export const cancelPaymentIntent = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const { paymentIntentId } = req.body;

      if (!paymentIntentId) {
        res.status(400).json({ error: 'PaymentIntent ID is required' });
        return;
      }

      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

      // Actualizar en Firestore
      await db.collection('payment_intents').doc(paymentIntentId).update({
        status: 'canceled',
        canceledAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({
        success: true,
        status: paymentIntent.status,
      });

    } catch (error: any) {
      console.error('Error canceling PaymentIntent:', error);
      res.status(500).json({ 
        error: 'Error al cancelar el pago',
        message: error.message 
      });
    }
  });
});
