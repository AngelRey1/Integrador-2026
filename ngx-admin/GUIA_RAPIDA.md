# 🚀 Guía Rápida de Uso - Sportconnecta Frontend

## 📋 Índice Rápido
1. [Iniciar Proyecto](#iniciar-proyecto)
2. [Navegación por Módulos](#navegación-por-módulos)
3. [Componentes Destacados](#componentes-destacados)
4. [Personalización](#personalización)
5. [Troubleshooting](#troubleshooting)

---

## 🏁 Iniciar Proyecto

### 1. Instalación (Primera vez)
```powershell
cd c:\Users\plant\Practica4B\IntegradorSport
npm install --legacy-peer-deps
```
⏱️ **Tiempo**: ~5 minutos

### 2. Ejecutar Desarrollo
```powershell
npm start
```
📍 **URL**: http://localhost:4200  
⏱️ **Tiempo de arranque**: ~20 segundos

### 3. Compilar Producción
```powershell
npm run build
```
📦 **Salida**: `dist/` (10 MB initial + 32 MB lazy)  
⏱️ **Tiempo de build**: ~42 segundos

---

## 🗺️ Navegación por Módulos

### Acceso Directo a Componentes

#### **MÓDULO CLIENTE** 🏃‍♂️
```
http://localhost:4200/pages/cliente/dashboard
http://localhost:4200/pages/cliente/buscar
http://localhost:4200/pages/cliente/agendar
http://localhost:4200/pages/cliente/mis-reservas
http://localhost:4200/pages/cliente/mis-pagos
http://localhost:4200/pages/cliente/mis-resenas
http://localhost:4200/pages/cliente/perfil
```

**✨ Funcionalidades principales**:
- **Dashboard**: Vista general con búsqueda rápida de entrenadores
- **Buscar**: Filtros avanzados (precio, deporte, rating, ubicación)
- **Agendar**: Stepper de 4 pasos para reservar sesión
- **Mis Reservas**: Tabs (Próximas/Completadas/Canceladas)
- **Mis Pagos**: Dashboard financiero + historial transacciones
- **Mis Reseñas**: CRUD de reseñas con sistema de estrellas
- **Perfil**: 5 tabs extensos (Info, Preferencias, Notificaciones, Privacidad, Seguridad)

#### **MÓDULO ENTRENADOR** 🏋️‍♂️
```
http://localhost:4200/pages/entrenador/dashboard
http://localhost:4200/pages/entrenador/gestion-clases
http://localhost:4200/pages/entrenador/calendario
http://localhost:4200/pages/entrenador/mis-clientes
http://localhost:4200/pages/entrenador/mis-ingresos
http://localhost:4200/pages/entrenador/perfil
```

**✨ Funcionalidades principales**:
- **Dashboard**: 5 métricas + gráficas + timeline sesiones
- **Gestión Clases**: CRUD completo con formulario 11 campos
- **Calendario**: nb-calendar + grid de 17 horarios (6:00-22:00)
- **Mis Clientes**: Búsqueda + cards con stats de asistencia
- **Mis Ingresos**: 3 stat cards + gráfica evolución mensual
- **Perfil**: Edición con especialidades y certificaciones

#### **MÓDULO ADMIN** 👨‍💼
```
http://localhost:4200/pages/admin/dashboard
http://localhost:4200/pages/admin/usuarios
http://localhost:4200/pages/admin/entrenadores
http://localhost:4200/pages/admin/deportes
http://localhost:4200/pages/admin/reservas
http://localhost:4200/pages/admin/clases
http://localhost:4200/pages/admin/pagos
http://localhost:4200/pages/admin/reportes
```

**✨ Funcionalidades principales**:
- **Dashboard**: 4 métricas plataforma + gráficas actividad + aprobaciones pendientes
- **Usuarios**: Filtros (rol, estado) + toggle activo/inactivo + cambiar rol
- **Entrenadores**: Workflow aprobación + badges especialidades
- **Deportes**: CRUD con categorías + toggle activo
- **Reservas**: Tabla completa + botón cancelar
- **Clases**: Moderación con aprobar/rechazar
- **Pagos**: 3 stats + tabla historial con comisiones
- **Reportes**: 4 KPIs + 3 gráficas + botones exportar

---

## ⭐ Componentes Destacados

### 1. **Cliente Dashboard** (Más completo)
📁 `src/app/pages/cliente/cliente-dashboard/`

**Características**:
- 3 stat cards clickables (sesiones, entrenadores, gastos)
- Búsqueda rápida integrada (3 campos)
- Grid de 3 entrenadores destacados con avatares
- Próximas reservas con badges de estado
- Calendario semanal visual
- 2 gráficas de actividad mensual

**Prueba rápida**:
```typescript
// Modificar mock data en el .ts:
estadisticasPersonales = {
  proximasSesiones: 5,      // Cambia el número
  entrenadoresFavoritos: 8, // Prueba con otros valores
  gastosMensuales: 999      // Actualiza el gasto
};
```

### 2. **Perfil Cliente** (Más extenso - 1,700 líneas)
📁 `src/app/pages/cliente/perfil-cliente/`

**5 Tabs implementados**:
1. **Información Personal**: 10 campos con validación
2. **Preferencias Deportivas**: Radio groups, chips, selects
3. **Notificaciones**: 5 toggles (email, SMS, push)
4. **Privacidad**: Visibilidad perfil, historial público
5. **Seguridad**: Cambio de contraseña con confirmación

**Prueba rápida**:
- Click en tab "Preferencias Deportivas"
- Modifica nivel de experiencia (radio buttons)
- Agrega deportes favoritos (chips)
- Guarda cambios → Toast de confirmación

### 3. **Gestión Clases** (CRUD Completo)
📁 `src/app/pages/entrenador/gestion-clases/`

**CRUD completo**:
- ✅ **Create**: Formulario con 11 campos validados
- ✅ **Read**: Grid de 3 columnas con 3 clases mock
- ✅ **Update**: Botón editar → pre-rellena form
- ✅ **Delete**: Modal de confirmación (NbDialogService)

**Prueba rápida**:
1. Click "Nueva Clase"
2. Rellena nombre: "Zumba Fitness"
3. Selecciona deporte: "Yoga" (select)
4. Escribe descripción (max 300 chars con contador)
5. Modalidad: "Online"
6. Guarda → Aparece en el grid

### 4. **Admin Dashboard** (Vista panorámica)
📁 `src/app/pages/admin/admin-dashboard/`

**Panel de control completo**:
- 4 métricas de plataforma (clickables → navegan)
- Gráficas duales (Usuarios + Sesiones)
- Panel de aprobaciones pendientes (3 items)
- Botones inline Aprobar/Rechazar
- 4 acciones rápidas

**Prueba rápida**:
- Click en métrica "Usuarios Totales" → navega a `/admin/usuarios`
- Click "Aprobar" en una solicitud pendiente → cambia a verde
- Click "Ver Reportes" → navega a `/admin/reportes`

### 5. **Reportes** (Analíticas)
📁 `src/app/pages/admin/reportes/`

**Dashboard analítico**:
- 4 KPIs grandes (+12% crecimiento, 87% retención, 4.6★ satisfacción)
- 3 gráficas de barras con gradientes (Usuarios, Sesiones, Ingresos)
- Botones exportar PDF/Excel (console.log mock)
- Datos de 4 meses (Enero-Abril 2024)

**Prueba rápida**:
```typescript
// Agregar más meses en el .ts:
estadisticas.push(
  { periodo: 'Mayo', usuarios: 3100, sesiones: 1350, ingresos: 22500 }
);
```

---

## 🎨 Personalización

### Cambiar Colores de la Plataforma

#### 1. **Colores Principales** (SCSS)
📁 Cada `.component.scss`

```scss
// Cambiar color primario (azul)
.metric-icon {
  background: #3366ff;  // Cambiar por: #8b5cf6 (morado), #f43f5e (rosa)
}

// Cambiar gradientes de gráficas
.bar-fill.usuarios {
  background: linear-gradient(180deg, #3366ff 0%, #5a8dff 100%);
  // Cambiar por: linear-gradient(180deg, #8b5cf6 0%, #a78bfa 100%)
}
```

#### 2. **Status Badges**
```typescript
// En cada .component.ts
getEstadoStatus(estado: string): string {
  switch (estado) {
    case 'completada': return 'success'; // Verde
    case 'pendiente': return 'warning';  // Amarillo
    case 'cancelada': return 'danger';   // Rojo
    default: return 'primary';           // Azul (añade este)
  }
}
```

### Cambiar Mock Data

#### **Usuarios**
```typescript
// En cualquier componente con usuarios
usuarios: Usuario[] = [
  {
    id: 1,
    nombre: 'TU NOMBRE AQUÍ',                    // Personaliza
    email: 'tuemail@example.com',                // Tu email
    avatar: 'https://i.pravatar.cc/150?img=25', // Cambiar número 1-50
    rol: 'cliente'
  }
];
```

#### **Métricas**
```typescript
// En dashboards
metricas = {
  usuariosTotales: 5000,      // Cambia los números
  entrenadores: 250,
  ingresosMes: 35000,
  sesiones: 2500
};
```

#### **Entrenadores Destacados**
```typescript
entrenadoresDestacados = [
  {
    nombre: 'NUEVO ENTRENADOR',
    especialidad: 'Kickboxing',               // Nueva especialidad
    rating: 5.0,
    precioDesde: 50,                          // Nuevo precio
    avatar: 'https://i.pravatar.cc/150?img=30'
  }
];
```

### Agregar Nuevo Deporte

#### Paso 1: Admin → Gestión Deportes
```typescript
// En gestion-deportes.component.ts
deportes.push({
  id: 5,
  nombre: 'Kickboxing',                       // Nuevo deporte
  categoria: 'Alta Intensidad',
  descripcion: 'Arte marcial de contacto',
  activo: true,
  icono: 'flash-outline'                      // Icono Nebular
});
```

#### Paso 2: Actualizar Select en otros componentes
```typescript
// En buscar-entrenadores.component.ts, agendar-sesion.component.ts, etc.
deportesDisponibles = [
  'Yoga', 'Pilates', 'CrossFit', 'Running', 
  'Kickboxing' // <-- Agrega aquí
];
```

### Cambiar Idioma a Inglés

**Buscar y reemplazar** en todos los archivos `.html`:

| Español | Inglés |
|---------|--------|
| `Próximas Sesiones` | `Upcoming Sessions` |
| `Entrenadores Favoritos` | `Favorite Trainers` |
| `Gastos Mensuales` | `Monthly Expenses` |
| `Buscar Entrenadores` | `Search Trainers` |
| `Agendar Sesión` | `Schedule Session` |
| `Mis Reservas` | `My Bookings` |
| `Mis Pagos` | `My Payments` |
| `Mis Reseñas` | `My Reviews` |
| `Perfil` | `Profile` |
| `Guardar` | `Save` |
| `Cancelar` | `Cancel` |
| `Editar` | `Edit` |
| `Eliminar` | `Delete` |

**Herramienta**: VS Code → Ctrl+Shift+H (Replace in Files)

---

## 🐛 Troubleshooting

### Problema 1: "Cannot find module..."
**Síntoma**: Error al compilar con imports faltantes

**Solución**:
```powershell
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Problema 2: Puerto 4200 ocupado
**Síntoma**: "Port 4200 is already in use"

**Solución**:
```powershell
# Opción 1: Cambiar puerto
ng serve --port 4300

# Opción 2: Matar proceso en Windows
netstat -ano | findstr :4200
taskkill /PID <PID_NUMBER> /F
```

### Problema 3: Warnings de Signals (ngModel)
**Síntoma**: `ɵunwrapWritableSignal` en consola

**Solución**: ✅ **IGNORAR** - Son warnings internos de Angular 15, no afectan funcionalidad. Se resuelven en Angular 16+.

### Problema 4: Componente no se ve en ruta
**Síntoma**: Página en blanco al navegar

**Checklist**:
1. ✅ Componente declarado en `*.module.ts`
2. ✅ Ruta definida en `*-routing.module.ts`
3. ✅ Módulo importado en `app-routing.module.ts`

**Verificar**:
```typescript
// En cliente.module.ts
declarations: [
  ClienteDashboardComponent // <-- Debe estar aquí
]

// En cliente-routing.module.ts
{ path: 'dashboard', component: ClienteDashboardComponent }
```

### Problema 5: Estilos no se aplican
**Síntoma**: Componente sin colores o layouts rotos

**Solución**:
1. Verificar import de SCSS en `angular.json`:
```json
"styles": [
  "src/styles.scss",
  "node_modules/@nebular/theme/styles/prebuilt/default.css"
]
```

2. Limpiar caché y recompilar:
```powershell
ng build --delete-output-path
ng serve
```

### Problema 6: Gráficas no se visualizan
**Síntoma**: Chart-bars sin altura o invisibles

**Solución**: Verificar cálculo de alturas en `.ts`:
```typescript
getBarHeight(valor: number, max: number): number {
  return (valor / max) * 100;  // Debe retornar 0-100
}

// En HTML debe usarse con [style.height.%]
<div [style.height.%]="getBarHeight(valor, maxValor)"></div>
```

### Problema 7: Formularios no validan
**Síntoma**: Botón submit siempre deshabilitado

**Checklist**:
1. ✅ FormGroup creado con FormBuilder
2. ✅ Validators agregados a campos
3. ✅ `[disabled]="!form.valid"` en botón
4. ✅ ReactiveFormsModule importado

**Ejemplo**:
```typescript
// En *.module.ts
import { ReactiveFormsModule } from '@angular/forms';
imports: [ReactiveFormsModule]

// En *.component.ts
constructor(private fb: FormBuilder) {}
form = this.fb.group({
  nombre: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]]
});
```

---

## 🔥 Tips de Desarrollo

### 1. **Hot Reload Rápido**
```powershell
# Usa ng serve con opciones optimizadas
ng serve --hmr --configuration development
```

### 2. **Inspeccionar Componentes**
- F12 → Elements → Buscar `<ngx-*>`
- Ver clases aplicadas en Computed
- Modificar estilos en tiempo real

### 3. **Ver Estructura de Datos**
```typescript
// En cualquier .ts, agrega console.log
ngOnInit() {
  console.log('Datos cargados:', this.usuarios);
  console.log('Filtros aplicados:', this.filtros);
}
```

### 4. **Snippets Útiles**

**Crear nuevo componente**:
```typescript
interface MiDato {
  id: number;
  nombre: string;
}

misDatos: MiDato[] = [
  { id: 1, nombre: 'Ejemplo 1' },
  { id: 2, nombre: 'Ejemplo 2' }
];

// En HTML
<div *ngFor="let dato of misDatos">
  {{ dato.nombre }}
</div>
```

**Método de filtrado**:
```typescript
filtro = '';
get datosFiltrados(): MiDato[] {
  return this.misDatos.filter(d => 
    d.nombre.toLowerCase().includes(this.filtro.toLowerCase())
  );
}
```

### 5. **Atajos de Teclado en VS Code**
- `Ctrl + P`: Abrir archivo rápido
- `Ctrl + Shift + F`: Buscar en todos los archivos
- `Ctrl + D`: Seleccionar siguiente coincidencia
- `Alt + Shift + F`: Auto-formatear código
- `Ctrl + /`: Comentar/descomentar línea

---

## 📚 Recursos Adicionales

### Documentación Oficial
- **Angular**: https://angular.io/docs
- **Nebular**: https://akveo.github.io/nebular/docs/
- **TypeScript**: https://www.typescriptlang.org/docs/

### Iconos Nebular (Eva Icons)
- **Galería**: https://akveo.github.io/eva-icons/
- **Uso**: `<nb-icon icon="NOMBRE-outline"></nb-icon>`
- **Ejemplos**: `star-outline`, `heart-outline`, `person-outline`

### Playground Nebular
- **URL**: https://akveo.github.io/nebular/
- Prueba componentes en vivo
- Copia código de ejemplos

---

## ✅ Checklist Final

### Antes de Integrar Backend
- [ ] Todos los módulos compilan sin errores
- [ ] Rutas funcionan correctamente
- [ ] Mock data cargado en todos los componentes
- [ ] Formularios validan correctamente
- [ ] Estilos responsive en móvil/tablet/desktop
- [ ] Navegación entre páginas fluida
- [ ] Toasts/modals funcionan

### Preparación para Producción
- [ ] Crear servicios HTTP (auth, usuarios, reservas, etc.)
- [ ] Implementar guards de autenticación
- [ ] Agregar interceptors (JWT, errores, loading)
- [ ] Reemplazar mock data con API calls
- [ ] Configurar environment variables (dev/prod)
- [ ] Implementar manejo de errores global
- [ ] Optimizar imports (lazy loading modules)
- [ ] Comprimir assets (imágenes, fonts)

---

## 🎯 Próximos Pasos Sugeridos

### Semana 1-2: Backend API
1. Configurar servidor (Node.js/Express o Spring Boot)
2. Base de datos (PostgreSQL o MongoDB)
3. Endpoints REST para cada módulo
4. Autenticación JWT

### Semana 3-4: Integración Frontend-Backend
1. Crear servicios Angular para cada endpoint
2. Reemplazar mock data con API calls
3. Implementar guards y interceptors
4. Testing de integración

### Semana 5-6: Deploy y Testing
1. Deploy backend (Heroku, AWS, Railway)
2. Deploy frontend (Netlify, Vercel, Firebase)
3. Testing completo (Cypress E2E)
4. Optimización de performance

---

## 🚀 ¡Listo para usar!

El frontend está **100% funcional** y listo para desarrollo. Todos los componentes están implementados con mock data y pueden ser probados navegando directamente a las rutas.

**Para empezar ahora mismo**:
```powershell
npm start
# Abre: http://localhost:4200/pages/cliente/dashboard
```

**¿Preguntas?** Revisa el archivo `FRONTEND_COMPLETO.md` para documentación detallada.

---

**Última actualización**: Noviembre 2024  
**Estado**: ✅ Completado y funcionando
