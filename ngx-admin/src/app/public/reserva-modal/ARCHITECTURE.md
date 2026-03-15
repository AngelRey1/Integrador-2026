# Arquitectura del Componente Reserva Modal

## Vista General (Estado Actual: 2026-03-15)

El componente `ReservaModalComponent` maneja la lógica completa de reserva de sesiones de entrenamiento. Actualmente soporta 3 modos de reserva con una arquitectura que mezcla código nuevo y legacy.

## Modos de Reserva

### Modo 1: Calendario Manual (DEFAULT)
- **Trigger UI**: `usarPlanSemanal = false` 
- **Flow**: Usuario selecciona múltiples fechas en calendario → selecciona horario para cada día
- **Data Model**: Array `sesionesSeleccionadas: SesionSeleccionada[]` (unificado)
- **Variables Activas**: 
  - `calendarioMes`, `mesActual` ✅ (calendario visual principal)
  - `diaSeleccionandoHorario` (día siendo editado)
  - `horarioTemporal` (horario siendo configurado para día actual)
- **Métodos Principales**:
  - `cambiarMes(delta)` - navegar calendario
  - `abrirSelectorHorario(dia)` - abrir modal de horario
  - `onHoraInicioTemporalChange()` - calcular horas fin disponibles
  - `confirmarSesionMultiple()` - agregar sesión
  - `quitarSesion(index)` - remover sesión

### Modo 2: Plan Recurrente Semanal
- **Trigger UI**: `usarPlanSemanal = true`
- **Flow**: Usuario selecciona días de la semana → elige duración (semanas) → elige horario global
- **Data Model**: Array `sesionesSeleccionadas: SesionSeleccionada[]` (generado automáticamente)
- **Variables Activas**:
  - `planConfig`: objeto con `duracion`, `mismaHora`, `horaGlobalInicio`, `horaGlobalFin`
  - `diasSemanaConfig`: array de 7 días con flags de selección
  - `sesionesGeneradasPlan` (cache de sesiones generadas)
- **Métodos Principales**:
  - `toggleDiaSemanaPlan(dia)` - select/deselect un día de semana
  - `setPlanDuracion(semanas)` - configurar duración
  - `onCambioHorarioPlan()` - validar hora de inicio
  - `generarSesionesPlan()` - generar todas las sesiones del plan
  - `aplicarPlanASesiones()` - copiar plan a sesionesSeleccionadas

### Variables Legacy (Código Antiguo - NO SE USA)

#### Método Toggle Deprecado
```typescript
modoReserva: 'unica' | 'multiple' | 'plan' = 'unica';  // ❌ NO SE USA
cambiarModoReserva(modo)  // ❌ NO LLAMADO DESDE TEMPLATE
```

#### Sesión Única (Nunca Completado)
```typescript
calendarioUnica: DiaCalendario[][] = [];  // ❌ NO SE RENDERIZA
mesActualUnica: Date = new Date();        // ❌ NO SE USA
fechaUnicaSeleccionada: string = '';      // ❌ NO SE USA
horarioUnico = { horaInicio: '', horaFin: '' };  // ❌ NO SE USA
horasDisponiblesUnico: string[];          // ❌ NO SE USA

// Métodos relacionados (no llamados):
generarCalendarioUnica()  // ❌ NO LLAMADO
seleccionarDiaUnico()     // ❌ NO LLAMADO
cambiarMesUnica()         // ❌ NO LLAMADO
onCambioHorarioUnico()    // ❌ NO LLAMADO
actualizarSesionUnica()   // ❌ NO CALLADO
aplicarRangoUnico()       // ❌ NO LLAMADO
```

#### Modo Múltiple Deprecado  
```typescript
tipoReserva: 'unica' | 'multiple' = 'multiple';  // ❌ LEGACY FLAG
cambiarTipoReserva(tipo)  // ❌ NO LLAMADO DESDE TEMPLATE
modoMultiple: 'calendario' | 'plan' = 'calendario';  // ❌ REDUNDANTE CON usarPlanSemanal

// Usado solo como fallback en crearReservasMultiples() for notas:
if (this.tipoReserva === 'multiple' ? 'Sesión múltiple' : 'Plan recurrente')
```

