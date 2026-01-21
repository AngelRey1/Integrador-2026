# 📋 Plan de Adaptación: ngx-admin → SporttConnect

## ✅ Estado Actual

- [x] ngx-admin copiado y funcionando
- [x] Dependencias instaladas (con sass moderno)
- [x] Servidor de desarrollo configurado
- [x] README_FITCONNECT.md creado

## 🎯 Tareas Pendientes

### 1. Adaptar Autenticación (PRIORIDAD ALTA)

**Ubicación**: `src/app/auth/`

#### Modificaciones necesarias:

- [ ] Actualizar `auth.service.ts` para manejar 3 roles:
  - CLIENTE
  - ENTRENADOR
  - ADMIN

- [ ] Crear componente `register.component.ts`:
  ```typescript
  - Selector de rol (radio buttons)
  - Formulario con validaciones
  - POST a /api/v1/auth/register
  - Redirección según rol
  ```

- [ ] Adaptar `login.component.ts`:
  ```typescript
  - POST a /api/v1/auth/login
  - Decodificar JWT para obtener rol
  - Redireccionar:
    - CLIENTE → /cliente/dashboard
    - ENTRENADOR → /entrenador/dashboard
    - ADMIN → /admin/dashboard
  ```

- [ ] Crear `landing-page.component.ts`:
  ```html
  - Hero section
  - Cómo funciona (3 pasos)
  - Entrenadores destacados
  - CTA: "Buscar Entrenador" / "Soy Entrenador"
  ```

### 2. Crear Módulo Cliente (PRIORIDAD ALTA)

**Ubicación**: `src/app/pages/cliente/`

#### Estructura:
```
pages/cliente/
├── cliente.module.ts
├── cliente-routing.module.ts
├── cliente-dashboard/
│   ├── cliente-dashboard.component.ts
│   ├── cliente-dashboard.component.html
│   └── cliente-dashboard.component.scss
├── buscar-entrenadores/
│   ├── buscar-entrenadores.component.ts
│   ├── filtros-sidebar/
│   └── entrenador-card/
├── agendar-sesion/
│   ├── agendar-sesion.component.ts
│   ├── wizard-steps/
│   └── resumen-pago/
├── mis-reservas/
│   ├── mis-reservas.component.ts
│   ├── reserva-card/
│   └── detalle-modal/
├── mis-pagos/
│   └── mis-pagos.component.ts
├── mis-resenas/
│   └── mis-resenas.component.ts
└── perfil/
    └── perfil-cliente.component.ts
```

#### Componentes a crear:

**1. Cliente Dashboard**
```typescript
// Stats cards (4 cards superiores)
- Sesiones completadas
- Próxima sesión
- Reservas pendientes
- Gasto del mes

// Búsqueda rápida
- Input deporte
- Datepicker fecha
- Input precio máximo
- Botón buscar

// Tabla próximas sesiones
- Columnas: Fecha, Entrenador, Deporte, Estado, Acciones

// Grid entrenadores favoritos
- Cards con foto, nombre, especialidad, rating
```

**2. Buscar Entrenadores**
```typescript
// Sidebar de filtros
filters = {
  deporte: string;
  fecha: Date;
  hora: string;
  precio_max: number;
  ubicacion: string;
  modalidad: 'Presencial' | 'Online';
  nivel: string;
  calificacion_min: number;
}

// Grid de resultados
- Entrenador cards (responsive grid)
- Paginación
- Ordenamiento (precio, rating, distancia)
```

**3. Agendar Sesión (Wizard)**
```typescript
// Step 1: Seleccionar fecha y hora
// Step 2: Elegir duración (30, 60, 90, 120, 180 min)
// Step 3: Agregar notas y ubicación
// Step 4: Método de pago
// Step 5: Resumen y confirmación

// Calcular precio en tiempo real
precio_total = entrenador.tarifa_por_hora * (duracion_minutos / 60)
```

**4. Mis Reservas**
```typescript
// Tabs
tabs = ['Pendientes', 'Confirmadas', 'Completadas', 'Canceladas'];

// Tabla con acciones según estado
- Pendientes: Ver, Cancelar, Pagar
- Confirmadas: Ver, Cancelar
- Completadas: Ver, Reseñar
- Canceladas: Ver
```

### 3. Crear Módulo Entrenador (PRIORIDAD MEDIA)

**Ubicación**: `src/app/pages/entrenador/`

#### Componentes principales:

- [ ] `entrenador-dashboard.component.ts`
  - Calendario de clases
  - Stats: Clases hoy, esta semana, ingresos
  - Lista de próximas clases

- [ ] `mis-clases.component.ts`
  - Tabla de clases programadas
  - Filtros por fecha y estado

- [ ] `disponibilidad.component.ts`
  - Calendario interactivo
  - Configurar horarios disponibles
  - Bloquear fechas

- [ ] `mis-clientes.component.ts`
  - Lista de clientes recurrentes
  - Historial de sesiones por cliente

- [ ] `ingresos.component.ts`
  - Gráficos de ingresos
  - Tabla de pagos recibidos

- [ ] `perfil-entrenador.component.ts`
  - Datos profesionales
  - Certificaciones
  - Tarifas y especialidades

### 4. Crear Módulo Admin (PRIORIDAD BAJA)

**Ubicación**: `src/app/pages/admin/`

#### Componentes:

- [ ] `admin-dashboard.component.ts`
  - KPIs de la plataforma
  - Gráficos de crecimiento
  - Actividad reciente

