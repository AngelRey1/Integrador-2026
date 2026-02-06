# 💳 Integración de Stripe con OXXO - SportConnect

Esta guía explica cómo configurar y desplegar la integración de pagos con Stripe y OXXO.

## 📋 Requisitos Previos

1. Una cuenta de Stripe (https://dashboard.stripe.com)
2. Firebase CLI instalado (`npm install -g firebase-tools`)
3. Node.js v18 o superior

## 🔑 Paso 1: Obtener Claves de Stripe

1. Inicia sesión en tu [Dashboard de Stripe](https://dashboard.stripe.com)
2. Ve a **Developers > API keys**
3. Copia las claves:
   - **Publishable key** (pk_test_xxx o pk_live_xxx)
   - **Secret key** (sk_test_xxx o sk_live_xxx)

## 🔧 Paso 2: Configurar el Frontend

Edita el archivo `ngx-admin/src/environments/environment.ts`:

```typescript
stripe: {
  publishableKey: 'pk_test_TU_CLAVE_PUBLICA_AQUI',
  functionsUrl: 'https://us-central1-sportconecta-6d1ce.cloudfunctions.net'
}
```

Para producción, edita también `environment.prod.ts` con las claves live.

## ☁️ Paso 3: Configurar Firebase Functions

### 3.1 Instalar dependencias

```bash
cd functions
npm install
```

### 3.2 Configurar la clave secreta de Stripe

```bash
# Configurar la clave secreta (NUNCA la expongas en el código)
firebase functions:config:set stripe.secret_key="sk_test_TU_CLAVE_SECRETA"

# Para webhooks (opcional pero recomendado)
firebase functions:config:set stripe.webhook_secret="whsec_TU_WEBHOOK_SECRET"
```

### 3.3 Desplegar las funciones

```bash
cd ..
firebase deploy --only functions
```

## 🪝 Paso 4: Configurar Webhooks (Importante para OXXO)

Los webhooks son **esenciales** para saber cuándo un cliente paga en OXXO.

1. Ve a **Stripe Dashboard > Developers > Webhooks**
2. Click en **Add endpoint**
3. URL del endpoint: `https://us-central1-sportconecta-6d1ce.cloudfunctions.net/stripeWebhook`
4. Selecciona los eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `payment_intent.requires_action`
5. Click en **Add endpoint**
6. Copia el **Signing secret** y configúralo:

```bash
firebase functions:config:set stripe.webhook_secret="whsec_xxx"
firebase deploy --only functions
```

## 🏪 Paso 5: Habilitar OXXO en Stripe

1. Ve a **Stripe Dashboard > Settings > Payment methods**
2. Busca **OXXO** en la lista
3. Habilítalo para tu cuenta
4. Completa cualquier verificación requerida

> ⚠️ OXXO solo está disponible para transacciones en **MXN** (Pesos Mexicanos)

## 🧪 Probar la Integración

### Modo de prueba (Test Mode)

En modo de prueba, usa estos datos para simular pagos:

- **Email**: cualquier email válido
- **Nombre**: cualquier nombre

El voucher generado será de prueba y no se puede pagar en OXXO real.

### Verificar que funciona

1. Crea una reserva en la aplicación
2. Selecciona OXXO como método de pago
3. Deberías ver un voucher con:
   - Referencia de pago (número)
   - Monto a pagar
   - Fecha de expiración
   - Enlace al voucher hosted de Stripe

## 📊 Monitorear Pagos

### En Stripe Dashboard

- **Payments**: Ver todos los intentos de pago
- **Events**: Ver eventos de webhooks
- **Logs**: Ver logs de API

### En Firebase

- **Firestore > payment_intents**: Ver registros de pagos
- **Functions > Logs**: Ver logs de las funciones

## 🔄 Flujo de Pago OXXO

```
1. Cliente selecciona OXXO
        ↓
2. Frontend llama a createOxxoPaymentIntent (Cloud Function)
        ↓
3. Se crea PaymentIntent en Stripe
        ↓
4. Frontend confirma con confirmOxxoPayment
        ↓
5. Stripe genera el voucher con referencia
        ↓
6. Cliente ve el voucher y paga en OXXO
        ↓
7. OXXO notifica a Stripe (puede tomar minutos a horas)
        ↓
8. Stripe envía webhook payment_intent.succeeded
        ↓
9. Cloud Function actualiza Firestore
        ↓
10. La reserva se marca como pagada
```

## 🛠️ Estructura de Archivos

```
functions/
├── src/
│   └── index.ts          # Cloud Functions para Stripe
├── package.json
└── tsconfig.json

ngx-admin/
├── src/
│   ├── app/
│   │   └── @core/
│   │       └── services/
│   │           └── stripe.service.ts   # Servicio de Stripe
│   └── environments/
│       └── environment.ts              # Configuración
```

## 🔒 Seguridad

- **NUNCA** expongas la clave secreta de Stripe en el frontend
- Usa siempre Firebase Functions para crear PaymentIntents
- Valida webhooks con el signing secret
- Usa HTTPS en producción

## 📞 Soporte

- [Documentación de Stripe OXXO](https://stripe.com/docs/payments/oxxo)
- [Documentación de Firebase Functions](https://firebase.google.com/docs/functions)
