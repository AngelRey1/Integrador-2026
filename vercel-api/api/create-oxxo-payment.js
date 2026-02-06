const Stripe = require('stripe');

// Inicializar Stripe con la clave secreta desde variables de entorno
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, customerEmail, customerName, description, metadata } = req.body;

    // Validar datos requeridos
    if (!amount || !customerEmail || !customerName) {
      return res.status(400).json({
        error: 'Missing required fields: amount, customerEmail, customerName'
      });
    }

    // Crear el PaymentIntent para OXXO
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency: 'mxn',
      payment_method_types: ['oxxo'],
      description: description || 'Reserva SportConnect',
      metadata: {
        customerName,
        customerEmail,
        ...metadata
      },
      // Configuración específica para OXXO
      payment_method_options: {
        oxxo: {
          expires_after_days: 3 // El voucher expira en 3 días
        }
      }
    });

    // Retornar el client_secret para confirmar el pago en el frontend
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

  } catch (error) {
    console.error('Error creating OXXO PaymentIntent:', error);
    return res.status(500).json({
      error: error.message || 'Error creating payment intent'
    });
  }
};
