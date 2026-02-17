# Sportconnecta Stripe API (Vercel)

API serverless para procesar pagos con Stripe (OXXO y tarjetas).

## 🚀 Despliegue en Vercel

### Paso 1: Crear cuenta en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Regístrate con GitHub (gratis)

### Paso 2: Instalar Vercel CLI (opcional)
```bash
npm install -g vercel
```

### Paso 3: Desplegar
**Opción A - Desde CLI:**
```bash
cd vercel-api
vercel login
vercel --prod
```

**Opción B - Desde GitHub:**
1. Sube este proyecto a un repositorio de GitHub
2. En Vercel, haz clic en "New Project"
3. Importa el repositorio
4. Vercel detectará automáticamente la configuración

### Paso 4: Configurar Variables de Entorno
En el dashboard de Vercel:
1. Ve a tu proyecto → Settings → Environment Variables
2. Agrega:
   - `STRIPE_SECRET_KEY` = tu clave secreta de Stripe (sk_test_...)
   - `STRIPE_WEBHOOK_SECRET` = (lo obtienes al configurar el webhook)
   - `EMAIL_USER` = tu correo de Gmail
   - `EMAIL_PASSWORD` = App Password de Gmail (ver instrucciones abajo)

### Paso 5: Configurar Gmail para envío de correos
1. Ve a https://myaccount.google.com/security
2. Activa la verificación en 2 pasos
3. Ve a https://myaccount.google.com/apppasswords
4. Crea una nueva "App Password" para "Correo"
5. Usa esa contraseña de 16 caracteres como `EMAIL_PASSWORD`

## 📡 Endpoints

### POST /api/create-oxxo-payment
Crea un PaymentIntent para pago con OXXO.

**Body:**
```json
{
  "amount": 500,
  "customerEmail": "cliente@email.com",
  "customerName": "Juan Pérez",
  "description": "Reserva de entrenamiento",
  "metadata": {
    "reservaId": "abc123",
    "entrenadorId": "xyz789"
  }
}
```

### POST /api/create-card-payment
Crea un PaymentIntent para pago con tarjeta.

**Body:** (mismo formato que OXXO)

### POST /api/webhook
Endpoint para webhooks de Stripe.

## 🔗 URL de tu API

Después del despliegue, tu URL será algo como:
```
https://sportconnecta-stripe-api.vercel.app
```

Actualiza `environment.ts` en tu app Angular con esta URL.
