import { NbMenuItem } from '@nebular/theme';

// =============================================
// MENÚ PARA CLIENTES — Organizado por contexto
// =============================================
const CLIENTE_MENU: NbMenuItem[] = [
  {
    title: 'PRINCIPAL',
    group: true,
  },
  {
    title: 'Inicio',
    icon: 'home-outline',
    link: '/pages/cliente/dashboard',
    home: true,
  },
  {
    title: 'Mis Sesiones',
    icon: 'calendar-outline',
    link: '/pages/cliente/mis-reservas',
  },

  {
    title: 'EXPLORAR',
    group: true,
  },
  {
    title: 'Buscar Entrenadores',
    icon: 'search-outline',
    link: '/entrenadores',
  },
  {
    title: 'Agendar Sesión',
    icon: 'plus-circle-outline',
    link: '/pages/cliente/agendar-sesion',
  },

  {
    title: 'CUENTA',
    group: true,
  },
  {
    title: 'Mensajes',
    icon: 'message-circle-outline',
    link: '/pages/cliente/chat',
  },
  {
    title: 'Mis Pagos',
    icon: 'credit-card-outline',
    link: '/pages/cliente/mis-pagos',
  },
  {
    title: 'Mis Reseñas',
    icon: 'star-outline',
    link: '/pages/cliente/mis-resenas',
  },
  {
    title: 'Mi Perfil',
    icon: 'person-outline',
    link: '/pages/cliente/perfil',
  },
];

// =============================================
// MENÚ PARA ENTRENADORES — Organizado por área
// =============================================
const ENTRENADOR_MENU: NbMenuItem[] = [
  {
    title: 'GESTIÓN',
    group: true,
  },
  {
    title: 'Inicio',
    icon: 'home-outline',
    link: '/pages/entrenador/dashboard',
    home: true,
  },
  {
    title: 'Mis Clientes',
    icon: 'people-outline',
    link: '/pages/entrenador/mis-clientes',
  },
  {
    title: 'Mis Sesiones',
    icon: 'calendar-outline',
    link: '/pages/entrenador/gestion-clases',
  },
  {
    title: 'Disponibilidad',
    icon: 'clock-outline',
    link: '/pages/entrenador/calendario',
  },

  {
    title: 'FINANZAS',
    group: true,
  },
  {
    title: 'Mis Ingresos',
    icon: 'trending-up-outline',
    link: '/pages/entrenador/mis-ingresos',
  },
  {
    title: 'Mi Suscripción',
    icon: 'star-outline',
    link: '/pages/entrenador/suscripcion',
  },

  {
    title: 'COMUNICACIÓN',
    group: true,
  },
  {
    title: 'Chat con Clientes',
    icon: 'message-circle-outline',
    link: '/pages/entrenador/chat',
  },
  {
    title: 'Chat con Admin',
    icon: 'shield-outline',
    link: '/pages/entrenador/chat-admin',
  },

  {
    title: 'MI CUENTA',
    group: true,
  },
  {
    title: 'Mi Perfil',
    icon: 'person-outline',
    link: '/pages/entrenador/perfil',
  },
  {
    title: 'Mis Reseñas',
    icon: 'star-outline',
    link: '/pages/entrenador/mis-resenas',
  },
  {
    title: 'Ir al Sitio Público',
    icon: 'globe-outline',
    link: '/home',
    pathMatch: 'full',
  },
];

// Función para obtener el menú según el rol del usuario
export function getMenuByRole(role: string | null): NbMenuItem[] {
  if (!role) return CLIENTE_MENU;
  const roleLower = role.toLowerCase();
  switch (roleLower) {
    case 'cliente':
    case 'client':
      return CLIENTE_MENU;
    case 'entrenador':
    case 'trainer':
      return ENTRENADOR_MENU;
    default:
      return CLIENTE_MENU;
  }
}

// Exportación por defecto (compatibilidad)
export const MENU_ITEMS: NbMenuItem[] = CLIENTE_MENU;
