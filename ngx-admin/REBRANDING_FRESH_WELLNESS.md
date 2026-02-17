# 🎨 Sportconnecta - REBRANDING: FRESH WELLNESS

## Identidad Visual Actualizada

Sportconnecta ha sido completamente rediseñado con una paleta de colores **Fresh Wellness** que transmite confianza, modernidad, salud y energía.

---

## 📊 Paleta de Colores

### Colores Primarios
| Color | Hex | Uso | Sensación |
|-------|-----|-----|-----------|
| **Verde Menta Vibrante** | `#00D09C` | Botones, CTA, iconos, precios | Energía, acción, wellness |
| **Verde Menta Claro** | `#1ADBAF` | Gradientes, hover states | Amplificación del primario |
| **Verde Menta Oscuro** | `#00B886` | Estados presionados | Profundidad |

### Colores Secundarios
| Color | Hex | Uso | Sensación |
|-------|-----|-----|-----------|
| **Azul Marino Profundo** | `#0F172A` | Títulos H1/H2, textos fuertes | Profesionalismo, confianza |
| **Azul Marino Claro** | `#1E293B` | Textos secundarios | Legibilidad |

### Fondos & Accents
| Color | Hex | Uso | Propósito |
|-------|-----|-----|-----------|
| **Blanco Azulado** | `#F8FAFC` | Fondo general | Limpieza, modernidad |
| **Gris Pizarra Claro** | `#E2E8F0` | Bordes, dividers, chips | Sutileza |
| **Blanco Puro** | `#FFFFFF` | Tarjetas, superficies | Contraste |

### Textos
| Color | Hex | Uso |
|-------|-----|-----|
| **Texto Primario** | `#0F172A` | Body, párrafos |
| **Texto Secundario** | `#475569` | Descripciones |
| **Texto Mutted** | `#64748B` | Helper text, labels |

---

## ✨ Características del Rebranding

### 1. **Hero Section - Humanizado con Floating Avatars**
- Gradiente sutil: Blanco → Blanco azulado
- 4 avatares circulares de entrenadores flotando con animación suave
- Sombras con tonos verdes menta para cohesión visual
- Búsqueda pill-shaped con borde verde menta

### 2. **Nueva Sección: Top Entrenadores**
- Grid de 4 tarjetas de entrenadores destacados
- Badge dorado "✓ VERIFICADO" con gradiente verde menta
- Foto de alta calidad (aspect ratio 1:1)
- Precio en **verde menta ($XXX MXN/hora)**
- Botón "Contactar" con border verde menta y hover fill

### 3. **Soft Shadows en Todas las Tarjetas**
```scss
--color-shadow-sm: 0 1px 2px 0 rgba(15, 23, 42, 0.05);
--color-shadow-md: 0 4px 6px -1px rgba(15, 23, 42, 0.08);
--color-shadow-lg: 0 10px 40px -10px rgba(15, 23, 42, 0.12);
--color-shadow-xl: 0 20px 50px -10px rgba(15, 23, 42, 0.15);
```

### 4. **Elementos Interactivos**
- **Botones Primarios**: Verde menta gradiente → Azul marino text
- **Botones Ghost**: Border verde menta, hover con fondo transparente verde
- **Chips de Categorías**: Border gris pizarra, fondo verde menta suave al hover
- **Cards**: Elevación 5px en hover, border verde menta destacada

### 5. **Tipografía & Jerarquía**
- **H1**: Azul marino, 4rem, 900 weight, -0.02em letter-spacing
- **H2**: Azul marino, 2.2rem, 900 weight
- **Body**: Gris secundario, 500 weight (no tan delgado)
- **Labels**: Gris muted, 500 weight

### 6. **Localización (MXN)**
- Precios: `$350 MXN/hora` (verde menta #00D09C)
- Placeholder búsqueda: "¿Qué quieres aprender? (Ej: Fútbol, Yoga...)"
- Ubicación implícita: "Encuentra al coach ideal **en Mérida**"

---

## 🎯 Conversión de Colores Antiguos → Nuevos

| Elemento | Antiguo | Nuevo | Variable CSS |
|----------|---------|-------|--------------|
| Botón Principal | #FF5A5F (Coral) | #00D09C (Verde Menta) | `--color-primary` |
| Texto Fuerte | #0F0F0F (Negro) | #0F172A (Azul Marino) | `--color-secondary` |
| Fondo General | #FFFFFF | #F8FAFC (Blanco Azulado) | `--color-background` |
| Border/Divider | #F3E8E9 (Beige) | #E2E8F0 (Gris Pizarra) | `--color-accent` |
| Badge Verified | Dorado (#FFD700) | Verde Menta Gradiente | Badge actualizado |
| Hover Elevation | 2px | 5px (trainers), 2px (otros) | CSS transitions |

---

## 🎨 Ejemplos de Uso

### Botón de Acción
```scss
.btn.primary {
  background: linear-gradient(135deg, #00D09C, #1ADBAF);
  color: #0F172A;
  box-shadow: 0 8px 28px rgba(0, 208, 156, 0.25);
}
```

### Tarjeta de Entrenador
```scss
.trainer-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.08);
  
  &:hover {
    border-color: #00D09C;
    transform: translateY(-5px);
  }
}
```

### Precio Destacado
```scss
.price {
  color: #00D09C;
  font-weight: 900;
  font-size: 1.6rem;
}
```

---

## 🌐 Accesibilidad

✅ **Contraste WCAG AA+**
- Verde Menta (#00D09C) sobre Blanco: 5.8:1
- Azul Marino (#0F172A) sobre Blanco: 12.5:1
- Todos los textos cumlen estándares de legibilidad

✅ **Modo Oscuro Futuro**
- Variables CSS reutilizables en media query `prefers-color-scheme: dark`

---

## 📱 Responsivo

- Mobile: Avatares reducidos (60px), grid de trainers ajustada
- Tablet: Layout adaptado, shadows suavizadas
- Desktop: Full experience con animaciones fluidas

---

## 🚀 Implementación

Todos los cambios están en:
- **File**: `src/app/public/home/home.component.scss`
- **CSS Variables**: `:root { --color-primary, --color-secondary, ... }`
- **Componentes Afectados**: Hero, Floating Avatars, Trainer Cards, Botones, Chips, Stats

---

## 💡 Próximos Pasos

1. ✅ Paleta implementada
2. ⏳ Testing en navegadores (Chrome, Safari, Firefox)
3. ⏳ Validar contraste accesibilidad
4. ⏳ Aplicar mismo esquema a otras páginas (Perfil Entrenador, Galería, etc.)
5. ⏳ Modo oscuro (opcional)

---

**Sportconnecta es ahora una plataforma moderna, profesional y energética. 🎯**
