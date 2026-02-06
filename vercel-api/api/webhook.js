const Stripe = require('stripe');

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Necesitamos el body raw para verificar la firma
export const config = {
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

module.exports = async function handler(req, res) {
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
        // Aquí puedes agregar lógica para actualizar tu base de datos
        // Por ejemplo, marcar la reserva como pagada
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
};
