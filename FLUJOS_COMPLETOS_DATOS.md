# 🔄 FLUJOS COMPLETOS DE DATOS: DE FIRESTORE A UI

## FLUJO 1: BUSCAR ENTRENADORES (DEPORTES DINÁMICOS)

### 1️⃣ ESTRUCTURA EN FIRESTORE

```
┌─ firestore
│
└─ deportes/                          ← Collection
   ├─ deporte_001                     ← Document
   │  ├── nombre: "Fútbol"
   │  ├── icono: "fa-futbol"
   │  ├── activo: true
   │  └── orden: 1
   │
   ├─ deporte_002
   │  ├── nombre: "Yoga"
   │  ├── icono: "fa-yoga"
   │  ├── activo: true
   │  └── orden: 2
   │
   ├─ deporte_003
   │  ├── nombre: "Boxeo"
   │  ├── icono: "fa-boxing"
   │  ├── activo: false          ← Inactivo, no mostrará
   │  └── orden: 3
   │
   └─ deporte_004
      ├── nombre: "Natación"
      ├── icono: "fa-swimming"
      ├── activo: true
      └── orden: 4
```

### 2️⃣ SERVICIO - ClienteFirebaseService

```typescript
// ✅ MÉTODO YA EXISTE EN EL SERVICIO
getDeportes(): Observable<Deporte[]> {
  return this.firestore.collection<Deporte>('deportes', ref =>
    ref.where('activo', '==', true)      // ← Solo los activos
  ).valueChanges({ idField: 'id' });
}

getDeportesNombres(): Observable<string[]> {
  return this.getDeportes().pipe(
    map(deportes => deportes.map(d => d.nombre))
  );
}
```

### 3️⃣ COMPONENTE - BuscarEntrenadoresComponent

```
┌─────────────────────────────────────────────┐
│ CONSTRUCTOR                                 │
│                                             │
│ constructor(                                │
│   private clienteFirebase: ClienteFirebase  │
│ ) { }                                       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ NG_ON_INIT                                  │
│                                             │
│ ngOnInit(): void {                          │
│   // ✅ CARGAR DEPORTES DINÁMICAMENTE       │
│   this.clienteFirebase                      │
│     .getDeportesNombres()                   │
│     .subscribe(deportes => {                │
│       this.deportesDisponibles = deportes;  │
│       console.log('Deportes cargados:', deportes);
│     });                                     │
│   this.cargarEntrenadores();                │
│ }                                           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ COMPONENT PROPERTY                          │
│                                             │
│ deportesDisponibles: string[] = [];         │
│ // Ahora es un array VACÍO que se llena    │
│ // dinámicamente desde Firebase              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ TEMPLATE (HTML)                             │
│                                             │
│ <nb-select formControlName="deporte">       │
│   <nb-option value="">Todos</nb-option>     │
│   @for (deporte of deportesDisponibles) {   │
│     <nb-option [value]="deporte">           │
│       {{ deporte }}                         │
│     </nb-option>                           │
│   }                                         │
│ </nb-select>                                │
│                                             │
│ ✅ Ahora muestra SOLO los deportes activos  │
│ ✅ Si agregas un deporte en Firestore,     │
│    aparece automáticamente en el select!    │
└─────────────────────────────────────────────┘
```

### 4️⃣ FLUJO COMPLETO CON TIEMPO

```
TIEMPO 0:00 - Usuario abre "Buscar Entrenadores"
┌────────────────┐
│ ngOnInit()     │
└────────────────┘
        ↓
TIEMPO 0:01 - Llamada a getDeportesNombres()
┌────────────────────────────────────────┐
│ QueryFirestore:                        │
│ SELECT * FROM deportes WHERE activo=1  │
└────────────────────────────────────────┘
        ↓
TIEMPO 0:05 - Respuesta de Firestore
┌────────────────────────────────────────┐
│ Response: ['Fútbol', 'Yoga', 'Natación']│
│ (deporte_003 'Boxeo' NO se incluye   │
│  porque activo=false)                  │
└────────────────────────────────────────┘
        ↓
TIEMPO 0:06 - Update componente
┌────────────────────────────────────────┐
│ this.deportesDisponibles =              │
│ ['Fútbol', 'Yoga', 'Natación']          │
└────────────────────────────────────────┘
        ↓
TIEMPO 0:07 - UI renderiza
┌────────────────────────────────────────┐
│ <select>                               │
│   <option>Todos</option>               │
│   <option>Fútbol</option>              │
│   <option>Yoga</option>                │
│   <option>Natación</option>            │
│ </select>                              │
│                                        │
│ ✅ Usuario ve los deportes REALES      │
│ ✅ En tiempo real desde Firestore     │
└────────────────────────────────────────┘
```

