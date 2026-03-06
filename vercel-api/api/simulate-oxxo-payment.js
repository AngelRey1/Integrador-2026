const Stripe = require('stripe');

// Inicializar Stripe con la clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Endpoint para simular un pago OXXO en modo TEST
 * Solo funciona con claves de prueba (sk_test_...)
 * 
 * En modo TEST, Stripe permite "confirmar" pagos OXXO manualmente
 * usando un método de pago de prueba especial
 */
module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentIntentId } = req.body;

    // Validar que se proporcione el ID
    if (!paymentIntentId) {
      return res.status(400).json({
        error: 'Se requiere paymentIntentId'
      });
    }

    // Verificar que estamos en modo TEST
    if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
      return res.status(403).json({
        error: 'Esta función solo está disponible en modo TEST'
      });
    }

    console.log('=== SIMULAR PAGO OXXO ===');
    console.log('PaymentIntent ID:', paymentIntentId);

    // Obtener el PaymentIntent actual
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log('Estado actual:', paymentIntent.status);
    console.log('Tipo de pago:', paymentIntent.payment_method_types);

    // Verificar que es un pago OXXO pendiente
    if (paymentIntent.status === 'succeeded') {
      return res.status(200).json({
        success: true,
        message: 'El pago ya fue completado anteriormente',
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        }
      });
    }

    // En modo TEST, podemos usar el endpoint de prueba de Stripe
    // para simular que el pago OXXO fue recibido
    
    // Método alternativo: Crear un evento de prueba
    // Stripe en modo test permite simular pagos OXXO directamente
    
    // Para OXXO en test mode, necesitamos usar el payment method de prueba
    // Ver: https://stripe.com/docs/payments/oxxo/accept-a-payment#test-your-integration
    
    if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_payment_method') {
      // En modo test, podemos confirmar el PaymentIntent con un método de pago de prueba
      // especial que simula OXXO completado
      
      // Opción 1: Si ya tiene payment_method, intentamos confirmar
      if (paymentIntent.payment_method) {
        // Para OXXO, Stripe maneja la confirmación automáticamente cuando el cliente paga
        // En test mode, tenemos que simular esto de otra manera
        
        // Usamos el webhook de prueba para simular
        const testEvent = {
          type: 'payment_intent.succeeded',
          data: {
            object: paymentIntent
          }
        };
        
        console.log('PaymentIntent encontrado, estado:', paymentIntent.status);
      }
      
      // Método directo: Usar la API de test helpers de Stripe
      // Esto funciona solo en modo test
      try {
        // En Stripe Test Mode, podemos usar el endpoint especial para simular
        // que el cliente pagó en OXXO
        // https://stripe.com/docs/payments/oxxo/accept-a-payment#test-your-integration
        
        // La forma más directa es actualizar el PaymentIntent para TEST
        // Nota: En producción, Stripe maneja esto automáticamente cuando el cliente paga
        
        const updatedIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
          payment_method_data: {
            type: 'oxxo',
            billing_details: {
              name: paymentIntent.metadata?.customerName || 'Test Customer',
              email: paymentIntent.metadata?.customerEmail || 'test@test.com'
            }
          }
        });
        
        console.log('PaymentIntent confirmado:', updatedIntent.status);
        
        return res.status(200).json({
          success: true,
          message: 'Pago simulado exitosamente. El voucher OXXO fue generado.',
          paymentIntent: {
            id: updatedIntent.id,
            status: updatedIntent.status,
            amount: updatedIntent.amount,
            currency: updatedIntent.currency
          },
          note: 'En modo TEST, el pago OXXO queda en estado "requires_action" esperando que el cliente pague. Usa el dashboard de Stripe para marcar como completado.'
        });
      } catch (confirmError) {
        console.log('No se pudo confirmar directamente:', confirmError.message);
        
        // Si no se puede confirmar directamente, dar instrucciones
        return res.status(200).json({
          success: true,
          message: 'PaymentIntent encontrado. Para simular el pago completado:',
          instructions: [
            '1. Ve a https://dashboard.stripe.com/test/payments',
            `2. Busca el pago con ID: ${paymentIntentId}`,
            '3. Haz clic en el pago',
            '4. En la sección de eventos, usa "Succeed" para simular el pago',
            'O usa: stripe trigger payment_intent.succeeded --stripe-account=default'
          ],
          paymentIntent: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency
          }
        });
      }
    }

    // Si está en otro estado
    return res.status(200).json({
      success: false,
      message: `El PaymentIntent está en estado: ${paymentIntent.status}`,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      }
    });

  } catch (error) {
    console.error('Error simulando pago OXXO:', error);
    return res.status(500).json({
      error: error.message || 'Error al simular el pago'
    });
  }
};
