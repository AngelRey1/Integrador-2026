const Stripe = require('stripe');
const admin = require('firebase-admin');

// Inicializar Stripe
const stripeKey = (process.env.STRIPE_SECRET_KEY || '').trim().replace(/[\r\n]/g, '');
const stripe = new Stripe(stripeKey);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Inicializar Firebase Admin (singleton)
if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } catch (e) {
      console.error('Error al inicializar Firebase Admin:', e.message);
    }
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT no configurada: los pagos no se actualizarán en Firebase');
  }
}

const db = admin.apps.length ? admin.firestore() : null;

// Necesitamos el body raw para verificar la firma
const config = {
  api: {
    bodyParser: false,
  },
};

// Helper para obtener el raw body
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'];

    let event;

    // Verificar la firma del webhook
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Manejar los diferentes tipos de eventos
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('✅ Pago exitoso:', paymentIntent.id);
        if (db) {
          try {
            // Buscar el documento de pago por stripePaymentIntentId
            const pagosSnap = await db.collection('pagos')
              .where('stripePaymentIntentId', '==', paymentIntent.id)
              .limit(1)
              .get();

            if (!pagosSnap.empty) {
              const pagoDoc = pagosSnap.docs[0];
              const pagoData = pagoDoc.data();

              // Actualizar estado del pago a COMPLETADO
              await pagoDoc.ref.update({
                estado: 'COMPLETADO',
                fechaPago: admin.firestore.FieldValue.serverTimestamp()
              });
              console.log('✅ Pago actualizado a COMPLETADO:', pagoDoc.id);

              // Actualizar la reserva relacionada a CONFIRMADA
              if (pagoData.reservaId) {
                await db.collection('reservas').doc(pagoData.reservaId).update({
                  estado: 'CONFIRMADA'
                });
                console.log('✅ Reserva actualizada a CONFIRMADA:', pagoData.reservaId);
              }
            } else {
              console.warn('No se encontró pago con PaymentIntent:', paymentIntent.id);
            }
          } catch (err) {
            console.error('Error al actualizar Firebase:', err.message);
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('❌ Pago fallido:', failedPayment.id);
        break;

      case 'payment_intent.created':
        console.log('📝 PaymentIntent creado:', event.data.object.id);
        break;

      case 'charge.succeeded':
        console.log('💰 Cargo exitoso');
        break;

      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    // Responder a Stripe
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

module.exports = handler;
module.exports.config = config;
