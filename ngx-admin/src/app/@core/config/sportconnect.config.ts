// ============================================
// GLOBAL SPORTCONNECT CONFIGURATION
// Variables globales para toda la aplicación
// ============================================

// Moneda y Formato
export const CURRENCY_CONFIG = {
  currency: 'MXN',
  locale: 'es-MX',
  symbol: '$',
  format: (amount: number) => new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount)
};

// Colores SportConnect (Matching Landing Page)
export const SPORTCONNECT_COLORS = {
  primary: '#00D09C',
  primaryDark: '#00B386',
  primaryLight: '#D4F8F0',
  secondary: '#0A7B8A',
  neon: '#00F0FF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  accent: '#E5E7EB',
  success: '#10B981',
  warning: '#FFD700',
  danger: '#EF4444',
  info: '#0A7B8A'
};

// Tipografía
export const SPORTCONNECT_FONTS = {
  primary: "'Space Grotesk', 'Inter', sans-serif",
  secondary: "'Inter', sans-serif"
};

// Shadows Premium
export const SPORTCONNECT_SHADOWS = {
  sm: '0 4px 12px rgba(15, 23, 42, 0.08)',
  md: '0 8px 24px rgba(0, 240, 255, 0.12)',
  lg: '0 20px 40px rgba(0, 240, 255, 0.15)',
  card: '0 2px 8px rgba(0, 0, 0, 0.08)'
};

// Espaciado
export const SPORTCONNECT_SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem'
};

// Border Radius
export const SPORTCONNECT_RADIUS = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  full: '50%'
};

// Tipos de Sesión
export const SESSION_TYPES = {
  presencial: {
    label: 'Presencial',
    icono: 'people-outline',
    descripcion: 'Entrenamiento en persona'
  },
  online: {
    label: 'Online',
    icono: 'monitor-outline',
    descripcion: 'Entrenamiento por videollamada'
  }
};

// Estados de Sesión
export const SESSION_STATUS = {
  PENDIENTE: { label: 'Pendiente', color: '#FFD700', bgColor: 'rgba(255, 193, 7, 0.1)' },
  CONFIRMADA: { label: 'Confirmada', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  EN_CURSO: { label: 'En Curso', color: '#0A7B8A', bgColor: 'rgba(10, 123, 138, 0.1)' },
  COMPLETADA: { label: 'Completada', color: '#00D09C', bgColor: 'rgba(0, 208, 156, 0.1)' },
  CANCELADA: { label: 'Cancelada', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' }
};