---

## FLUJO 2: LOGROS DESBLOQUEADOS (CÁLCULO DINÁMICO)

### 1️⃣ ESTRUCTURA EN FIRESTORE

```
┌─ firestore
│
└─ reservas/                          ← Collection
   ├─ reserva_001
   │  ├── clienteId: "user_123"       ← El usuario actual
   │  ├── estado: "COMPLETADA"        ← ✅ Completada
   │  ├── fecha: "2026-03-10"
   │  ├── deporte: "Fútbol"
   │  └── duracion: 60
   │
   ├─ reserva_002
   │  ├── clienteId: "user_123"
   │  ├── estado: "COMPLETADA"        ← ✅ Completada
   │  ├── fecha: "2026-03-11"
   │  ├── deporte: "Yoga"
   │  └── duracion: 60
   │
   ├─ reserva_003
   │  ├── clienteId: "user_123"
   │  ├── estado: "COMPLETADA"        ← ✅ Completada
   │  ├── fecha: "2026-03-12"
   │  ├── deporte: "Boxeo"            ← DEPORTE #3
   │  └── duracion: 60
   │
   ├─ reserva_004
   │  ├── clienteId: "user_123"
   │  ├── estado: "PENDIENTE"         ← ❌ No completada
   │  └── ...
   │
   └─ ...más reservas
```

### 2️⃣ LÓGICA DE CÁLCULO

```typescript
getMisReservas() → [reserva_001, reserva_002, reserva_003, reserva_004, ...]
                    ↓
Filtrar estado = "COMPLETADA"
                    ↓
completadas = [reserva_001, reserva_002, reserva_003]
                    ↓
┌─────────────────────────────────────────────────┐
│ CALCULAR LOGROS                                 │
│                                                 │
│ 1. completadas.length >= 1?                     │
│    ✅ VERDADERO → Desbloquear "Primera Sesión" │
│                                                 │
│ 2. completadas.length >= 5?                     │
│    ❌ FALSO (solo 3 completadas)               │
│                                                 │
│ 3. deportes únicos >= 3?                        │
│    ['Fútbol', 'Yoga', 'Boxeo'] = 3 deportes    │
│    ✅ VERDADERO → Desbloquear "Explorador"     │
│                                                 │
│ 4. completadas.length >= 10?                    │
│    ❌ FALSO (solo 3 completadas)               │
└─────────────────────────────────────────────────┘
                    ↓
Retornar: [
  { nombre: 'Primera Sesión', tipo: 'bronce', icono: 'award' },
  { nombre: 'Explorador', tipo: 'oro', icono: 'trophy' }
]
```

### 3️⃣ CÓDIGO DETALLADO A IMPLEMENTAR