#### Plan Recurrente Antiguo
```typescript
planRecurrente = {  // ❌ DEPRECADO (reemplazado por planConfig)
  duracionMeses: 1,
  diaSemana: '',
  horaInicio: '',
  horaFin: ''
};

diasSemanaPlan: string[];     // ⚠️ USADO SOLO EN LEGACY calcularFechasRecurrentes()
fechasRecurrentes: string[];  // ⚠️ USADO SOLO EN LINESOF 1204-1237 (crearReservasMultiples fallback)
calcularFechasRecurrentes()   // ⚠️ NO LLAMADO DESDE TEMPLATE
```

#### Horarios Múltiples Redundantes
```typescript
horarioMultiple = { horaInicio: '', horaFin: '' };  // ❌ FALLBACK LEGACY
horasDisponiblesMultiple: string[];       // ❌ NO SE USA
horasFinDisponiblesMultiple: string[];    // ❌ NO SE USA
```

## Matriz de Actividad

| Variable/Método | Declarado | Inicializado | Usado en Template | Usado en Lógica | Estado |
|---|---|---|---|---|---|
| `usarPlanSemanal` | ✅ | ✅ | ✅ | ✅ | **ACTIVO** |
| `sesionesSeleccionadas` | ✅ | ✅ | ✅ | ✅ | **ACTIVO** |
| `calendarioMes`, `mesActual` | ✅ | ✅ | ✅ | ✅ | **ACTIVO** |
| `planConfig` | ✅ | ✅ | ✅ | ✅ | **ACTIVO** |
| `diasSemanaConfig` | ✅ | ✅ | ✅ | ✅ | **ACTIVO** |
| `diaSeleccionandoHorario` | ✅ | ✅ | ✅ | ✅ | **ACTIVO** |
| `horarioTemporal` | ✅ | ✅ | ✅ | ✅ | **ACTIVO** |
| `tipoReserva` | ✅ | ✅ | ❌ | ⚠️ (fallback) | **LEGACY** |
| `modoReserva` | ✅ | ✅ | ❌ | ❌ | **ELIMINABLE** |
| `cambiarModoReserva()` | ✅ | - | ❌ | ❌ | **ELIMINABLE** |
| `calendarioUnica` | ✅ | ✅ | ❌ | ❌ | **ELIMINABLE** |
| `horarioUnico` | ✅ | ✅ | ❌ | ❌ | **ELIMINABLE** |
| `generarCalendarioUnica()` | ✅ | - | ❌ | ❌ | **ELIMINABLE** |

## Plan de Limpieza Evolutivo

### Fase 1: Documentación ✅ (COMPLETADO - este archivo)
- Mapear qué es activo vs legacy
- Identificar métodos no llamados

### Fase 2: Eliminar No-Ops (PRÓXIMA)
**Métodos completamente innecesarios** (ningún código llama a estos):
- `cambiarModoReserva()` (línea 1307)
- `cambiarModoMultiple()` (línea 1884)
- `cambiarTipoReserva()` (línea 1724)
- `generarCalendarioUnica()` through `cambiarMesUnica()` (líneas 1752-1866)
- `seleccionarDiaUnico()` (línea 1815)
- `onCambioHorarioUnico()` (línea 1382)
- `actualizarSesionUnica()` (línea 1399)
- `aplicarRangoUnico()` (línea 1429)

**Estimado**: 180 líneas de código eliminable
**Riesgo**: Bajo (estos métodos no se invocan desde ningún lado)

### Fase 3: Consolidar Variables Legacy (FUTURA)
- Reemplazar `tipoReserva` en línea 1233 con lógica basada en `sesionesSeleccionadas.length > 0 ? 'múltiple' : 'plan'`
- Eliminar fallback `planRecurrente` (mantener solo `planConfig`)
- Eliminar métodos que usan `diasSemanaPlan`, `fechasRecurrentes` (usar generador directamente)

### Fase 4: Consolidar Horarios (FUTURA)
- Unificar `horarioTemporal`, `horarioUnico`, `horarioMultiple` en un único objeto
- Usar un único objeto `selected: { horaInicio, horaFin }` con contexto

**Estimado Fase 3-4**: 300+ líneas de refactorización (máyor impacto, requiere test exhaustivo)

## Recomendación Actual

**Procede con Fase 2** (eliminar métodos no llamados) - bajo riesgo, limpia 180 líneas.

Defer Fase 3-4 hasta después de agregar test suite (E2E + unit tests), ya que éstos requieren más validación exhaustiva.

---

*Documento generado para facilitar futuras refactorizaciones. Última actualización: 2026-03-15*
