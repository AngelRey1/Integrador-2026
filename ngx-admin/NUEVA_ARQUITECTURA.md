# 🔄 NUEVA ARQUITECTURA SportConnect - Feedback Profesor

## ❌ Flujo Anterior (INCORRECTO)
```
Usuario → Registro → Login → App → Buscar entrenador → Reservar
```

## ✅ Flujo Nuevo (CORRECTO)
```
Landing → Chatbot (WhatsApp/Telegram) → Reserva → Pago → Clave → App (panel)
```

---

## 🎯 Nueva Propuesta de Sistema

### **1. Landing Page Principal** 🏠
**Objetivo**: Presentar deportes y captar leads

#### Características:
- ❌ **Eliminar branding ngx-admin** (cambiar logos, nombres, estilos)
- ✅ **Centrado en deportes**:
  - Hero section con deportes destacados
  - Cards por categoría (Fútbol, Natación, CrossFit, Yoga, etc.)
  - CTA principal: "Reserva tu entrenador por WhatsApp"
- ✅ **Sin login/registro visible**:
  - No mostrar formularios de registro
  - No pedir credenciales en la landing
  - Toda la conversión por chatbot
- ✅ **Mostrar entrenadores destacados**:
  - Filtros: deporte, ubicación, precio
  - Badge "⭐ Destacado" para profesionales
  - Costo por hora visible
  - Estrellas de calificación
  - Foto, nombre, especialidad

#### Tech Stack:
```
Opción A: Nueva landing separada (HTML/CSS/JS)
Opción B: Angular standalone (sin ngx-admin)
Opción C: Integrar en ngx-admin como página pública
```

**Recomendación**: Opción B o C (aprovechar Angular)

---

### **2. Chatbot para Reservas** 🤖
**Herramienta**: N8N (automatización)
**Canales**: WhatsApp + Telegram

#### Flujo del Chatbot:
```
1. Usuario: "Hola, quiero un entrenador de fútbol"
2. Bot: "¿Qué día prefieres? (opciones)"
3. Usuario: "Lunes 15:00"
4. Bot: "Te mostramos 3 entrenadores disponibles:
   - Juan Pérez (20€/h) ⭐⭐⭐⭐⭐
   - María López (25€/h) ⭐ Destacado
   - Carlos Ruiz (18€/h) ⭐⭐⭐⭐"
5. Usuario: "Elijo a María"
6. Bot: "Total: 25€. Link de pago: [Stripe/PayPal]"
7. Usuario: → Paga
8. Bot: "✅ Reserva confirmada. Tu código de acceso: ABC123XYZ"
9. Bot: "Accede a tu panel: https://sportconnect.com/app?code=ABC123XYZ"
```

#### N8N Workflow:
```
WhatsApp/Telegram Trigger
  → Validar mensaje
  → Consultar BD (entrenadores disponibles)
  → Enviar opciones
  → Recibir selección
  → Generar link de pago (Stripe/PayPal)
  → Webhook de pago confirmado
  → Crear reserva en BD
  → Generar código único
  → Enviar código + link app
```

---

### **3. App Web (Panel Post-Pago)** 📱
**Objetivo**: Dashboard para clientes y entrenadores

#### Acceso:
- ❌ **NO hay registro tradicional**
- ✅ **Acceso por código único** (desde chatbot)
- ✅ Primera vez: Usuario completa perfil básico
- ✅ Sesiones siguientes: Login tradicional (ya registrado)

#### Vistas por Rol:

**Cliente**:
- Ver mis reservas activas
- Historial de sesiones
- Mis pagos y facturas
- Dejar reseñas a entrenadores
- Re-reservar (sin chatbot si ya es cliente)

**Entrenador**:
- Ver mis clientes
- Calendario de sesiones
- Gestionar disponibilidad
- Ver ingresos
- Perfil público (editar bio, fotos, deportes)

**Admin**:
- Gestión de usuarios
- Aprobar/rechazar entrenadores
- Ver reportes
- Gestionar deportes
- (Ya tienes sportconnect-admin para esto ✅)

---

### **4. Funcionalidades Clave** 🔑

#### A. Sistema de "Destacado" ⭐
```typescript
entrenador {
  id: number;
  nombre: string;
  destacado: boolean; // Badge "⭐ Destacado"
  nivel: 'BASICO' | 'PROFESIONAL' | 'ELITE';
  certificaciones: string[];
}
```

#### B. Costo por Hora 💰
```typescript
tarifas {
  id: number;
  entrenador_id: number;
  deporte_id: number;
  precio_hora: number;
  moneda: 'EUR' | 'USD';
}
```

