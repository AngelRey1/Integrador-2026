# 🚀 ROADMAP V2: SPORTCONNECTA PROFESIONAL

## 💼 FASE 1: Modelo de Negocio (Suscripciones para Entrenadores)
- [ ] **1. Ajuste en Registro:** Otorgar 30 días de Trial exactos y campos \stadoSuscripcion: 'trial'\ al registrar a un entrenador.
- [ ] **2. Middlewares de Acceso:** Crear un Guard en Angular que expulse al entrenador si su cuenta pasa a \xpirada\.
- [ ] **3. Vistas de Cobro:** Diseñar la pantalla 'Mi Plan' donde los entrenadores puedan insertar su tarjeta para pagar Mensual (\) o Anual (\,000).
- [ ] **4. Webhooks (Vercel/Firebase):** Recibir notificaciones de Stripe para actualizar auto-mágicamente la BD a \stado: 'active'\.

## 🌍 FASE 2: Geolocalización Real y Landing Page
- [ ] **1. Permiso de GPS:** Pedir ubicación en la Landing para filtrar entrenadores en un radio KM.
- [ ] **2. Corrección de Perfiles:** Mostrar Años de Experiencia y calcular la distancia de los clientes.
- [ ] **3. UX de Teclado:** Integrar HostListener para que componentes respondan al Esc y flechitas.
- [ ] **4. Estadísticas Dinámicas:** Las métricas de landing contarán documentos reales en Firestore.

## 🔍 FASE 3: Buscador Inteligente
- [ ] **1. Algoritmo Fuzzy:** Usar Fuse.js para que 'crozfit' devuelva 'CrossFit'.
- [ ] **2. Dropdowns Persistentes:** Cambiar deporte no reseteará precio ni locación.
- [ ] **3. UI Unificada:** Buscador más ancho, rápido y minimalista.

## 💬 FASE 4: Chat Omnicanal
- [ ] **1. Sincronización a 3:** Cliente, Entrenador y Admin leyendo bajo el mismo esquema de Chat.
- [ ] **2. Editar/Borrar:** Mejoras de funcionalidad en tiempo real.

## 🎨 FASE 5: UI Global
- [ ] **1. Consistencia:** Unificar paleta \--sc-primary\ en portales de los 3 actores.
- [ ] **2. Ergonomía:** Agendar clases a entrenadores recientes más ágil y re-ordenar botones.
