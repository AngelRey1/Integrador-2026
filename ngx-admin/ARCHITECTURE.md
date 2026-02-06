# SportConnect - Arquitectura Modular

## 📁 Estructura del Proyecto

```
ngx-admin/
├── src/app/
│   ├── @core/                    # Servicios, guards, interceptores
│   ├── @theme/                   # Componentes globales (header, footer)
│   ├── auth/                     # Autenticación (login, register)
│   ├── admin/                    # Panel administrativo (ngx-admin)
│   │
│   └── public/                   # Aplicación pública
│       ├── landing/              # 🏠 Módulo Landing (Home page)
│       │   ├── landing.module.ts
│       │   ├── landing-routing.module.ts
│       │   └── home/             # Home component (shared)
│       │
│       ├── client/               # 👥 Módulo Cliente
│       │   ├── client.module.ts
│       │   ├── client-routing.module.ts
│       │   ├── entrenadores-list/
│       │   ├── entrenador-perfil/
│       │   └── reserva-modal/
│       │
│       ├── home/                 # Componente home (original)
│       ├── entrenadores-list/    # Componente lista (original)
│       ├── entrenador-perfil/    # Componente perfil (original)
│       ├── reserva-modal/        # Componente modal (original)
│       ├── shared-header/        # Header compartido
│       ├── shared-footer/        # Footer compartido
│       │
│       └── public.module.ts      # Módulo raíz (lazy loading)
│
└── .env                          # Variables de entorno (NO a Git)
```

## 🎯 Módulos

### Landing Module
- **Ruta**: `/`
- **Componente**: `PublicHomeComponent`
- **Descripción**: Página de inicio pública

### Client Module
- **Rutas**:
  - `/entrenadores` → `EntrenadoresListComponent`
  - `/entrenador/:id` → `EntrenadorPerfilComponent`
- **Descripción**: Búsqueda y reserva de entrenadores

## 🚀 Lazy Loading

Cada módulo se carga bajo demanda:

```typescript
// public.module.ts
const routes = [
  {
    path: '',
    loadChildren: () => import('./landing/landing.module')
      .then(m => m.LandingModule)
  },
  {
    path: '',
    loadChildren: () => import('./client/client.module')
      .then(m => m.ClientModule)
  }
];
```

## 🔐 Seguridad

### Variables de Entorno
- **Archivo**: `.env` (NO commiteado)
- **Ejemplo**: `.env.example`
- **Variables secretas**:
  - `API_URL`
  - `DB_PASSWORD`
  - `JWT_SECRET`
  - etc.

### Build Optimizado
```bash
npm run build --prod
# Genera código minificado y ofuscado
# Tamaño mínimo: ~2MB (gzip)
```

### GitHub Secrets (CI/CD)
```yaml
# .github/workflows/deploy.yml
env:
  API_URL: ${{ secrets.PROD_API_URL }}
  DB_PASSWORD: ${{ secrets.PROD_DB_PASSWORD }}
```

## 📊 Performance

### Bundle Size
- Landing: ~50KB
- Client: ~80KB
- Admin: ~200KB

### Metrics
- Lazy loading: ✅
- AOT compilation: ✅
- Tree-shaking: ✅
- Gzip compression: ✅

## 👥 Desarrollo en Equipo

### Branching Strategy
```bash
main/           # Producción (protegida)
  ├── dev/      # Desarrollo
  └── feature/  # Características individuales
```

### Pull Request Workflow
1. Crear rama: `git checkout -b feature/nombre`
2. Desarrollar y push
3. Crear PR a `dev`
4. Code review
5. Merge a `dev`
6. Deploy a staging
7. Merge `dev` → `main` para producción

## 🛠️ Comandos

```bash
# Desarrollo
npm start

# Build producción
npm run build --prod

# Testing
npm test

# Linting
ng lint
```

## 📝 Variables de Entorno

Copiar `.env` de plantilla:
```bash
cp .env .env.local
```

Completar con valores locales:
```
API_URL=http://localhost:3000
DB_PASSWORD=mi_contraseña_local
JWT_SECRET=mi_jwt_local
```

## 🚀 Deployment

### GitHub Actions
Configurado automáticamente en `.github/workflows/deploy.yml`

### Vercel / Netlify
```bash
vercel --prod
```

## 📚 Referencias

- [Angular Lazy Loading](https://angular.io/guide/lazy-loading-ngmodules)
- [Angular Security](https://angular.io/guide/security)
- [Build Optimization](https://angular.io/guide/build)

---

**Última actualización**: 23/01/2026
