# Postman Test Plan (Sportconnecta)

This file contains the full list of manual and automated tests for both backends:
- Firebase Functions (functions)
- Vercel API (vercel-api)

It includes Stripe card and OXXO flows, webhook verification, email sending, and error cases.

---

## Global Variables (Postman)

- baseFunctionsUrl = https://<region>-<project>.cloudfunctions.net
- baseVercelUrl = https://<your-project>.vercel.app
- stripeWebhookSecret = whsec_...
- stripeSecretKey = sk_test_...
- testEmail = cliente@ejemplo.com
- testName = Juan Perez
- testAmountCard = 5000
- testAmountOxxo = 10000
- reservaId = reserva_test_123
- entrenadorId = entrenador_test_456

---

# Vercel API (vercel-api)

## 1) POST /api/create-card-payment

### Manual
Body:
{
  "amount": 5000,
  "customerEmail": "{{testEmail}}",
  "customerName": "{{testName}}",
  "description": "Reserva de entrenamiento",
  "metadata": { "reservaId": "{{reservaId}}", "entrenadorId": "{{entrenadorId}}" }
}

Validate:
- 200 status
- clientSecret not empty
- paymentIntentId not empty
- amount equals input
- currency = mxn

### Automated (Tests)
- Status 200
- clientSecret exists and contains "_secret_"
- paymentIntentId starts with "pi_"
- Store paymentIntentId


## 2) POST /api/create-card-payment (errors)

### Manual / Automated
- missing amount -> 400
- missing customerEmail -> 400
- missing customerName -> 400

Expected:
- 400 status
- error contains "Missing required fields"


## 3) POST /api/create-oxxo-payment

### Manual
Body:
{
  "amount": 10000,
  "customerEmail": "{{testEmail}}",
  "customerName": "{{testName}}",
  "description": "Reserva OXXO",
  "metadata": { "reservaId": "{{reservaId}}", "entrenadorId": "{{entrenadorId}}" }
}

Validate:
- 200 status
- clientSecret not empty
- paymentIntentId not empty

### Automated
- Status 200
- clientSecret exists
- Store paymentIntentId


## 4) POST /api/create-oxxo-payment (errors)

### Manual / Automated
- missing amount -> 400
- missing customerEmail -> 400
- missing customerName -> 400


## 5) POST /api/send-oxxo-email

### Manual
Body:
{
  "customerEmail": "{{testEmail}}",
  "customerName": "{{testName}}",
  "amount": 10000,
  "oxxoNumber": "123456789012",
  "expiresAt": 1760000000,
  "entrenadorNombre": "Coach X",
  "fecha": "2026-02-20",
  "hora": "10:00"
}

Validate:
- 200 status
- success = true

### Automated
- Status 200
- success = true

Errors:
- missing customerEmail / amount / oxxoNumber -> 400
- missing EMAIL_USER or EMAIL_PASSWORD -> 500 with message


## 6) POST /api/webhook

### Manual
- Send signed event with stripeWebhookSecret
- Test event: payment_intent.succeeded

Validate:
- 200 status
- received = true

### Automated
- Status 200
- received = true


---

# Firebase Functions (functions)

## 7) POST /createCardPaymentIntent

### Manual
Body:
{
  "amount": 5000,
  "customerEmail": "{{testEmail}}",
  "customerName": "{{testName}}",
  "description": "Reserva con tarjeta",
  "metadata": { "reservaId": "{{reservaId}}", "entrenadorId": "{{entrenadorId}}" }
}

Validate:
- 200 status
- clientSecret not empty
- paymentIntentId not empty

### Automated
- Status 200
- Store paymentIntentId


## 8) POST /createCardPaymentIntent (errors)

### Manual / Automated
- amount < 500 -> 400
- missing fields -> 400


## 9) POST /createOxxoPaymentIntent

### Manual
Body:
{
  "amount": 10000,
  "customerEmail": "{{testEmail}}",
  "customerName": "{{testName}}",
  "description": "Reserva OXXO",
  "metadata": { "reservaId": "{{reservaId}}", "entrenadorId": "{{entrenadorId}}" }
}

Validate:
- 200 status
- clientSecret not empty
- paymentIntentId not empty

### Automated
- Status 200
- Store paymentIntentId


## 10) POST /createOxxoPaymentIntent (errors)

### Manual / Automated
- amount < 1000 -> 400
- missing fields -> 400


## 11) GET /getPaymentIntentStatus/{id}

### Manual
- Use paymentIntentId
- Validate status, amount, currency, paymentMethod

### Automated
- Status 200
- status in [requires_payment_method, requires_action, succeeded, canceled]


## 12) POST /cancelPaymentIntent

### Manual
Body:
{ "paymentIntentId": "{{paymentIntentId}}" }

Validate:
- 200 status
- success = true
- status = canceled

### Automated
- Status 200
- status = canceled


## 13) POST /stripeWebhook

### Manual
- Send signed event:
  - payment_intent.succeeded
  - payment_intent.payment_failed
  - payment_intent.canceled
  - payment_intent.requires_action

Validate:
- 200 status
- received = true

### Automated
- Status 200
- received = true


---

# End-to-End Manual Scenarios

1) Card (Vercel) -> create intent -> confirm -> webhook succeeded
2) OXXO (Vercel) -> create intent -> confirm -> voucher -> email -> webhook succeeded
3) Card (Functions) -> create intent -> confirm -> webhook updates Firestore
4) OXXO (Functions) -> create intent -> confirm -> webhook requires_action sends email
5) Webhook invalid signature -> 400
6) CORS preflight -> OPTIONS 200
7) Idempotency -> duplicate webhook does not break
8) Missing secrets -> 500
9) Malformed data -> 400
10) Email sender missing -> 500


---

# Postman Test Scripts (copy into Tests tab)

## For create-card-payment / create-oxxo-payment
pm.test("Status 200", function () {
  pm.response.to.have.status(200);
});

pm.test("clientSecret exists", function () {
  const json = pm.response.json();
  pm.expect(json.clientSecret).to.be.a("string");
});

pm.test("paymentIntentId exists", function () {
  const json = pm.response.json();
  pm.expect(json.paymentIntentId).to.match(/^pi_/);
});

pm.environment.set("paymentIntentId", pm.response.json().paymentIntentId);


## For error cases
pm.test("Status 400", function () {
  pm.response.to.have.status(400);
});


## For getPaymentIntentStatus
pm.test("Status 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Valid status", function () {
  const json = pm.response.json();
  pm.expect([
    "requires_payment_method",
    "requires_action",
    "succeeded",
    "canceled"
  ]).to.include(json.status);
});


## For webhook
pm.test("Status 200", function () {
  pm.response.to.have.status(200);
});

pm.test("received true", function () {
  const json = pm.response.json();
  pm.expect(json.received).to.eql(true);
});
