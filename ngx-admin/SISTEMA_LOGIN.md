# 🔐 Sistema de Login con Roles

## ✅ Implementación Completada

Se ha implementado un sistema completo de autenticación con roles que:

1. **Requiere login antes de acceder al proyecto**
2. **Redirige según el rol del usuario** (Cliente, Entrenador, Admin)
3. **Muestra menús diferentes según el rol**
4. **Protege las rutas con guards**

---

## 🎯 Cómo Funciona

### 1. **Flujo de Autenticación**

```
Usuario accede → Redirige a /auth/login → Ingresa credenciales → 
Sistema detecta rol → Redirige a dashboard correspondiente
```

### 2. **Roles y Redirecciones**

| Rol | Email de Prueba | Redirección |
|-----|----------------|-------------|
| **CLIENTE** | `cliente@test.com` | `/pages/cliente/dashboard` |
| **ENTRENADOR** | `entrenador@test.com` o contiene "entrenador" | `/pages/entrenador/dashboard` |
| **ADMIN** | `admin@test.com` o contiene "admin" | `/pages/admin/dashboard` |

### 3. **Menús por Rol**

#### **Cliente** ve:
- Dashboard
- Buscar Entrenadores
- Agendar Sesión
- Mis Reservas
- Mis Pagos
- Mis Reseñas
- Mi Perfil

#### **Entrenador** ve:
- Dashboard Entrenador
- Mi Perfil
- Gestión de Clases
- Mis Clientes
- Calendario Disponibilidad
- Mis Ingresos

#### **Admin** ve:
- Dashboard Admin
- Gestión de Usuarios
- Gestión de Entrenadores
- Gestión de Deportes
- Gestión de Clases
- Gestión de Reservas
- Gestión de Pagos
- Reportes

---

## 🚀 Cómo Probar (Sin Backend)

El sistema incluye un **modo mock** para desarrollo sin backend:

### **Login Mock - Detección por Email**

El sistema detecta el rol basándose en el email:

1. **Para Cliente:**
   - Email: `cliente@test.com`
   - Contraseña: cualquier cosa (mínimo 6 caracteres)

2. **Para Entrenador:**
   - Email: `entrenador@test.com` o cualquier email que contenga "entrenador"
   - Contraseña: cualquier cosa (mínimo 6 caracteres)

3. **Para Admin:**
   - Email: `admin@test.com` o cualquier email que contenga "admin"
   - Contraseña: cualquier cosa (mínimo 6 caracteres)

### **Ejemplos de Login:**

```
Email: cliente@test.com
Contraseña: 123456
→ Redirige a Dashboard Cliente

Email: entrenador@test.com
Contraseña: password123
→ Redirige a Dashboard Entrenador

Email: admin@test.com
Contraseña: admin123
→ Redirige a Dashboard Admin
```

---

## 🔒 Protección de Rutas

### **Guards Implementados:**

1. **AuthGuard** - Verifica que el usuario esté autenticado
2. **ClienteGuard** - Solo permite acceso a usuarios con rol CLIENTE
3. **EntrenadorGuard** - Solo permite acceso a usuarios con rol ENTRENADOR
4. **AdminGuard** - Solo permite acceso a usuarios con rol ADMIN

### **Rutas Protegidas:**

```typescript
/pages/cliente/*     → Requiere: AuthGuard + ClienteGuard
/pages/entrenador/*  → Requiere: AuthGuard + EntrenadorGuard
/pages/admin/*       → Requiere: AuthGuard + AdminGuard
```

Si un usuario intenta acceder a una ruta que no corresponde a su rol, será redirigido al login.

---

## 📁 Archivos Creados/Modificados

### **Nuevos Archivos:**
- `src/app/auth/login/login.component.html` - Template del login
- `src/app/auth/login/login.component.scss` - Estilos del login
- `src/app/@core/guards/entrenador.guard.ts` - Guard para entrenador
- `src/app/@core/guards/admin.guard.ts` - Guard para admin

### **Archivos Modificados:**
- `src/app/auth/login/login.component.ts` - Lógica del login mejorada
- `src/app/auth/auth.module.ts` - Módulos de Nebular agregados
- `src/app/app-routing.module.ts` - Routing principal actualizado
- `src/app/pages/pages-routing.module.ts` - Guards agregados a rutas
- `src/app/@core/guards/cliente.guard.ts` - Guard mejorado
- `src/app/@theme/components/header/header.component.ts` - Eliminado cambio manual de rol
- `src/app/pages/pages.component.ts` - Actualización dinámica del menú
- `src/app/pages/pages-menu.ts` - Función mejorada

---

## 🎨 Características del Login

### **Validaciones:**
- ✅ Email requerido y formato válido
- ✅ Contraseña requerida (mínimo 6 caracteres)
- ✅ Mensajes de error claros
- ✅ Estados de carga durante el login

### **Diseño:**
- ✅ Interfaz moderna y responsive
- ✅ Gradiente de fondo atractivo
- ✅ Formulario centrado y bien estructurado
- ✅ Checkbox "Recordar sesión"
- ✅ Link a registro

---

## 🔄 Flujo Completo

1. **Usuario accede a la aplicación**
   - Si no tiene token → Redirige a `/auth/login`
   - Si tiene token → Redirige según su rol

2. **Usuario ingresa credenciales**
   - Sistema valida el formulario
   - Intenta login con backend
   - Si falla, usa modo mock (desarrollo)

3. **Sistema detecta rol**
   - Del token JWT (si hay backend)
   - Del email (modo mock)

4. **Redirección automática**
   - Cliente → `/pages/cliente/dashboard`
   - Entrenador → `/pages/entrenador/dashboard`
   - Admin → `/pages/admin/dashboard`

5. **Menú se actualiza**
   - El menú lateral muestra opciones según el rol
   - No se puede cambiar de rol manualmente

6. **Protección de rutas**
   - Si intenta acceder a ruta de otro rol → Redirige a login
   - Si el token expira → Redirige a login

---

## 🛠️ Integración con Backend Real

Cuando tengas un backend, el sistema funcionará automáticamente:

1. **El backend debe devolver un JWT con el formato:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

2. **El token debe incluir en el payload:**
```json
{
  "sub": "user-id",
  "role": "CLIENTE|ENTRENADOR|ADMIN",
  "exp": 1234567890
}
```

3. **El sistema automáticamente:**
   - Guarda el token en `localStorage`
   - Decodifica el rol
   - Redirige según el rol
   - Actualiza el menú

---

## ✅ Estado Actual

- ✅ Login funcional con diseño moderno
- ✅ Detección de rol automática
- ✅ Redirección según rol
- ✅ Menús diferentes por rol
- ✅ Guards protegiendo rutas
- ✅ Modo mock para desarrollo sin backend
- ✅ Eliminado cambio manual de rol
- ✅ Logout funcional

---

## 🎯 Próximos Pasos (Opcional)

1. **Mejorar el componente de registro** para que también detecte el rol
2. **Agregar "Olvidé mi contraseña"** funcional
3. **Agregar validación de token expirado** y renovación automática
4. **Mejorar mensajes de error** más específicos

---

**¡El sistema de login está completamente funcional!** 🎉

Ahora cada usuario verá solo su menú correspondiente según su rol, y no podrá cambiar de rol manualmente.

