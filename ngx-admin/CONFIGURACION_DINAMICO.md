# 🔄 Configuración del Proyecto Dinámico

## ✅ Cambios Realizados

El proyecto ha sido configurado para funcionar de forma **dinámica** conectándose a un backend real mediante APIs REST.

### 1. **Environment Variables** ✅
- `src/environments/environment.ts` - Configuración para desarrollo
- `src/environments/environment.prod.ts` - Configuración para producción

**Configuración actual:**
```typescript
export const environment = {
  production: false,
  apiUrl: '/api/v1', // Usa proxy en desarrollo
};
```

### 2. **Servicios HTTP Mejorados** ✅

#### **ApiService** (`src/app/@core/services/api.service.ts`)
- Construye URLs automáticamente usando `environment.apiUrl`
- Soporta GET, POST, PUT, PATCH, DELETE
- Maneja parámetros de consulta automáticamente

#### **ClienteService** (`src/app/@core/services/cliente.service.ts`)
Métodos disponibles:
- `buscarEntrenadores(query?)` - Buscar entrenadores con filtros
- `getEntrenador(id)` - Obtener detalles de un entrenador
- `misReservas()` - Obtener todas las reservas del cliente
- `crearReserva(reserva)` - Crear nueva reserva
- `cancelarReserva(id)` - Cancelar una reserva
- `misPagos()` - Obtener historial de pagos
- `misResenas()` - Obtener reseñas del cliente
- `crearResena(resena)` - Crear nueva reseña
- `getPerfil()` - Obtener perfil del cliente
- `actualizarPerfil(perfil)` - Actualizar perfil
- `getDashboardStats()` - Obtener estadísticas del dashboard

#### **EntrenadorService** (`src/app/@core/services/entrenador.service.ts`)
Métodos disponibles:
- `misClases()` - Obtener todas las clases
- `crearClase(clase)` - Crear nueva clase
- `actualizarClase(id, clase)` - Actualizar clase
- `eliminarClase(id)` - Eliminar clase
- `getDisponibilidad(fecha?)` - Obtener disponibilidad
- `misClientes()` - Obtener lista de clientes
- `getIngresos(fechaInicio?, fechaFin?)` - Obtener ingresos
- `getReservas(estado?)` - Obtener reservas
- `getDashboardStats()` - Obtener estadísticas del dashboard

#### **AdminService** (`src/app/@core/services/admin.service.ts`)
Métodos disponibles:
- `getStats()` - Obtener estadísticas generales
- `getUsuarios(filtros?)` - Obtener lista de usuarios
- `actualizarUsuario(id, usuario)` - Actualizar usuario
- `cambiarRol(id, rol)` - Cambiar rol de usuario
- `getEntrenadores(filtros?)` - Obtener lista de entrenadores
- `aprobarEntrenador(id)` - Aprobar entrenador
- `getDeportes()` - Obtener lista de deportes
- `crearDeporte(deporte)` - Crear nuevo deporte
- `getReservas(filtros?)` - Obtener todas las reservas
- `getPagos(filtros?)` - Obtener todos los pagos
- `generarReporte(tipo, filtros?)` - Generar reporte (PDF/Excel)

### 3. **Interceptors Configurados** ✅

#### **JwtInterceptor** (`src/app/@core/interceptors/jwt.interceptor.ts`)
- Agrega automáticamente el token JWT a todas las peticiones HTTP
- Lee el token desde `localStorage` con la clave `fit_token`

#### **ErrorInterceptor** (`src/app/@core/interceptors/error.interceptor.ts`)
- Maneja errores HTTP globalmente
- Muestra notificaciones de error con Nebular Toastr
- Redirige a login si hay error 401 (no autorizado)
- Maneja errores 403, 404, 500, etc.

### 4. **Proxy Configuration** ✅
- `proxy.conf.json` - Configuración del proxy para desarrollo
- Configurado para redirigir `/api` a `http://localhost:3000`
- Integrado en `angular.json` para uso automático

### 5. **Componentes Actualizados** ✅
- `ClienteDashboardComponent` - Ahora usa `ClienteService` para cargar datos
- Mantiene datos mock como fallback si el backend no está disponible

---

## 🚀 Cómo Usar

### Opción 1: Con Backend Local (Recomendado)

1. **Inicia tu backend** en `http://localhost:3000`
2. **Inicia el frontend** con:
   ```powershell
   npm start
   ```
   El proxy se configurará automáticamente.

### Opción 2: Con Backend Remoto

1. **Actualiza `environment.ts`**:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://tu-backend.com/api/v1',
   };
   ```

2. **Inicia el frontend**:
   ```powershell
   npm start
   ```

### Opción 3: Sin Backend (Modo Mock)

Si no tienes backend aún, los componentes usarán datos mock automáticamente cuando detecten errores de conexión.

---

## 📡 Estructura de Endpoints Esperados

### Autenticación
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
```

