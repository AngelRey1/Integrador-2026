import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import cors from 'cors';
import { defineString } from 'firebase-functions/params';

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