```typescript
// EN: ClienteFirebaseService

getLogrosDesbloqueados(): Observable<any[]> {
  return this.getMisReservas().pipe(
    map(reservas => {
      const logros: any[] = [];
      
      // Filtrar solo las completadas
      const completadas = reservas.filter(r => r.estado === 'COMPLETADA');
      
      console.log(`📊 Total sesiones completadas: ${completadas.length}`);

      // LOGRO 1: Primera sesión completada
      if (completadas.length >= 1) {
        logros.push({
          id: 'logro_primera_sesion',
          nombre: 'Primera Sesión',
          tipo: 'bronce',
          icono: 'award',
          descripcion: 'Completaste tu primera sesión de entrenamiento',
          fechaDesbloqueado: completadas[0].fecha
        });
        console.log('✅ DESBLOQUEADO: Primera Sesión');
      }

      // LOGRO 2: Racha de disciplina (5 sesiones)
      if (completadas.length >= 5) {
        logros.push({
          id: 'logro_racha_5',
          nombre: 'Racha de Disciplina',
          tipo: 'plata',
          icono: 'fire',
          descripcion: 'Completaste 5 sesiones de entrenamiento',
          progreso: {
            actual: completadas.length,
            requerido: 5
          }
        });
        console.log('✅ DESBLOQUEADO: Racha de Disciplina');
      }

      // LOGRO 3: Explorador (3+ deportes distintos)
      const deportesUnicos = new Set(
        completadas
          .map((r: any) => r.deporte || r.entrenadorId) // Fallback a entrenador si no hay deporte
          .filter(Boolean)
      );

      if (deportesUnicos.size >= 3) {
        logros.push({
          id: 'logro_explorador',
          nombre: 'Explorador',
          tipo: 'oro',
          icono: 'globe',
          descripcion: `Entrenaste en ${deportesUnicos.size} deportes diferentes`,
          deportes: Array.from(deportesUnicos),
          progreso: {
            actual: deportesUnicos.size,
            requerido: 3
          }
        });
        console.log(`✅ DESBLOQUEADO: Explorador (${deportesUnicos.size} deportes)`);
      }

      // LOGRO 4: Campeón (10+ sesiones)
      if (completadas.length >= 10) {
        logros.push({
          id: 'logro_campeon',
          nombre: 'Campeón',
          tipo: 'platino',
          icono: 'star',
          descripcion: 'Completaste 10+ sesiones de entrenamiento',
          progreso: {
            actual: completadas.length,
            requerido: 10
          }
        });
        console.log('✅ DESBLOQUEADO: Campeón');
      }

      // LOGRO 5: Madrugador (sesión antes de 7am)
      const madrugadas = completadas.filter(r => {
        const hora = new Date(r.fecha).getHours();
        return hora < 7;
      });
      if (madrugadas.length >= 1) {
        logros.push({
          id: 'logro_madrugador',
          nombre: 'Madrugador',
          tipo: 'plata',
          icono: 'moon',
          descripcion: 'Completaste una sesión antes de las 7am',
          progreso: {
            actual: madrugadas.length,
            requerido: 1
          }
        });
        console.log('✅ DESBLOQUEADO: Madrugador');
      }

      console.log(`🏆 Total logros desbloqueados: ${logros.length}`);
      return logros;
    }),
    catchError(err => {
      console.error('❌ Error calculando logros:', err);
      return of([]);
    })
  );
}
```

### 4️⃣ ACTUALIZAR COMPONENTE

```typescript
// EN: ClienteDashboardComponent

// ❌ ELIMINAR:
logrosRecientes: any[] = [
  { nombre: 'Primera Sesión', tipo: 'bronce', icono: 'award' },
  { nombre: 'Racha de 7 días', tipo: 'plata', icono: 'fire' },
  { nombre: 'Explorador', tipo: 'oro', icono: 'trophy' }
];

// ✅ AGREGAR:
logrosRecientes: any[] = [];

cargarDatosFirebase(): void {
  // ... código existente ...

  // Cargar logros desbloqueados en tiempo real
  const logrosSub = this.clienteFirebase
    .getLogrosDesbloqueados()
    .subscribe(logros => {
      console.log('Logros del usuario:', logros);
      this.logrosRecientes = logros;
      this.logrosDesbloqueados = logros.length;
    });
  
  this.dataSubscriptions.push(logrosSub);
}
```

### 5️⃣ FLUJO COMPLETO CON SINCRONIZACIÓN