### Cliente
```
GET    /api/v1/cliente/dashboard
GET    /api/v1/cliente/reservas
POST   /api/v1/cliente/reservas
DELETE /api/v1/cliente/reservas/:id
GET    /api/v1/cliente/pagos
GET    /api/v1/cliente/resenas
POST   /api/v1/cliente/resenas
PUT    /api/v1/cliente/resenas/:id
DELETE /api/v1/cliente/resenas/:id
GET    /api/v1/cliente/perfil
PUT    /api/v1/cliente/perfil
```

### Entrenador
```
GET    /api/v1/entrenador/dashboard
GET    /api/v1/entrenador/clases
POST   /api/v1/entrenador/clases
PUT    /api/v1/entrenador/clases/:id
DELETE /api/v1/entrenador/clases/:id
GET    /api/v1/entrenador/disponibilidad
PUT    /api/v1/entrenador/disponibilidad
GET    /api/v1/entrenador/clientes
GET    /api/v1/entrenador/ingresos
GET    /api/v1/entrenador/reservas
PUT    /api/v1/entrenador/reservas/:id/confirmar
PUT    /api/v1/entrenador/reservas/:id/cancelar
GET    /api/v1/entrenador/perfil
PUT    /api/v1/entrenador/perfil
```

### Admin
```
GET    /api/v1/admin/stats
GET    /api/v1/admin/dashboard
GET    /api/v1/admin/usuarios
PUT    /api/v1/admin/usuarios/:id
PUT    /api/v1/admin/usuarios/:id/rol
PUT    /api/v1/admin/usuarios/:id/activo
GET    /api/v1/admin/entrenadores
PUT    /api/v1/admin/entrenadores/:id/aprobar
PUT    /api/v1/admin/entrenadores/:id/rechazar
GET    /api/v1/admin/deportes
POST   /api/v1/admin/deportes
PUT    /api/v1/admin/deportes/:id
DELETE /api/v1/admin/deportes/:id
PUT    /api/v1/admin/deportes/:id/activo
GET    /api/v1/admin/reservas
PUT    /api/v1/admin/reservas/:id/cancelar
GET    /api/v1/admin/clases
PUT    /api/v1/admin/clases/:id/aprobar
PUT    /api/v1/admin/clases/:id/rechazar
GET    /api/v1/admin/pagos
GET    /api/v1/admin/reportes/:tipo
```

### General
```
GET    /api/v1/entrenadores
GET    /api/v1/entrenadores/:id
```

---

## 🔐 Autenticación

El sistema espera que el backend devuelva un token JWT en el formato:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

El token debe incluir en el payload:
```json
{
  "sub": "user-id",
  "role": "CLIENTE|ENTRENADOR|ADMIN",
  "exp": 1234567890
}
```

El token se guarda automáticamente en `localStorage` con la clave `fit_token` y se envía en todas las peticiones mediante el `JwtInterceptor`.

---

## 🛠️ Próximos Pasos

### Para Completar la Integración:

1. **Actualizar todos los componentes** para usar los servicios HTTP en lugar de datos mock
2. **Implementar Guards de Autenticación** para proteger rutas
3. **Agregar Loading States** en los componentes mientras cargan datos
4. **Implementar Manejo de Errores** más específico por componente
5. **Agregar Validación de Formularios** con feedback del backend

### Ejemplo de Actualización de Componente:

```typescript
import { ClienteService } from '../../../@core/services/cliente.service';

export class MiComponente implements OnInit {
  loading = false;
  datos: any[] = [];

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.clienteService.misReservas().pipe(
      catchError(error => {
        console.error('Error:', error);
        // Usar datos mock como fallback
        return of([]);
      }),
      finalize(() => this.loading = false)
    ).subscribe(reservas => {
      this.datos = reservas;
    });
  }
}
```

---

## 📝 Notas Importantes

1. **El proxy solo funciona en desarrollo**. En producción, actualiza `environment.prod.ts` con la URL real de tu API.

2. **Los interceptors están registrados globalmente** en `app.module.ts`, por lo que todas las peticiones HTTP pasan por ellos.

3. **Los servicios usan `ApiService`** que construye las URLs automáticamente, así que solo necesitas pasar el path relativo (ej: `/cliente/reservas` en lugar de `/api/v1/cliente/reservas`).

4. **Los componentes mantienen datos mock como fallback** para que puedas desarrollar sin backend.

5. **El ErrorInterceptor muestra notificaciones automáticamente**, pero puedes personalizarlas según tus necesidades.

---

## ✅ Estado Actual

- ✅ Environment variables configuradas
- ✅ Servicios HTTP completos
- ✅ Interceptors configurados
- ✅ Proxy configurado
- ✅ Ejemplo de componente actualizado (ClienteDashboard)
- ⏳ Pendiente: Actualizar resto de componentes
- ⏳ Pendiente: Implementar Guards de autenticación
- ⏳ Pendiente: Agregar loading states globales

---

**¡El proyecto está listo para conectarse a un backend real!** 🎉