- [ ] `gestion-usuarios.component.ts`
  - Tabla de clientes y entrenadores
  - Filtros y búsqueda
  - Acciones: Ver, Editar, Deshabilitar

- [ ] `gestion-deportes.component.ts`
  - CRUD de deportes/categorías
  - Asignar a entrenadores

- [ ] `reportes.component.ts`
  - Reportes descargables
  - Filtros por fecha

### 5. Servicios Core (PRIORIDAD ALTA)

**Ubicación**: `src/app/@core/services/`

#### Servicios a crear/adaptar:

**auth.service.ts**
```typescript
register(payload: RegisterDTO): Observable<AuthResponse>
login(payload: LoginDTO): Observable<AuthResponse>
logout(): void
getCurrentUser(): Observable<User>
getToken(): string | null
getRole(): 'CLIENTE' | 'ENTRENADOR' | 'ADMIN' | null
```

**cliente.service.ts**
```typescript
buscarEntrenadores(filtros: FiltrosDTO): Observable<Entrenador[]>
agendarSesion(sesion: AgendarSesionDTO): Observable<Reserva>
misReservas(): Observable<Reserva[]>
cancelarReserva(id: number): Observable<void>
misReseñas(): Observable<Reseña[]>
crearReseña(reseña: ReseñaDTO): Observable<Reseña>
misPagos(): Observable<Pago[]>
```

**entrenador.service.ts**
```typescript
misClases(): Observable<Clase[]>
actualizarDisponibilidad(disponibilidad: DisponibilidadDTO): Observable<void>
misClientes(): Observable<Cliente[]>
ingresos(fechaInicio: Date, fechaFin: Date): Observable<Ingreso[]>
actualizarPerfil(perfil: PerfilEntrenadorDTO): Observable<Entrenador>
```

**admin.service.ts**
```typescript
getStats(): Observable<StatsDTO>
getUsuarios(filtros: any): Observable<Usuario[]>
getDeportes(): Observable<Deporte[]>
crearDeporte(deporte: DeporteDTO): Observable<Deporte>
generarReporte(tipo: string, filtros: any): Observable<Blob>
```

### 6. Guards y Routing (PRIORIDAD ALTA)

**Guards a crear**:

```typescript
// auth.guard.ts
canActivate(): boolean {
  return !!this.authService.getToken();
}

// role.guard.ts
canActivate(route: ActivatedRouteSnapshot): boolean {
  const expectedRoles = route.data['roles'];
  const userRole = this.authService.getRole();
  return expectedRoles.includes(userRole);
}

// cliente.guard.ts
canActivate(): boolean {
  return this.authService.getRole() === 'CLIENTE';
}

// entrenador.guard.ts
canActivate(): boolean {
  return this.authService.getRole() === 'ENTRENADOR';
}

// admin.guard.ts
canActivate(): boolean {
  return this.authService.getRole() === 'ADMIN';
}
```

**Rutas principales** (app-routing.module.ts):

```typescript
const routes: Routes = [
  { path: '', component: LandingPageComponent },
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },
  {
    path: 'cliente',
    canActivate: [AuthGuard, ClienteGuard],
    loadChildren: () => import('./pages/cliente/cliente.module').then(m => m.ClienteModule),
  },
  {
    path: 'entrenador',
    canActivate: [AuthGuard, EntrenadorGuard],
    loadChildren: () => import('./pages/entrenador/entrenador.module').then(m => m.EntrenadorModule),
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule),
  },
  { path: '**', redirectTo: '' },
];
```

### 7. Interceptores (PRIORIDAD MEDIA)

**jwt.interceptor.ts**
```typescript
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  const token = this.authService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next.handle(req);
}
```

**error.interceptor.ts**
```typescript
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  return next.handle(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
}
```

## 📅 Cronograma Sugerido

### Semana 1
- Adaptar autenticación
- Crear servicios core
- Implementar guards y routing

### Semana 2
- Cliente Dashboard
- Buscar Entrenadores
- Agendar Sesión

### Semana 3
- Mis Reservas
- Mis Pagos
- Mis Reseñas

### Semana 4
- Perfil Cliente
- Módulo Entrenador (componentes básicos)

### Semana 5-6
- Completar módulo Entrenador
- Módulo Admin básico

## 🔧 Configuración Backend

Configurar proxy para desarrollo en `proxy.conf.json`:

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

Ejecutar con:
```bash
ng serve --proxy-config proxy.conf.json
```

## 📝 Notas Importantes

1. **Reutilizar componentes de ngx-admin**:
   - Cards (`nb-card`)
   - Tables (`nb-table`)
   - Forms (`nb-input`, `nb-select`, `nb-datepicker`)
   - Modals (`NbDialogService`)
   - Toasts (`NbToastrService`)

2. **Mantener estructura de @theme**:
   - Layouts ya están configurados
   - Sidebar y header adaptables

3. **Aprovechar ejemplos existentes**:
   - Dashboard stats de `e-commerce`
   - Tablas de `tables & data`
   - Formularios de `forms`

## 🎨 Recursos de Diseño

- **Nebular Docs**: https://akveo.github.io/nebular/
- **Eva Design System**: https://eva.design/
- **Eva Icons**: https://akveo.github.io/eva-icons/

---

**¿Por dónde empezar?**

Recomiendo comenzar por:
1. Adaptar `auth.service.ts`
2. Crear `register.component.ts` y `landing-page.component.ts`
3. Crear la estructura de `pages/cliente/`
4. Implementar `cliente-dashboard.component.ts`