```
USUARIO COMPLETA UNA SESIÓN
        ↓
FIREBASE ACTUALIZA reserva.estado = "COMPLETADA"
        ↓
LISTENER EN CLIENTE (getLogrosDesbloqueados está suscrito a getMisReservas)
        ↓
SE EJECUTA getLogrosDesbloqueados()
        ↓
SE RECALCULAN LOGROS
        ↓
if (completadas.length === 1) → ✅ DESBLOQUEAR "Primera Sesión"
if (completadas.length === 3 && deportes.unique === 3) → ✅ DESBLOQUEAR "Explorador"
        ↓
this.logrosRecientes = [logros actualizados]
        ↓
TEMPLATE SE RENDERIZA CON NUEVOS LOGROS
        ↓
USUARIO VE "🏆 Explorador desbloqueado!" EN TIEMPO REAL
```

---

## FLUJO 3: ENTRENADORES CON FILTROS

### 1️⃣ ESTRUCTURA EN FIRESTORE

```
┌─ firestore
│
└─ entrenadores/
   ├─ ent_001
   │  ├── nombre: "Carlos"
   │  ├── apellidoPaterno: "García"
   │  ├── deportes: ["Fútbol", "Boxeo"]
   │  ├── precio: 300
   │  ├── modalidades: ["presencial", "online"]
   │  ├── ubicacion: { ciudad: "CDMX", direccion: "Av. Principal 123" }
   │  ├── calificacionPromedio: 4.8
   │  ├── verificado: true
   │  ├── activo: true
   │  └── disponibilidad: {
   │      lunes: [{ inicio: "09:00", fin: "12:00" }],
   │      miercoles: [{ inicio: "14:00", fin: "17:00" }]
   │  }
   │
   ├─ ent_002
   │  ├── nombre: "María"
   │  ├── deportes: ["Yoga", "Pilates"]
   │  ├── precio: 250
   │  ├── modalidades: ["online"]
   │  ├── ubicacion: { ciudad: "CDMX" }
   │  ├── verificado: true
   │  ├── activo: true
   │  └── ...
   │
   └─ ... más entrenadores (algunos con verificado: false o activo: false)
```

### 2️⃣ PROCESO DE BÚSQUEDA

```
USUARIO ABRE "BUSCAR ENTRENADORES"
        ↓
getEntrenadores()
        ↓
FIRESTORE QUERY:
  SELECT * FROM entrenadores 
  WHERE verificado = true 
  AND activo = true
        ↓
RESULTADO: [ent_001, ent_002, ...]
        ↓
COMPONENTE recibe lista
        ↓
RENDERIZA en GRID
        ↓
USUARIO APLICA FILTROS:
  - Deporte: "Yoga"
  - Precio máximo: 300
  - Modalidad: "online"
        ↓
buscarEntrenadores({ 
  deporte: "Yoga",
  precioMax: 300, 
  modalidad: "online" 
})
        ↓
FIRESTORE QUERY #2:
  SELECT * FROM entrenadores
  WHERE verificado = true
  AND activo = true
  AND deportes CONTAINS "Yoga"
  (+ filtros cliente para precio y modalidad)
        ↓
RESULTADO: [ent_002]  ← Solo María
        ↓
COMPONENTE actualiza grid
        ↓
USUARIO VE RESULTADO FILTRADO EN TIEMPO REAL
```

---

## RESUMEN: FLUJOS DE DATOS

| FLUJO | DE FIRESTORE | SERVICIO | MÉTODO | COMPONENTE | RESULTADO |
|-------|-------------|----------|--------|-----------|-----------|
| 1 | deportes | ClienteFirebase | getDeportesNombres() | BuscarEntrenadores | Select dinámico |
| 2 | reservas | ClienteFirebase | getLogrosDesbloqueados() | ClienteDashboard | Logros en tiempo real |
| 3 | entrenadores | ClienteFirebase | getEntrenadores() | BuscarEntrenadores | Grid filtrado |
| 4 | reviews | ClienteFirebase | getReviewsEntrenador() | DetalleEntrenador | Calificaciones reales |

**IMPORTANTE**: Todos estos flujos ya están parcialmente implementados en los servicios.
Solo falta actualizar los componentes para USAR estos métodos en lugar de datos hardcodeados.
