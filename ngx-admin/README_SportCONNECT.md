# 🏋️ SportConnect - Plataforma de Agendamiento de Entrenamientos

Aplicación web basada en **ngx-admin** para conectar clientes con entrenadores personales, inspirada en el modelo de Uber para servicios de entrenamiento.

## 🚀 Inicio Rápido (PowerShell - Windows)

### 1. Instalar dependencias

```powershell
npm install --legacy-peer-deps
```

*Nota: Se usa `--legacy-peer-deps` para resolver conflictos de versiones en ngx-admin.*

### 2. Instalar Sass (si no está instalado)

```powershell
npm install sass --save-dev --legacy-peer-deps
```

### 3. Arrancar servidor de desarrollo

```powershell
npm start
```

La aplicación estará disponible en **http://localhost:4200**

### 4. Credenciales de prueba (ngx-admin demo - temporal)

- **Email**: admin@admin.com  
- **Password**: admin

## 📁 Estructura del Proyecto

```
IntegradorSport/
├── src/app/
│   ├── @core/              # Servicios core, guards, interceptores
│   │   ├── services/       # Auth, API, Cliente, Entrenador, Admin
│   │   ├── guards/         # Protección de rutas por rol
│   │   └── interceptors/   # JWT, errores
│   ├── @theme/             # Temas Nebular y layouts
│   ├── auth/               # Login, Register, Landing Page
│   ├── pages/              
│   │   ├── cliente/        # 🎯 Dashboard Cliente (a crear)
│   │   ├── entrenador/     # 💪 Dashboard Entrenador (a crear)
│   │   └── admin/          # 🔧 Panel Admin (a crear)
│   └── shared/             # Componentes compartidos
└── README_FITCONNECT.md    # Este archivo
```

## 🎯 Funcionalidades a Implementar

### 👤 Módulo Cliente
- [x] Autenticación con rol CLIENTE
- [ ] Dashboard con estadísticas
- [ ] Buscar entrenadores (filtros avanzados)
- [ ] Agendar sesiones (wizard multi-paso)
- [ ] Mis reservas (tabs por estado)
- [ ] Mis pagos e historial
- [ ] Sistema de reseñas
- [ ] Perfil y preferencias

### 💪 Módulo Entrenador
- [x] Autenticación con rol ENTRENADOR
- [ ] Dashboard con calendario
- [ ] Gestión de disponibilidad
- [ ] Mis clases programadas
- [ ] Historial de clientes
- [ ] Ingresos y estadísticas
- [ ] Perfil profesional

### 🔧 Módulo Admin
- [x] Autenticación con rol ADMIN
- [ ] Dashboard general de la plataforma
- [ ] Gestión de usuarios
- [ ] Gestión de deportes/categorías
- [ ] Reportes y analytics
- [ ] Configuración del sistema

## 🛠️ Tecnologías

- **Framework**: Angular 15.2.10
- **UI Library**: Nebular 11.0.1
- **Design System**: Eva Design
- **Charts**: ngx-charts, Chart.js
- **Maps**: Leaflet, Google Maps
- **Icons**: Eva Icons
- **Styles**: SCSS + Bootstrap 4

## 📝 Próximos Pasos de Desarrollo

1. **Fase 1**: Adaptar autenticación con roles (Cliente, Entrenador, Admin)
2. **Fase 2**: Crear módulo Cliente completo
3. **Fase 3**: Crear módulo Entrenador
4. **Fase 4**: Crear módulo Admin
5. **Fase 5**: Integración con backend API

## 🔌 Configuración API

El proyecto está configurado para consumir endpoints en `/api/v1/`. Para desarrollo local, configura un proxy en `proxy.conf.json`:

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false
  }
}
```

Y arranca con:
```powershell
ng serve --proxy-config proxy.conf.json
```

## 📦 Scripts Disponibles

- `npm start` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run build:prod` - Build optimizado
- `npm test` - Ejecutar tests
- `npm run lint` - Linter de código

## 🚨 Problemas Comunes

### Error de node-sass
Si encuentras errores de node-sass, ya está reemplazado por `sass` moderno. Si persiste:
```powershell
npm uninstall node-sass
npm install sass --save-dev --legacy-peer-deps
```

### Conflictos de peer dependencies
Usa siempre `--legacy-peer-deps` al instalar paquetes nuevos.

## 📄 Documentación Original

Este proyecto está basado en [ngx-admin](https://github.com/akveo/ngx-admin). Para documentación completa de ngx-admin, visita [akveo.github.io/ngx-admin](https://akveo.github.io/ngx-admin).

---

**Desarrollado con ❤️ usando ngx-admin template**
