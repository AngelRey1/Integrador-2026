# 🏋️ SportConnect - Plataforma de Fitness

## 📋 Descripción
SportConnect es una plataforma integral que conecta entrenadores personales con clientes, facilitando la reserva de sesiones de entrenamiento, gestión de pagos y seguimiento del progreso.

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- Angular CLI 15+

### Iniciar ambos servidores
```powershell
cd "c:\Users\plant\Escuela utm\Integrador-2026"
.\start-servers.ps1
```

### O iniciar manualmente:

**Terminal 1 - Aplicación Principal (puerto 4200):**
```powershell
cd ngx-admin
npm start
```

**Terminal 2 - Panel Admin (puerto 4300):**
```powershell
cd sportconnect-admin
npm start
```

---

## 🌐 URLs de Acceso

| Aplicación | URL | Descripción |
|------------|-----|-------------|
| Landing Page | http://localhost:4200 | Página de inicio pública |
| Login | http://localhost:4200/auth/login | Inicio de sesión |
| Registro | http://localhost:4200/auth/register | Registro de usuarios |
| Panel Cliente | http://localhost:4200/pages/cliente | Dashboard del cliente |
| Panel Entrenador | http://localhost:4200/pages/entrenador | Dashboard del entrenador |
| **Panel Admin** | **http://localhost:4300** | Panel de administración |

---

## 🔐 Credenciales de Demo

### Clientes y Entrenadores
| Campo | Valor |
|-------|-------|
| Email | cualquier_email@ejemplo.com |
| Contraseña | 123456 |
| Rol | Seleccionar Cliente o Entrenador |

### Administrador
| Campo | Valor |
|-------|-------|
| Email | admin@sportconnect.com |
| Contraseña | admin123 |

---

## 📂 Estructura del Proyecto

```
Integrador-2026/
├── ngx-admin/                    # Aplicación principal
│   ├── src/app/
│   │   ├── auth/                 # Módulo de autenticación
│   │   │   ├── login/            # Página de login
│   │   │   ├── register/         # Página de registro
│   │   │   └── landing-page/     # Landing page
│   │   ├── pages/
│   │   │   ├── cliente/          # Panel del cliente
│   │   │   │   ├── dashboard/    # Dashboard principal
│   │   │   │   ├── mis-sesiones/ # Sesiones del cliente
│   │   │   │   ├── agendar/      # Buscar entrenadores
│   │   │   │   ├── pagos/        # Historial de pagos
│   │   │   │   └── resenas/      # Reseñas
│   │   │   └── entrenador/       # Panel del entrenador
│   │   │       ├── dashboard/    # Dashboard principal
│   │   │       ├── mis-clientes/ # Lista de clientes
│   │   │       ├── horarios/     # Gestión de horarios
│   │   │       └── ingresos/     # Estadísticas de ingresos
│   │   └── public/               # Páginas públicas
│   │       ├── landing/          # Landing page
│   │       └── client/           # Perfiles públicos
│   └── ...
│
├── sportconnect-admin/           # Panel de administración
│   ├── src/app/
│   │   ├── auth/
│   │   │   └── login/            # Login de admin
│   │   └── admin/
│   │       └── pages/
│   │           ├── dashboard/    # Dashboard admin
│   │           ├── usuarios/     # Gestión de usuarios
│   │           ├── entrenadores/ # Aprobar/rechazar entrenadores
│   │           ├── pagos/        # Ver transacciones
│   │           ├── deportes/     # Configurar deportes
│   │           └── reportes/     # Estadísticas y denuncias
│   └── ...
│
└── start-servers.ps1             # Script para iniciar ambos servidores
```

---

## 🔄 Flujo de Usuario

### 1. Landing Page → Login
```
http://localhost:4200 → Click "Iniciar Sesión" → http://localhost:4200/auth/login
```

### 2. Login → Panel según Rol
- **Cliente**: → `/pages/cliente/dashboard`
- **Entrenador**: → `/pages/entrenador/dashboard`
- **Admin**: → `http://localhost:4300/admin/dashboard`

### 3. Registro de Nuevo Usuario
```
Login → "¿No tienes cuenta?" → Registro → Seleccionar Rol → 
  Si Cliente: → Login automático
  Si Entrenador: → Pendiente de aprobación (admin debe aprobar)
```

### 4. Flujo del Administrador
```
http://localhost:4300 → Login Admin → Dashboard → 
  - Ver usuarios
  - Aprobar/Rechazar entrenadores
  - Ver pagos
  - Gestionar reportes
```

---

## 🎨 Características por Rol

### 👤 Cliente
- ✅ Buscar entrenadores por deporte/ubicación
- ✅ Ver perfiles de entrenadores
- ✅ Agendar sesiones
- ✅ Ver historial de sesiones
- ✅ Realizar pagos
- ✅ Dejar reseñas

### 💪 Entrenador
- ✅ Dashboard con estadísticas
- ✅ Gestionar disponibilidad/horarios
- ✅ Ver lista de clientes
- ✅ Ver ingresos y comisiones
- ✅ Gestionar sesiones

### 🛡️ Administrador
- ✅ Dashboard con métricas globales
- ✅ Aprobar/rechazar solicitudes de entrenadores
- ✅ Banear/desbanear usuarios
- ✅ Ver todas las transacciones
- ✅ Gestionar deportes disponibles
- ✅ Ver reportes y denuncias

---

## 🛠️ Comandos Útiles

```powershell
# Compilar ngx-admin
cd ngx-admin && npm run build

# Compilar sportconnect-admin
cd sportconnect-admin && npm run build

# Lint
npm run lint

# Tests
npm run test
```

---

## 📝 Notas para Presentación

1. **Iniciar ambos servidores** antes de la demo
2. Mostrar el flujo completo: Landing → Login → Dashboard
3. Demostrar diferentes roles (cambiar rol en login)
4. Para admin, abrir `http://localhost:4300` en otra pestaña
5. Los datos son estáticos (mock data) - se conectará a backend después

---

## 🔜 Próximos Pasos

- [ ] Conectar con backend Spring Boot
- [ ] Implementar autenticación JWT real
- [ ] Integrar pasarela de pago (Stripe/PayPal)
- [ ] Sistema de notificaciones en tiempo real
- [ ] App móvil con Ionic/React Native

---

**Desarrollado para UTM - Proyecto Integrador 2026**