#### C. Sistema de Calificaciones ⭐⭐⭐⭐⭐
```typescript
resenas {
  id: number;
  cliente_id: number;
  entrenador_id: number;
  calificacion: 1-5;
  comentario: string;
  fecha: date;
}

// Calcular promedio
entrenador.calificacion_promedio = AVG(resenas.calificacion)
```

#### D. Filtro de Ubicación Cercana 📍
```typescript
entrenadores {
  id: number;
  nombre: string;
  latitud: float;
  longitud: float;
  radio_servicio_km: number;
}

// Query:
SELECT * FROM entrenadores
WHERE ST_Distance_Sphere(
  point(longitud, latitud),
  point(user_lon, user_lat)
) / 1000 <= radio_servicio_km
ORDER BY distancia ASC;
```

**Frontend**: 
- Pedir geolocalización al usuario
- Mostrar mapa con entrenadores cercanos
- Filtro "Cercanos a mí" (< 5km, < 10km, < 20km)

---

## 🏗️ Nueva Estructura del Proyecto

```
SportConnect/
├── landing/                    # Landing page pública
│   ├── index.html
│   ├── deportes.html
│   ├── entrenadores.html      # Galería con filtros
│   └── assets/
│
├── ngx-admin/                  # App principal (panel clientes/entrenadores)
│   ├── src/app/
│   │   ├── auth/
│   │   │   ├── codigo-acceso/  # NEW: Login por código chatbot
│   │   │   ├── completar-perfil/ # NEW: Primera vez
│   │   │   └── login/          # Tradicional (usuarios existentes)
│   │   ├── pages/
│   │   │   ├── cliente/
│   │   │   └── entrenador/
│   │   └── @core/
│   │       └── services/
│   │           └── codigo-acceso.service.ts # NEW
│
├── sportconnect-admin/         # Panel admin ✅
│
├── backend/                    # API REST
│   ├── auth/
│   │   ├── codigo-acceso.controller.ts
│   │   └── validar-codigo.ts
│   ├── chatbot/
│   │   ├── webhook-whatsapp.ts
│   │   └── webhook-telegram.ts
│   ├── pagos/
│   │   └── webhook-stripe.ts
│   └── entrenadores/
│       ├── buscar-cercanos.ts
│       └── listar-destacados.ts
│
└── n8n/                        # Workflows chatbot
    ├── flujo-reserva-whatsapp.json
    └── flujo-reserva-telegram.json
```

---

## 📋 Plan de Implementación

### **FASE 1: Rebranding y Landing** (2-3 horas)
- [ ] Eliminar referencias a "ngx-admin"
- [ ] Cambiar logo, colores, nombre a "SportConnect"
- [ ] Crear landing page:
  - Hero section
  - Galería de deportes
  - Lista de entrenadores (con filtros)
  - CTA a WhatsApp

### **FASE 2: Sistema de Códigos de Acceso** (2 horas)
- [ ] Backend: endpoint `/auth/validate-code`
- [ ] Frontend: página "Acceso con código"
- [ ] Flujo: código → crear usuario → dashboard

### **FASE 3: Chatbot N8N** (3-4 horas)
- [ ] Configurar N8N
- [ ] Webhook WhatsApp Business API
- [ ] Webhook Telegram Bot API
- [ ] Flujo completo de reserva
- [ ] Integración con Stripe/PayPal
- [ ] Generar códigos únicos

### **FASE 4: Funcionalidades Avanzadas** (3-4 horas)
- [ ] Badge "Destacado" en entrenadores
- [ ] Sistema de calificaciones (estrellas)
- [ ] Filtro de ubicación (geolocalización)
- [ ] Costo por hora visible

### **FASE 5: Mejoras del PLAN_MEJORAS.md** (4 horas)
- [ ] Modelos TypeScript
- [ ] Manejo de errores
- [ ] Notificaciones
- [ ] Loading global

---

## 🎯 Prioridad AHORA (antes de base de datos)

### **1. Rebranding** (URGENTE)
Quitar todo rastro de ngx-admin:
- Logos
- Colores
- Textos
- Referencias

### **2. Landing Page** (CRÍTICO)
Crear página pública atractiva centrada en deportes

### **3. Sistema de Códigos** (CRÍTICO)
Para que el flujo chatbot → app funcione

### **4. Base de Datos** (DESPUÉS)
Diseñar esquema PostgreSQL con:
- Códigos de acceso
- Entrenadores destacados
- Ubicaciones
- Calificaciones

---

## ❓ ¿Qué Hacemos AHORA?

**Opción A**: Empezar con Rebranding (cambiar ngx-admin a SportConnect)
**Opción B**: Diseñar Landing Page primero
**Opción C**: Implementar sistema de códigos de acceso
**Opción D**: Todo el plan completo paso a paso

**Mi recomendación**: Opción D (paso a paso, empezando por A)

¿Arrancamos con el **rebranding** para que veas cambios visuales rápidos? 🚀
