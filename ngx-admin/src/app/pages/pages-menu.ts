import { NbMenuItem } from '@nebular/theme';

// Menú para CLIENTES
// Arquitectura UX: Inicio unificado → Gestión → Historial → Perfil
const CLIENTE_MENU: NbMenuItem[] = [
  {
    title: 'PRINCIPAL',
    group: true,
  },
  {
    title: 'Inicio',
    icon: 'home-outline',
    link: '/pages/cliente/dashboard',
    home: true,  // Vista unificada: próxima sesión + stats + acceso rápido
  },
  {
    title: 'Mis Sesiones',
    icon: 'calendar-outline',
    link: '/pages/cliente/mis-reservas',
  },
  {
    title: 'ACCIONES',
    group: true,
  },
  {
    title: 'Agendar Sesión',
    icon: 'plus-circle-outline',
    link: '/pages/cliente/agendar-sesion',
  },
  {
    title: 'HISTORIAL',
    group: true,
  },
  {
    title: 'Pagos',
    icon: 'credit-card-outline',
    link: '/pages/cliente/mis-pagos',
  },
  {
    title: 'Reseñas',
    icon: 'star-outline',
    link: '/pages/cliente/mis-resenas',
  },
  {
    title: 'CUENTA',
    group: true,
  },
  {
    title: 'Mi Perfil',
    icon: 'person-outline',
    link: '/pages/cliente/perfil',
  },
  {
    title: 'NAVEGACIÓN',
    group: true,
  },
  {
    title: 'Ir a Página Principal',
    icon: 'globe-outline',
    link: '/home',
    pathMatch: 'full',
  },
];

// Menú para ENTRENADORES
const ENTRENADOR_MENU: NbMenuItem[] = [
  {
    title: 'ENTRENADOR',
    group: true,
  },
  {
    title: 'Dashboard Entrenador',
    icon: 'activity-outline',
    link: '/pages/entrenador/dashboard',
    home: true,
  },
  {
    title: 'Mi Perfil',
    icon: 'person-outline',
    link: '/pages/entrenador/perfil',
  },
  {
    title: 'Gestión de Clases',
    icon: 'calendar-outline',
    link: '/pages/entrenador/gestion-clases',
  },
  {
    title: 'Mis Clientes',
    icon: 'people-outline',
    link: '/pages/entrenador/mis-clientes',
  },
  {
    title: 'Calendario Disponibilidad',
    icon: 'clock-outline',
    link: '/pages/entrenador/calendario',
  },
  {
    title: 'Mis Ingresos',
    icon: 'trending-up-outline',
    link: '/pages/entrenador/mis-ingresos',
  },
  {
    title: 'NAVEGACIÓN',
    group: true,
  },
  {
    title: 'Ir a Página Principal',
    icon: 'globe-outline',
    link: '/home',
    pathMatch: 'full',
  },
];

// Función para obtener el menú según el rol del usuario
// El rol se obtiene automáticamente del token JWT después del login
export function getMenuByRole(role: string | null): NbMenuItem[] {
  if (!role) {
    return CLIENTE_MENU; // Por defecto si no hay rol
  }
  
  // Normalizar el rol a minúsculas para comparación
  const roleLower = role.toLowerCase();
  
  switch (roleLower) {
    case 'cliente':
    case 'client':
      return CLIENTE_MENU;
    case 'entrenador':
    case 'trainer':
      return ENTRENADOR_MENU;
    default:
      return CLIENTE_MENU; // Por defecto muestra el menú de cliente
  }
}

// Exportación por defecto (temporal para compatibilidad)
export const MENU_ITEMS: NbMenuItem[] = CLIENTE_MENU;

