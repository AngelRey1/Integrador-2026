import { Component, Input, OnInit } from '@angular/core';

/**
 * Componente de iconos SVG ENTERPRISE para SportConnect
 * Nivel: Senior/Enterprise - Iconos con volumen 3D, gradientes, sombras y detalles premium
 * Estilo: Solid + Gradient con profundidad visual real
 * Uso: <ngx-sport-icon name="futbol" [size]="24"></ngx-sport-icon>
 */
@Component({
  selector: 'ngx-sport-icon',
  template: `
    <svg 
      [attr.width]="size" 
      [attr.height]="size" 
      viewBox="0 0 24 24" 
      fill="none"
      class="sport-icon"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- DEFINICIONES GLOBALES -->
      <defs>
        <linearGradient [attr.id]="'grad-' + instanceId" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" [attr.stop-color]="color" stop-opacity="1"/>
          <stop offset="100%" [attr.stop-color]="color" stop-opacity="0.6"/>
        </linearGradient>
        <linearGradient [attr.id]="'grad-v-' + instanceId" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" [attr.stop-color]="color" stop-opacity="0.9"/>
          <stop offset="100%" [attr.stop-color]="color" stop-opacity="0.4"/>
        </linearGradient>
      </defs>

      <ng-container [ngSwitch]="name">
        
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- ═══════════════ DEPORTES - ICONOS 3D PREMIUM ═══════════════ -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        
        <!-- FÚTBOL - Balón 3D con patrón realista -->
        <ng-container *ngSwitchCase="'futbol'">
          <!-- Sombra del balón -->
          <ellipse cx="12" cy="21" rx="6" ry="1.5" [attr.fill]="color" fill-opacity="0.15"/>
          <!-- Balón base con gradiente -->
          <circle cx="12" cy="11" r="9" [attr.fill]="'url(#grad-' + instanceId + ')'" fill-opacity="0.2"/>
          <circle cx="12" cy="11" r="9" [attr.stroke]="color" stroke-width="1.8" fill="none"/>
          <!-- Pentágono central (negro en balón real) -->
          <path d="M12 6L15 8.5L13.8 12L10.2 12L9 8.5Z" [attr.fill]="color" fill-opacity="0.7" [attr.stroke]="color" stroke-width="0.8"/>
          <!-- Patrones hexagonales -->
          <path d="M12 2.5V6" [attr.stroke]="color" stroke-width="1.2"/>
          <path d="M9 8.5L5.5 6.5" [attr.stroke]="color" stroke-width="1.2"/>
          <path d="M15 8.5L18.5 6.5" [attr.stroke]="color" stroke-width="1.2"/>
          <path d="M10.2 12L7 15" [attr.stroke]="color" stroke-width="1.2"/>
          <path d="M13.8 12L17 15" [attr.stroke]="color" stroke-width="1.2"/>
          <!-- Pentágonos laterales parciales -->
          <path d="M5.5 6.5L3.5 10" [attr.stroke]="color" stroke-width="1"/>
          <path d="M18.5 6.5L20.5 10" [attr.stroke]="color" stroke-width="1"/>
          <path d="M7 15L6 18" [attr.stroke]="color" stroke-width="1"/>
          <path d="M17 15L18 18" [attr.stroke]="color" stroke-width="1"/>
          <!-- Highlight/brillo -->
          <path d="M7 5C8 4 9.5 3.5 11 3.5" [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.3"/>
        </ng-container>

        <!-- CROSSFIT / PESAS - Mancuerna 3D -->
        <ng-container *ngSwitchCase="'crossfit'">
          <!-- Sombra -->
          <ellipse cx="12" cy="21" rx="8" ry="1" [attr.fill]="color" fill-opacity="0.12"/>
          <!-- Peso izquierdo - disco grande -->
          <rect x="1" y="6" width="4" height="12" rx="1.5" [attr.fill]="'url(#grad-v-' + instanceId + ')'" [attr.stroke]="color" stroke-width="1.2"/>
          <rect x="2" y="7" width="2" height="10" rx="0.5" [attr.fill]="color" fill-opacity="0.3"/>
          <!-- Peso izquierdo - disco pequeño -->
          <rect x="5" y="8" width="2.5" height="8" rx="1" [attr.fill]="color" fill-opacity="0.5" [attr.stroke]="color" stroke-width="0.8"/>
          <!-- Barra central con grip -->
          <rect x="7.5" y="10.5" width="9" height="3" rx="1.5" [attr.fill]="color" fill-opacity="0.25" [attr.stroke]="color" stroke-width="1"/>
          <!-- Textura del grip -->
          <line x1="9" y1="11" x2="9" y2="13" [attr.stroke]="color" stroke-width="0.6" stroke-opacity="0.5"/>
          <line x1="10.5" y1="11" x2="10.5" y2="13" [attr.stroke]="color" stroke-width="0.6" stroke-opacity="0.5"/>
          <line x1="12" y1="11" x2="12" y2="13" [attr.stroke]="color" stroke-width="0.6" stroke-opacity="0.5"/>
          <line x1="13.5" y1="11" x2="13.5" y2="13" [attr.stroke]="color" stroke-width="0.6" stroke-opacity="0.5"/>
          <line x1="15" y1="11" x2="15" y2="13" [attr.stroke]="color" stroke-width="0.6" stroke-opacity="0.5"/>
          <!-- Peso derecho - disco pequeño -->
          <rect x="16.5" y="8" width="2.5" height="8" rx="1" [attr.fill]="color" fill-opacity="0.5" [attr.stroke]="color" stroke-width="0.8"/>
          <!-- Peso derecho - disco grande -->
          <rect x="19" y="6" width="4" height="12" rx="1.5" [attr.fill]="'url(#grad-v-' + instanceId + ')'" [attr.stroke]="color" stroke-width="1.2"/>
          <rect x="20" y="7" width="2" height="10" rx="0.5" [attr.fill]="color" fill-opacity="0.3"/>
        </ng-container>

        <!-- YOGA - Figura en loto con aura -->
        <ng-container *ngSwitchCase="'yoga'">
          <!-- Aura/energía de fondo -->
          <circle cx="12" cy="12" r="10" [attr.fill]="color" fill-opacity="0.05"/>
          <circle cx="12" cy="12" r="8" [attr.stroke]="color" stroke-width="0.5" stroke-dasharray="2 3" stroke-opacity="0.3"/>
          <!-- Mat de yoga -->
          <ellipse cx="12" cy="20" rx="8" ry="2" [attr.fill]="color" fill-opacity="0.2"/>
          <ellipse cx="12" cy="20" rx="8" ry="2" [attr.stroke]="color" stroke-width="1"/>
          <!-- Cabeza -->
          <circle cx="12" cy="5" r="2.5" [attr.fill]="color" fill-opacity="0.3" [attr.stroke]="color" stroke-width="1.5"/>
          <!-- Torso -->
          <path d="M12 7.5V11" [attr.stroke]="color" stroke-width="2" stroke-linecap="round"/>
          <!-- Brazos en meditación -->
          <path d="M12 9.5C10 10 7 11 5.5 13.5" [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M12 9.5C14 10 17 11 18.5 13.5" [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round"/>
          <!-- Manos (mudra) -->
          <circle cx="5" cy="14" r="1.2" [attr.fill]="color" fill-opacity="0.4" [attr.stroke]="color" stroke-width="1"/>
          <circle cx="19" cy="14" r="1.2" [attr.fill]="color" fill-opacity="0.4" [attr.stroke]="color" stroke-width="1"/>
          <!-- Piernas cruzadas -->
          <path d="M12 11C9 12 6 15 6 17C8 18 10 18.5 12 18.5C14 18.5 16 18 18 17C18 15 15 12 12 11Z" 
                [attr.fill]="color" fill-opacity="0.25" [attr.stroke]="color" stroke-width="1.2"/>
          <!-- Detalle de rodillas -->
          <ellipse cx="7.5" cy="16.5" rx="1.5" ry="1" [attr.fill]="color" fill-opacity="0.15"/>
          <ellipse cx="16.5" cy="16.5" rx="1.5" ry="1" [attr.fill]="color" fill-opacity="0.15"/>
        </ng-container>

        <!-- NATACIÓN - Nadador 3D con agua -->
        <ng-container *ngSwitchCase="'natacion'">
          <!-- Agua - capas con profundidad -->
          <path d="M0 16C2 14.5 4 14 6 14C8 14 10 15.5 12 17C14 18.5 16 19 18 18.5C20 18 22 16.5 24 17" 
                [attr.fill]="color" fill-opacity="0.15"/>
          <path d="M0 16C2 14.5 4 14 6 14C8 14 10 15.5 12 17C14 18.5 16 19 18 18.5C20 18 22 16.5 24 17V24H0Z" 
                [attr.fill]="color" fill-opacity="0.1"/>
          <!-- Ola frontal -->
          <path d="M1 18C3 16.5 5 16 7 16C9 16 11 17.5 13 19C15 20.5 17 21 19 20.5C21 20 23 18.5 24 19" 
                [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round" fill="none"/>
          <!-- Ola de fondo -->
          <path d="M1 21C3 19.5 5 19 7 19C9 19 11 20 13 21" 
                [attr.stroke]="color" stroke-width="1" stroke-linecap="round" fill="none" stroke-opacity="0.4"/>
          <!-- Nadador - cabeza con gorra -->
          <ellipse cx="8" cy="9" rx="2.8" ry="2.5" [attr.fill]="color" fill-opacity="0.3" [attr.stroke]="color" stroke-width="1.5"/>
          <!-- Gafas -->
          <ellipse cx="6.5" cy="8.5" rx="1.2" ry="0.8" [attr.fill]="color" fill-opacity="0.5" [attr.stroke]="color" stroke-width="0.8"/>
          <ellipse cx="9.5" cy="8.5" rx="1.2" ry="0.8" [attr.fill]="color" fill-opacity="0.5" [attr.stroke]="color" stroke-width="0.8"/>
          <line x1="5.3" y1="8.5" x2="4.5" y2="8.5" [attr.stroke]="color" stroke-width="1"/>
          <line x1="10.7" y1="8.5" x2="11.5" y2="8.5" [attr.stroke]="color" stroke-width="1"/>
          <!-- Cuerpo hidrodinámico -->
          <path d="M10.5 10L19 13" [attr.stroke]="color" stroke-width="3" stroke-linecap="round"/>
          <!-- Brazo en crol (arriba) -->
          <path d="M10 8C12 5 15 3.5 19 5" [attr.stroke]="color" stroke-width="2" stroke-linecap="round"/>
          <path d="M19 5L21 4M19 5L21 6.5" [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round"/>
          <!-- Piernas/patada -->
          <path d="M19 13L22 11.5" [attr.stroke]="color" stroke-width="2" stroke-linecap="round"/>
          <path d="M19 13L22 14.5" [attr.stroke]="color" stroke-width="2" stroke-linecap="round"/>
          <!-- Salpicaduras -->
          <circle cx="4" cy="12" r="0.7" [attr.fill]="color" fill-opacity="0.5"/>
          <circle cx="2.5" cy="14" r="0.5" [attr.fill]="color" fill-opacity="0.4"/>
          <circle cx="5" cy="13.5" r="0.6" [attr.fill]="color" fill-opacity="0.45"/>
          <circle cx="3" cy="11" r="0.4" [attr.fill]="color" fill-opacity="0.3"/>
        </ng-container>

        <!-- RUNNING - Corredor 3D dinámico -->
        <ng-container *ngSwitchCase="'running'">
          <!-- Sombra dinámica -->
          <ellipse cx="10" cy="22" rx="5" ry="1" [attr.fill]="color" fill-opacity="0.15"/>
          <!-- Líneas de velocidad -->
          <path d="M21 6H23M20 8.5H22.5M21 11H23" [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.4"/>
          <!-- Cabeza -->
          <circle cx="14" cy="3.5" r="2.5" [attr.fill]="color" fill-opacity="0.35" [attr.stroke]="color" stroke-width="1.5"/>
          <!-- Torso inclinado -->
          <path d="M13 6L9 13" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Brazo trasero -->
          <path d="M11.5 8L7 5.5" [attr.stroke]="color" stroke-width="2" stroke-linecap="round"/>
          <path d="M7 5.5L5 7" [attr.stroke]="color" stroke-width="1.8" stroke-linecap="round"/>
          <!-- Brazo delantero -->
          <path d="M11 10L15.5 12" [attr.stroke]="color" stroke-width="2" stroke-linecap="round"/>
          <path d="M15.5 12L18.5 10" [attr.stroke]="color" stroke-width="1.8" stroke-linecap="round"/>
          <!-- Pierna trasera (extendida) -->
          <path d="M9 13L5 16" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M5 16L2 15" [attr.stroke]="color" stroke-width="2" stroke-linecap="round"/>
          <!-- Zapato trasero -->
          <ellipse cx="1.5" cy="15" rx="1.8" ry="0.8" [attr.fill]="color" fill-opacity="0.5" [attr.stroke]="color" stroke-width="0.8" transform="rotate(-10 1.5 15)"/>
          <!-- Pierna delantera (flexionada) -->
          <path d="M9 13L12 18" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M12 18L15.5 20" [attr.stroke]="color" stroke-width="2" stroke-linecap="round"/>
          <!-- Zapato delantero -->
          <ellipse cx="16.5" cy="20" rx="2" ry="1" [attr.fill]="color" fill-opacity="0.5" [attr.stroke]="color" stroke-width="0.8"/>
          <!-- Detalle de ropa -->
          <path d="M10 10C10.5 11 11 11.5 11.5 11" [attr.stroke]="color" stroke-width="0.8" stroke-opacity="0.4"/>
        </ng-container>

        <!-- BOXEO - Guantes 3D profesional -->
        <ng-container *ngSwitchCase="'boxeo'">
          <!-- Sombra -->
          <ellipse cx="12" cy="22" rx="5" ry="1" [attr.fill]="color" fill-opacity="0.15"/>
          <!-- Guante principal - forma redondeada -->
          <path d="M5 6C5 4 7 2 10 2H14C17 2 19 4 19 6V12C19 16.5 16 20 12 20C8 20 5 16.5 5 12V6Z" 
                [attr.fill]="'url(#grad-v-' + instanceId + ')'" fill-opacity="0.4"/>
          <path d="M5 6C5 4 7 2 10 2H14C17 2 19 4 19 6V12C19 16.5 16 20 12 20C8 20 5 16.5 5 12V6Z" 
                [attr.stroke]="color" stroke-width="1.5" fill="none"/>
          <!-- Pulgar -->
          <path d="M5 8C5 8 3 8 3 10.5C3 13 4.5 14 5.5 14" 
                [attr.fill]="color" fill-opacity="0.3" [attr.stroke]="color" stroke-width="1.3"/>
          <!-- División de dedos -->
          <path d="M8 5V8M11 5V8M14 5V8" [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round"/>
          <!-- Costuras -->
          <path d="M8 10C8 11.5 9.5 12.5 12 12.5C14.5 12.5 16 11.5 16 10" [attr.stroke]="color" stroke-width="1" stroke-opacity="0.5" fill="none"/>
          <!-- Muñequera -->
          <rect x="6.5" y="17" width="11" height="4" rx="2" [attr.fill]="color" fill-opacity="0.35" [attr.stroke]="color" stroke-width="1.2"/>
          <!-- Velcro -->
          <rect x="8" y="18.5" width="8" height="1.5" rx="0.5" [attr.fill]="color" fill-opacity="0.2"/>
          <!-- Brillo -->
          <path d="M15 4C16.5 5 17.5 7 17.5 9" [attr.stroke]="color" stroke-width="1.2" stroke-linecap="round" stroke-opacity="0.35"/>
          <!-- Estrellas de impacto -->
          <g stroke-opacity="0.6">
            <path d="M21 3L22 2M22 4L23 3M21 5L22 4" [attr.stroke]="color" stroke-width="1.2" stroke-linecap="round"/>
            <path d="M20 7L21.5 7" [attr.stroke]="color" stroke-width="1" stroke-linecap="round"/>
          </g>
        </ng-container>

        <!-- CICLISMO - Bicicleta 3D de carrera -->
        <ng-container *ngSwitchCase="'ciclismo'">
          <!-- Sombra -->
          <ellipse cx="12" cy="21.5" rx="9" ry="1" [attr.fill]="color" fill-opacity="0.12"/>
          <!-- Rueda trasera completa -->
          <circle cx="5" cy="15" r="4.5" [attr.stroke]="color" stroke-width="1.5" fill="none"/>
          <circle cx="5" cy="15" r="3.2" [attr.stroke]="color" stroke-width="0.5" stroke-opacity="0.3" fill="none"/>
          <circle cx="5" cy="15" r="1.2" [attr.fill]="color" fill-opacity="0.4" [attr.stroke]="color" stroke-width="0.8"/>
          <!-- Rayos traseros -->
          <line x1="5" y1="10.5" x2="5" y2="13.8" [attr.stroke]="color" stroke-width="0.7"/>
          <line x1="5" y1="16.2" x2="5" y2="19.5" [attr.stroke]="color" stroke-width="0.7"/>
          <line x1="0.5" y1="15" x2="3.8" y2="15" [attr.stroke]="color" stroke-width="0.7"/>
          <line x1="6.2" y1="15" x2="9.5" y2="15" [attr.stroke]="color" stroke-width="0.7"/>
          <line x1="2.2" y1="12.2" x2="4.2" y2="14.2" [attr.stroke]="color" stroke-width="0.6"/>
          <line x1="5.8" y1="15.8" x2="7.8" y2="17.8" [attr.stroke]="color" stroke-width="0.6"/>
          <!-- Rueda delantera completa -->
          <circle cx="19" cy="15" r="4.5" [attr.stroke]="color" stroke-width="1.5" fill="none"/>
          <circle cx="19" cy="15" r="3.2" [attr.stroke]="color" stroke-width="0.5" stroke-opacity="0.3" fill="none"/>
          <circle cx="19" cy="15" r="1.2" [attr.fill]="color" fill-opacity="0.4" [attr.stroke]="color" stroke-width="0.8"/>
          <!-- Rayos delanteros -->
          <line x1="19" y1="10.5" x2="19" y2="13.8" [attr.stroke]="color" stroke-width="0.7"/>
          <line x1="19" y1="16.2" x2="19" y2="19.5" [attr.stroke]="color" stroke-width="0.7"/>
          <line x1="14.5" y1="15" x2="17.8" y2="15" [attr.stroke]="color" stroke-width="0.7"/>
          <line x1="20.2" y1="15" x2="23.5" y2="15" [attr.stroke]="color" stroke-width="0.7"/>
          <!-- Cuadro - tubo superior -->
          <path d="M5 15L10 9L16 9L19 15" [attr.stroke]="color" stroke-width="2" stroke-linejoin="round" fill="none"/>
          <!-- Cuadro - tubo inferior -->
          <path d="M5 15L12 15" [attr.stroke]="color" stroke-width="1.5" fill="none"/>
          <path d="M10 9L12 15" [attr.stroke]="color" stroke-width="1.5" fill="none"/>
          <!-- Sillín -->
          <path d="M10 9L9 5" [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round"/>
          <ellipse cx="9" cy="4.5" rx="2.5" ry="1" [attr.fill]="color" fill-opacity="0.5" [attr.stroke]="color" stroke-width="1"/>
          <!-- Manubrio -->
          <path d="M16 9L17 7L19.5 6" [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M18.5 5L19.5 6L18.5 7" [attr.stroke]="color" stroke-width="1.2" stroke-linecap="round"/>
          <!-- Pedales/cadena área -->
          <circle cx="12" cy="15" r="2" [attr.stroke]="color" stroke-width="1"/>
          <circle cx="12" cy="15" r="0.8" [attr.fill]="color" fill-opacity="0.5"/>
          <!-- Pedales -->
          <line x1="10" y1="15" x2="10" y2="17" [attr.stroke]="color" stroke-width="1"/>
          <line x1="14" y1="15" x2="14" y2="13" [attr.stroke]="color" stroke-width="1"/>
          <rect x="9" y="16.5" width="2" height="1" rx="0.3" [attr.fill]="color" fill-opacity="0.4"/>
          <rect x="13" y="12" width="2" height="1" rx="0.3" [attr.fill]="color" fill-opacity="0.4"/>
        </ng-container>

        <!-- TENIS - Raqueta 3D con pelota -->
        <ng-container *ngSwitchCase="'tenis'">
          <!-- Sombra -->
          <ellipse cx="10" cy="22" rx="5" ry="0.8" [attr.fill]="color" fill-opacity="0.12"/>
          <!-- Marco de la raqueta -->
          <ellipse cx="9" cy="8" rx="6.5" ry="8" [attr.stroke]="color" stroke-width="2" fill="none"/>
          <!-- Relleno del marco -->
          <ellipse cx="9" cy="8" rx="6.5" ry="8" [attr.fill]="color" fill-opacity="0.08"/>
          <!-- Cuerdas horizontales -->
          <line x1="3" y1="4" x2="15" y2="4" [attr.stroke]="color" stroke-width="0.5" stroke-opacity="0.5"/>
          <line x1="2.8" y1="6" x2="15.2" y2="6" [attr.stroke]="color" stroke-width="0.5" stroke-opacity="0.5"/>
          <line x1="2.8" y1="8" x2="15.2" y2="8" [attr.stroke]="color" stroke-width="0.5" stroke-opacity="0.5"/>
          <line x1="2.8" y1="10" x2="15.2" y2="10" [attr.stroke]="color" stroke-width="0.5" stroke-opacity="0.5"/>
          <line x1="3" y1="12" x2="15" y2="12" [attr.stroke]="color" stroke-width="0.5" stroke-opacity="0.5"/>
          <!-- Cuerdas verticales -->
          <line x1="5" y1="1" x2="5" y2="15" [attr.stroke]="color" stroke-width="0.5" stroke-opacity="0.5"/>
          <line x1="7" y1="0.5" x2="7" y2="15.5" [attr.stroke]="color" stroke-width="0.5" stroke-opacity="0.5"/>
          <line x1="9" y1="0" x2="9" y2="16" [attr.stroke]="color" stroke-width="0.5" stroke-opacity="0.5"/>
          <line x1="11" y1="0.5" x2="11" y2="15.5" [attr.stroke]="color" stroke-width="0.5" stroke-opacity="0.5"/>
          <line x1="13" y1="1" x2="13" y2="15" [attr.stroke]="color" stroke-width="0.5" stroke-opacity="0.5"/>
          <!-- Mango -->
          <path d="M13 14L18 19" [attr.stroke]="color" stroke-width="3" stroke-linecap="round"/>
          <path d="M14.5 15.5L19.5 20.5" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round" stroke-opacity="0.6"/>
          <!-- Grip del mango -->
          <line x1="14" y1="15" x2="15" y2="16" [attr.stroke]="color" stroke-width="0.6" stroke-opacity="0.4"/>
          <line x1="15" y1="16" x2="16" y2="17" [attr.stroke]="color" stroke-width="0.6" stroke-opacity="0.4"/>
          <line x1="16" y1="17" x2="17" y2="18" [attr.stroke]="color" stroke-width="0.6" stroke-opacity="0.4"/>
          <line x1="17" y1="18" x2="18" y2="19" [attr.stroke]="color" stroke-width="0.6" stroke-opacity="0.4"/>
          <!-- Pelota de tenis 3D -->
          <circle cx="20" cy="5" r="3.5" [attr.fill]="'url(#grad-' + instanceId + ')'" fill-opacity="0.5"/>
          <circle cx="20" cy="5" r="3.5" [attr.stroke]="color" stroke-width="1.3" fill="none"/>
          <!-- Costuras de la pelota -->
          <path d="M17.5 3C18.5 4.5 18.5 5.5 17.5 7" [attr.stroke]="color" stroke-width="1" fill="none"/>
          <path d="M22.5 3C21.5 4.5 21.5 5.5 22.5 7" [attr.stroke]="color" stroke-width="1" fill="none"/>
          <!-- Brillo de la pelota -->
          <circle cx="18.5" cy="3.5" r="0.8" [attr.fill]="color" fill-opacity="0.2"/>
        </ng-container>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- ═══════════════ UI ICONS - PREMIUM 3D ═══════════════ -->
        <!-- ═══════════════════════════════════════════════════════════════ -->

        <!-- STAR -->
        <ng-container *ngSwitchCase="'star'">
          <path d="M12 2L14.5 8.5L21.5 9.3L16.5 14L18 21L12 17.5L6 21L7.5 14L2.5 9.3L9.5 8.5L12 2Z" 
                [attr.fill]="filled ? 'url(#grad-' + instanceId + ')' : 'none'" 
                [attr.fill-opacity]="filled ? 0.8 : 0"
                [attr.stroke]="color" 
                stroke-width="1.5" 
                stroke-linejoin="round"/>
          <path *ngIf="!filled" d="M12 5L13.5 9L17.5 9.5L14.5 12.5L15.5 16.5L12 14.5L8.5 16.5L9.5 12.5L6.5 9.5L10.5 9L12 5Z" 
                [attr.fill]="color" fill-opacity="0.15"/>
        </ng-container>

        <!-- STAR FILLED -->
        <ng-container *ngSwitchCase="'star-filled'">
          <path d="M12 2L14.5 8.5L21.5 9.3L16.5 14L18 21L12 17.5L6 21L7.5 14L2.5 9.3L9.5 8.5L12 2Z" 
                [attr.fill]="'url(#grad-' + instanceId + ')'"
                [attr.stroke]="color" 
                stroke-width="1"/>
          <!-- Brillo -->
          <path d="M10 5.5L11 7L9 8" [attr.stroke]="color" stroke-width="0.8" stroke-opacity="0.3" fill="none"/>
        </ng-container>

        <!-- USERS -->
        <ng-container *ngSwitchCase="'users'">
          <!-- Usuario principal -->
          <circle cx="9" cy="6" r="3.5" [attr.fill]="color" fill-opacity="0.25" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M2 21C2 16.5 5 14 9 14C13 14 16 16.5 16 21" 
                [attr.fill]="color" fill-opacity="0.2" [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round"/>
          <!-- Usuario secundario (atrás) -->
          <circle cx="17" cy="7" r="2.8" [attr.fill]="color" fill-opacity="0.15" [attr.stroke]="color" stroke-width="1.2" stroke-opacity="0.7"/>
          <path d="M21 21C21 18 19.5 16 17 15" [attr.stroke]="color" stroke-width="1.2" stroke-linecap="round" stroke-opacity="0.7"/>
        </ng-container>

        <!-- CALENDAR -->
        <ng-container *ngSwitchCase="'calendar'">
          <rect x="3" y="5" width="18" height="17" rx="2.5" [attr.fill]="color" fill-opacity="0.12" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M3 10H21" [attr.stroke]="color" stroke-width="1.5"/>
          <!-- Pestañas -->
          <path d="M8 3V7" [attr.stroke]="color" stroke-width="2" stroke-linecap="round"/>
          <path d="M16 3V7" [attr.stroke]="color" stroke-width="2" stroke-linecap="round"/>
          <!-- Días -->
          <rect x="6" y="13" width="2.5" height="2.5" rx="0.5" [attr.fill]="color" fill-opacity="0.3"/>
          <rect x="10.75" y="13" width="2.5" height="2.5" rx="0.5" [attr.fill]="color" fill-opacity="0.3"/>
          <rect x="15.5" y="13" width="2.5" height="2.5" rx="0.5" [attr.fill]="color" fill-opacity="0.3"/>
          <rect x="6" y="17" width="2.5" height="2.5" rx="0.5" [attr.fill]="color" fill-opacity="0.2"/>
          <rect x="10.75" y="17" width="2.5" height="2.5" rx="0.5" [attr.fill]="color" fill-opacity="0.6"/>
        </ng-container>

        <!-- TRENDING UP -->
        <ng-container *ngSwitchCase="'trending-up'">
          <!-- Área bajo la curva -->
          <path d="M2 18L8 12L12 16L22 6V18H2Z" [attr.fill]="color" fill-opacity="0.15"/>
          <!-- Línea principal -->
          <path d="M2 17L8 11L12 15L22 5" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- Flecha -->
          <path d="M16 5H22V11" [attr.stroke]="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </ng-container>

        <!-- ACTIVITY / Pulso -->
        <ng-container *ngSwitchCase="'activity'">
          <!-- Línea del pulso -->
          <path d="M2 12H6L9 4L12 20L15 8L17 12H22" 
                [attr.stroke]="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- Puntos de referencia -->
          <circle cx="9" cy="4" r="1.5" [attr.fill]="color" fill-opacity="0.5"/>
          <circle cx="12" cy="20" r="1.5" [attr.fill]="color" fill-opacity="0.5"/>
          <circle cx="15" cy="8" r="1.5" [attr.fill]="color" fill-opacity="0.5"/>
        </ng-container>

        <!-- DOLLAR -->
        <ng-container *ngSwitchCase="'dollar'">
          <!-- Círculo de fondo -->
          <circle cx="12" cy="12" r="10" [attr.fill]="color" fill-opacity="0.1" [attr.stroke]="color" stroke-width="1.5"/>
          <!-- Símbolo $ -->
          <path d="M12 4V20" [attr.stroke]="color" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M16 7H10C8.5 7 7 8 7 9.5C7 11 8.5 12 10 12H14C15.5 12 17 13 17 14.5C17 16 15.5 17 14 17H7" 
                [attr.stroke]="color" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </ng-container>

        <!-- MAP-PIN -->
        <ng-container *ngSwitchCase="'map-pin'">
          <!-- Sombra -->
          <ellipse cx="12" cy="22" rx="4" ry="1" [attr.fill]="color" fill-opacity="0.2"/>
          <!-- Pin con gradiente -->
          <path d="M12 2C7.5 2 4 5.5 4 10C4 16 12 22 12 22C12 22 20 16 20 10C20 5.5 16.5 2 12 2Z" 
                [attr.fill]="'url(#grad-v-' + instanceId + ')'" fill-opacity="0.3"/>
          <path d="M12 2C7.5 2 4 5.5 4 10C4 16 12 22 12 22C12 22 20 16 20 10C20 5.5 16.5 2 12 2Z" 
                [attr.stroke]="color" stroke-width="1.5"/>
          <!-- Círculo interior -->
          <circle cx="12" cy="10" r="3" [attr.fill]="color" fill-opacity="0.4" [attr.stroke]="color" stroke-width="1.2"/>
          <circle cx="12" cy="10" r="1" [attr.fill]="color"/>
        </ng-container>

        <!-- CHECK -->
        <ng-container *ngSwitchCase="'check'">
          <path d="M4 12L9 17L20 6" [attr.stroke]="color" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </ng-container>

        <!-- CHECK-CIRCLE -->
        <ng-container *ngSwitchCase="'check-circle'">
          <circle cx="12" cy="12" r="10" [attr.fill]="color" fill-opacity="0.15" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M7 12L10 15L17 8" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </ng-container>

        <!-- EYE -->
        <ng-container *ngSwitchCase="'eye'">
          <path d="M2 12C2 12 5.5 5 12 5C18.5 5 22 12 22 12C22 12 18.5 19 12 19C5.5 19 2 12 2 12Z" 
                [attr.fill]="color" fill-opacity="0.1" [attr.stroke]="color" stroke-width="1.5"/>
          <circle cx="12" cy="12" r="4" [attr.fill]="color" fill-opacity="0.25" [attr.stroke]="color" stroke-width="1.5"/>
          <circle cx="12" cy="12" r="2" [attr.fill]="color"/>
          <!-- Reflejo -->
          <circle cx="13.5" cy="10.5" r="1" fill="white" fill-opacity="0.6"/>
        </ng-container>

        <!-- SEARCH -->
        <ng-container *ngSwitchCase="'search'">
          <circle cx="10" cy="10" r="7" [attr.fill]="color" fill-opacity="0.1" [attr.stroke]="color" stroke-width="2"/>
          <path d="M15.5 15.5L21 21" [attr.stroke]="color" stroke-width="3" stroke-linecap="round"/>
          <!-- Brillo del lente -->
          <path d="M6.5 7C7.5 5.5 9 5 10 5" [attr.stroke]="color" stroke-width="1.2" stroke-linecap="round" stroke-opacity="0.4"/>
        </ng-container>

        <!-- ARROW-RIGHT -->
        <ng-container *ngSwitchCase="'arrow-right'">
          <path d="M4 12H20" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M14 6L20 12L14 18" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </ng-container>

        <!-- ARROW-LEFT -->
        <ng-container *ngSwitchCase="'arrow-left'">
          <path d="M20 12H4" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M10 6L4 12L10 18" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </ng-container>

        <!-- CHEVRON-RIGHT -->
        <ng-container *ngSwitchCase="'chevron-right'">
          <path d="M9 5L16 12L9 19" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </ng-container>

        <!-- CHEVRON-LEFT -->
        <ng-container *ngSwitchCase="'chevron-left'">
          <path d="M15 5L8 12L15 19" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </ng-container>

        <!-- MESSAGE -->
        <ng-container *ngSwitchCase="'message'">
          <path d="M4 4H20C21 4 22 5 22 6V16C22 17 21 18 20 18H8L4 22V6C4 5 5 4 6 4" 
                [attr.fill]="color" fill-opacity="0.15" [attr.stroke]="color" stroke-width="1.5"/>
          <!-- Líneas de texto -->
          <line x1="8" y1="9" x2="16" y2="9" [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="8" y1="13" x2="13" y2="13" [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round"/>
        </ng-container>

        <!-- PHONE -->
        <ng-container *ngSwitchCase="'phone'">
          <path d="M5 4H9L11 9L8.5 10.5C9.57 12.67 11.33 14.43 13.5 15.5L15 13L20 15V19C20 20 19 21 18 21C9.72 20.42 3.58 14.28 3 6C3 5 4 4 5 4Z" 
                [attr.fill]="color" fill-opacity="0.2" [attr.stroke]="color" stroke-width="1.5" stroke-linejoin="round"/>
          <!-- Ondas de señal -->
          <path d="M15 3C17.5 3 19.5 5 19.5 7.5" [attr.stroke]="color" stroke-width="1.3" stroke-linecap="round" stroke-opacity="0.6"/>
          <path d="M15 6C16.5 6 17.5 7 17.5 8.5" [attr.stroke]="color" stroke-width="1.3" stroke-linecap="round" stroke-opacity="0.4"/>
        </ng-container>

        <!-- SHIELD -->
        <ng-container *ngSwitchCase="'shield'">
          <path d="M12 2L4 6V11C4 16.5 7.5 21.5 12 23C16.5 21.5 20 16.5 20 11V6L12 2Z" 
                [attr.fill]="'url(#grad-v-' + instanceId + ')'" fill-opacity="0.25"/>
          <path d="M12 2L4 6V11C4 16.5 7.5 21.5 12 23C16.5 21.5 20 16.5 20 11V6L12 2Z" 
                [attr.stroke]="color" stroke-width="1.5" stroke-linejoin="round"/>
          <!-- Check interno -->
          <path d="M8 11L11 14L16 9" [attr.stroke]="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </ng-container>

        <!-- CREDIT-CARD -->
        <ng-container *ngSwitchCase="'credit-card'">
          <rect x="2" y="4" width="20" height="16" rx="2.5" [attr.fill]="color" fill-opacity="0.12" [attr.stroke]="color" stroke-width="1.5"/>
          <rect x="2" y="9" width="20" height="3" [attr.fill]="color" fill-opacity="0.4"/>
          <!-- Chip -->
          <rect x="5" y="13" width="4" height="3" rx="0.5" [attr.fill]="color" fill-opacity="0.35" [attr.stroke]="color" stroke-width="0.8"/>
          <!-- Número -->
          <path d="M13 16H19" [attr.stroke]="color" stroke-width="1.2" stroke-linecap="round" stroke-opacity="0.5"/>
        </ng-container>

        <!-- BAR-CHART -->
        <ng-container *ngSwitchCase="'bar-chart'">
          <!-- Barra 1 -->
          <rect x="3" y="14" width="4" height="8" rx="1" [attr.fill]="'url(#grad-v-' + instanceId + ')'" fill-opacity="0.5" [attr.stroke]="color" stroke-width="1"/>
          <!-- Barra 2 -->
          <rect x="10" y="8" width="4" height="14" rx="1" [attr.fill]="'url(#grad-v-' + instanceId + ')'" fill-opacity="0.7" [attr.stroke]="color" stroke-width="1"/>
          <!-- Barra 3 -->
          <rect x="17" y="3" width="4" height="19" rx="1" [attr.fill]="'url(#grad-v-' + instanceId + ')'" fill-opacity="0.9" [attr.stroke]="color" stroke-width="1"/>
          <!-- Línea base -->
          <line x1="1" y1="22" x2="23" y2="22" [attr.stroke]="color" stroke-width="1.5"/>
        </ng-container>

        <!-- CLOCK -->
        <ng-container *ngSwitchCase="'clock'">
          <circle cx="12" cy="12" r="10" [attr.fill]="color" fill-opacity="0.1" [attr.stroke]="color" stroke-width="1.5"/>
          <!-- Marcas de hora -->
          <line x1="12" y1="3" x2="12" y2="5" [attr.stroke]="color" stroke-width="1.5"/>
          <line x1="12" y1="19" x2="12" y2="21" [attr.stroke]="color" stroke-width="1.5"/>
          <line x1="3" y1="12" x2="5" y2="12" [attr.stroke]="color" stroke-width="1.5"/>
          <line x1="19" y1="12" x2="21" y2="12" [attr.stroke]="color" stroke-width="1.5"/>
          <!-- Manecillas -->
          <path d="M12 6V12L16 14" [attr.stroke]="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- Centro -->
          <circle cx="12" cy="12" r="1.5" [attr.fill]="color"/>
        </ng-container>

        <!-- AWARD -->
        <ng-container *ngSwitchCase="'award'">
          <circle cx="12" cy="8" r="6" [attr.fill]="'url(#grad-' + instanceId + ')'" fill-opacity="0.3" [attr.stroke]="color" stroke-width="1.5"/>
          <!-- Estrella interior -->
          <path d="M12 4L13 7H16L13.5 9L14.5 12L12 10L9.5 12L10.5 9L8 7H11L12 4Z" [attr.fill]="color" fill-opacity="0.5"/>
          <!-- Cintas -->
          <path d="M8 13L5 22L12 18L19 22L16 13" [attr.stroke]="color" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
          <path d="M8 13L5 22" [attr.fill]="color" fill-opacity="0.2"/>
          <path d="M16 13L19 22L12 18" [attr.fill]="color" fill-opacity="0.15"/>
        </ng-container>

        <!-- HEART -->
        <ng-container *ngSwitchCase="'heart'">
          <path d="M12 21C12 21 3 14 3 8.5C3 5.5 5.5 3 8.5 3C10.5 3 12 4 12 4C12 4 13.5 3 15.5 3C18.5 3 21 5.5 21 8.5C21 14 12 21 12 21Z" 
                [attr.fill]="filled ? 'url(#grad-' + instanceId + ')' : 'none'" 
                [attr.fill-opacity]="filled ? 0.8 : 0"
                [attr.stroke]="color" stroke-width="1.5" stroke-linejoin="round"/>
          <path *ngIf="!filled" d="M12 19C12 19 5 13 5 9C5 6.5 7 5 9 5C10.5 5 11.5 5.5 12 6" 
                [attr.fill]="color" fill-opacity="0.15"/>
        </ng-container>

        <!-- FIRE -->
        <ng-container *ngSwitchCase="'fire'">
          <!-- Llama exterior -->
          <path d="M12 22C17 22 20 18 20 13.5C20 10 18 7 15.5 5C15.5 8 13.5 10 11.5 10C11.5 7 10.5 4 8 2C6 5 4 8 4 11C4 11 4 11.5 4 12C4 17.5 7.5 22 12 22Z" 
                [attr.fill]="'url(#grad-v-' + instanceId + ')'" fill-opacity="0.4" [attr.stroke]="color" stroke-width="1.5"/>
          <!-- Llama interior -->
          <path d="M12 22C10 22 8.5 19.5 8.5 17C8.5 15 9.5 13.5 11 12.5C11 14 12 15.5 13.5 15.5C13.5 14.5 14 13 12.5 11.5C15 12.5 16 15 16 17C16 19.5 14 22 12 22Z" 
                [attr.fill]="color" fill-opacity="0.5"/>
          <!-- Núcleo -->
          <ellipse cx="12" cy="19" rx="2" ry="2" [attr.fill]="color" fill-opacity="0.25"/>
        </ng-container>

        <!-- TROPHY -->
        <ng-container *ngSwitchCase="'trophy'">
          <!-- Base -->
          <rect x="7" y="20" width="10" height="2" rx="0.5" [attr.fill]="color" fill-opacity="0.4" [attr.stroke]="color" stroke-width="1"/>
          <!-- Pedestal -->
          <path d="M10 17H14V20H10V17Z" [attr.fill]="color" fill-opacity="0.3" [attr.stroke]="color" stroke-width="1"/>
          <!-- Copa -->
          <path d="M6 3H18V9C18 13.5 15.5 17 12 17C8.5 17 6 13.5 6 9V3Z" 
                [attr.fill]="'url(#grad-v-' + instanceId + ')'" fill-opacity="0.35" [attr.stroke]="color" stroke-width="1.5"/>
          <!-- Asas -->
          <path d="M6 5H4C3 5 2 6 2 7.5C2 9 3 10.5 5 10.5H6" [attr.stroke]="color" stroke-width="1.5" fill="none"/>
          <path d="M18 5H20C21 5 22 6 22 7.5C22 9 21 10.5 19 10.5H18" [attr.stroke]="color" stroke-width="1.5" fill="none"/>
          <!-- Estrella -->
          <path d="M12 6L12.8 8.5H15L13 10L14 12.5L12 11L10 12.5L11 10L9 8.5H11.2L12 6Z" [attr.fill]="color" fill-opacity="0.6"/>
        </ng-container>

        <!-- GLOBE -->
        <ng-container *ngSwitchCase="'globe'">
          <circle cx="12" cy="12" r="10" [attr.fill]="color" fill-opacity="0.1" [attr.stroke]="color" stroke-width="1.5"/>
          <ellipse cx="12" cy="12" rx="4" ry="10" [attr.stroke]="color" stroke-width="1.2"/>
          <path d="M2.5 9H21.5" [attr.stroke]="color" stroke-width="1"/>
          <path d="M2 12H22" [attr.stroke]="color" stroke-width="1.2"/>
          <path d="M2.5 15H21.5" [attr.stroke]="color" stroke-width="1"/>
        </ng-container>

        <!-- SMARTPHONE -->
        <ng-container *ngSwitchCase="'smartphone'">
          <rect x="5" y="2" width="14" height="20" rx="3" [attr.fill]="color" fill-opacity="0.1" [attr.stroke]="color" stroke-width="1.5"/>
          <!-- Pantalla -->
          <rect x="7" y="5" width="10" height="13" rx="0.5" [attr.fill]="color" fill-opacity="0.15"/>
          <!-- Notch/speaker -->
          <rect x="10" y="3" width="4" height="1" rx="0.5" [attr.fill]="color" fill-opacity="0.3"/>
          <!-- Home button -->
          <circle cx="12" cy="20" r="1.2" [attr.stroke]="color" stroke-width="1"/>
        </ng-container>

        <!-- BRIEFCASE -->
        <ng-container *ngSwitchCase="'briefcase'">
          <rect x="2" y="7" width="20" height="14" rx="2.5" [attr.fill]="color" fill-opacity="0.15" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M16 7V5C16 4 15 3 14 3H10C9 3 8 4 8 5V7" [attr.stroke]="color" stroke-width="1.5"/>
          <line x1="2" y1="12" x2="22" y2="12" [attr.stroke]="color" stroke-width="1.5"/>
          <!-- Cierre central -->
          <rect x="10" y="10" width="4" height="4" rx="0.5" [attr.fill]="color" fill-opacity="0.4" [attr.stroke]="color" stroke-width="1"/>
        </ng-container>

        <!-- PLUS -->
        <ng-container *ngSwitchCase="'plus'">
          <circle cx="12" cy="12" r="10" [attr.fill]="color" fill-opacity="0.1" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M12 6V18M6 12H18" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round"/>
        </ng-container>

        <!-- MINUS -->
        <ng-container *ngSwitchCase="'minus'">
          <circle cx="12" cy="12" r="10" [attr.fill]="color" fill-opacity="0.1" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M6 12H18" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round"/>
        </ng-container>

        <!-- X / CLOSE -->
        <ng-container *ngSwitchCase="'x'">
          <circle cx="12" cy="12" r="10" [attr.fill]="color" fill-opacity="0.1" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M8 8L16 16M16 8L8 16" [attr.stroke]="color" stroke-width="2" stroke-linecap="round"/>
        </ng-container>

        <!-- MENU -->
        <ng-container *ngSwitchCase="'menu'">
          <path d="M3 6H21M3 12H21M3 18H21" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round"/>
        </ng-container>

        <!-- SETTINGS / GEAR -->
        <ng-container *ngSwitchCase="'settings'">
          <circle cx="12" cy="12" r="3.5" [attr.fill]="color" fill-opacity="0.2" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M12 1V4M12 20V23M4.2 4.2L6.4 6.4M17.6 17.6L19.8 19.8M1 12H4M20 12H23M4.2 19.8L6.4 17.6M17.6 6.4L19.8 4.2" 
                [attr.stroke]="color" stroke-width="2" stroke-linecap="round"/>
        </ng-container>

        <!-- HOME -->
        <ng-container *ngSwitchCase="'home'">
          <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5 5.5 21 6 21H9V15C9 14.5 9.5 14 10 14H14C14.5 14 15 14.5 15 15V21H18C18.5 21 19 20.5 19 20V10M19 10L21 12" 
                [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 21V15C9 14.5 9.5 14 10 14H14C14.5 14 15 14.5 15 15V21" [attr.fill]="color" fill-opacity="0.25"/>
          <!-- Ventana -->
          <rect x="11" y="8" width="2" height="2" rx="0.3" [attr.fill]="color" fill-opacity="0.4"/>
        </ng-container>

        <!-- LOGOUT -->
        <ng-container *ngSwitchCase="'logout'">
          <path d="M9 21H5C4 21 3 20 3 19V5C3 4 4 3 5 3H9" [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M16 17L21 12L16 7" [attr.stroke]="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 12H9" [attr.stroke]="color" stroke-width="2" stroke-linecap="round"/>
        </ng-container>

        <!-- USER -->
        <ng-container *ngSwitchCase="'user'">
          <circle cx="12" cy="7" r="4.5" [attr.fill]="color" fill-opacity="0.2" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M4 21C4 17 7.5 14 12 14C16.5 14 20 17 20 21" 
                [attr.fill]="color" fill-opacity="0.15" [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round"/>
        </ng-container>

        <!-- INFO -->
        <ng-container *ngSwitchCase="'info'">
          <circle cx="12" cy="12" r="10" [attr.fill]="color" fill-opacity="0.15" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M12 16V12" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="12" cy="8" r="1.2" [attr.fill]="color"/>
        </ng-container>

        <!-- WARNING -->
        <ng-container *ngSwitchCase="'warning'">
          <path d="M12 2L2 20H22L12 2Z" [attr.fill]="color" fill-opacity="0.2" [attr.stroke]="color" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M12 9V13" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="12" cy="16.5" r="1.2" [attr.fill]="color"/>
        </ng-container>

        <!-- ERROR -->
        <ng-container *ngSwitchCase="'error'">
          <circle cx="12" cy="12" r="10" [attr.fill]="color" fill-opacity="0.2" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M8 8L16 16M16 8L8 16" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round"/>
        </ng-container>

        <!-- SUCCESS -->
        <ng-container *ngSwitchCase="'success'">
          <circle cx="12" cy="12" r="10" [attr.fill]="color" fill-opacity="0.2" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M7 12L10 15L17 8" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </ng-container>

        <!-- FILTER -->
        <ng-container *ngSwitchCase="'filter'">
          <path d="M2 4H22L14 13V20L10 22V13L2 4Z" [attr.fill]="color" fill-opacity="0.2" [attr.stroke]="color" stroke-width="1.5" stroke-linejoin="round"/>
        </ng-container>

        <!-- DOWNLOAD -->
        <ng-container *ngSwitchCase="'download'">
          <path d="M12 3V15M12 15L7 10M12 15L17 10" [attr.stroke]="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3 17V20C3 21 4 22 5 22H19C20 22 21 21 21 20V17" [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round"/>
        </ng-container>

        <!-- UPLOAD -->
        <ng-container *ngSwitchCase="'upload'">
          <path d="M12 17V5M12 5L7 10M12 5L17 10" [attr.stroke]="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3 17V20C3 21 4 22 5 22H19C20 22 21 21 21 20V17" [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round"/>
        </ng-container>

        <!-- EDIT / PENCIL -->
        <ng-container *ngSwitchCase="'edit'">
          <path d="M16.5 3.5L20.5 7.5L8 20H4V16L16.5 3.5Z" [attr.fill]="color" fill-opacity="0.2" [attr.stroke]="color" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M14 6L18 10" [attr.stroke]="color" stroke-width="1.5"/>
        </ng-container>

        <!-- TRASH -->
        <ng-container *ngSwitchCase="'trash'">
          <path d="M4 6H20M10 11V17M14 11V17" [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M6 6L7 20C7 21 8 22 9 22H15C16 22 17 21 17 20L18 6" [attr.fill]="color" fill-opacity="0.15" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M9 6V4C9 3 10 2 11 2H13C14 2 15 3 15 4V6" [attr.stroke]="color" stroke-width="1.5"/>
        </ng-container>

        <!-- REFRESH -->
        <ng-container *ngSwitchCase="'refresh'">
          <path d="M3 12C3 7 7 3 12 3C16 3 19 5.5 20.5 9" [attr.stroke]="color" stroke-width="2" stroke-linecap="round"/>
          <path d="M21 12C21 17 17 21 12 21C8 21 5 18.5 3.5 15" [attr.stroke]="color" stroke-width="2" stroke-linecap="round"/>
          <path d="M21 4V9H16" [attr.stroke]="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3 20V15H8" [attr.stroke]="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </ng-container>

        <!-- BELL / NOTIFICATION -->
        <ng-container *ngSwitchCase="'bell'">
          <path d="M12 3C8 3 5 6 5 10V15L3 17V18H21V17L19 15V10C19 6 16 3 12 3Z" 
                [attr.fill]="color" fill-opacity="0.2" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M9 18C9 20 10.5 22 12 22C13.5 22 15 20 15 18" [attr.stroke]="color" stroke-width="1.5"/>
          <circle cx="12" cy="3" r="1" [attr.fill]="color"/>
        </ng-container>

        <!-- LOCK -->
        <ng-container *ngSwitchCase="'lock'">
          <rect x="5" y="11" width="14" height="10" rx="2" [attr.fill]="color" fill-opacity="0.2" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M8 11V7C8 4.5 9.8 3 12 3C14.2 3 16 4.5 16 7V11" [attr.stroke]="color" stroke-width="1.5"/>
          <circle cx="12" cy="16" r="2" [attr.fill]="color" fill-opacity="0.5"/>
        </ng-container>

        <!-- CAMERA -->
        <ng-container *ngSwitchCase="'camera'">
          <rect x="2" y="7" width="20" height="13" rx="2" [attr.fill]="color" fill-opacity="0.15" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M7 7L8 4H16L17 7" [attr.stroke]="color" stroke-width="1.5"/>
          <circle cx="12" cy="13" r="4" [attr.fill]="color" fill-opacity="0.2" [attr.stroke]="color" stroke-width="1.5"/>
          <circle cx="12" cy="13" r="2" [attr.fill]="color" fill-opacity="0.4"/>
        </ng-container>

        <!-- PLAY -->
        <ng-container *ngSwitchCase="'play'">
          <circle cx="12" cy="12" r="10" [attr.fill]="color" fill-opacity="0.15" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M10 8L16 12L10 16V8Z" [attr.fill]="color" fill-opacity="0.6" [attr.stroke]="color" stroke-width="1.5" stroke-linejoin="round"/>
        </ng-container>

        <!-- PAUSE -->
        <ng-container *ngSwitchCase="'pause'">
          <circle cx="12" cy="12" r="10" [attr.fill]="color" fill-opacity="0.15" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M9 8V16M15 8V16" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round"/>
        </ng-container>

        <!-- LOCATION (alias de map-pin) -->
        <ng-container *ngSwitchCase="'location'">
          <ellipse cx="12" cy="22" rx="4" ry="1" [attr.fill]="color" fill-opacity="0.2"/>
          <path d="M12 2C7.5 2 4 5.5 4 10C4 16 12 22 12 22C12 22 20 16 20 10C20 5.5 16.5 2 12 2Z" 
                [attr.fill]="'url(#grad-v-' + instanceId + ')'" fill-opacity="0.3" [attr.stroke]="color" stroke-width="1.5"/>
          <circle cx="12" cy="10" r="3" [attr.fill]="color" fill-opacity="0.4" [attr.stroke]="color" stroke-width="1.2"/>
        </ng-container>

        <!-- SHARE -->
        <ng-container *ngSwitchCase="'share'">
          <circle cx="18" cy="5" r="3" [attr.fill]="color" fill-opacity="0.25" [attr.stroke]="color" stroke-width="1.5"/>
          <circle cx="6" cy="12" r="3" [attr.fill]="color" fill-opacity="0.25" [attr.stroke]="color" stroke-width="1.5"/>
          <circle cx="18" cy="19" r="3" [attr.fill]="color" fill-opacity="0.25" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M8.5 10.5L15.5 6.5M8.5 13.5L15.5 17.5" [attr.stroke]="color" stroke-width="1.5"/>
        </ng-container>

        <!-- MAIL -->
        <ng-container *ngSwitchCase="'mail'">
          <rect x="2" y="4" width="20" height="16" rx="2" [attr.fill]="color" fill-opacity="0.15" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M2 6L12 13L22 6" [attr.stroke]="color" stroke-width="1.5" stroke-linejoin="round"/>
        </ng-container>

        <!-- COPY -->
        <ng-container *ngSwitchCase="'copy'">
          <rect x="8" y="8" width="12" height="12" rx="2" [attr.fill]="color" fill-opacity="0.2" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M16 8V6C16 5 15 4 14 4H6C5 4 4 5 4 6V14C4 15 5 16 6 16H8" [attr.stroke]="color" stroke-width="1.5"/>
        </ng-container>

        <!-- LINK -->
        <ng-container *ngSwitchCase="'link'">
          <path d="M10 14C10.5 14.5 11.2 15 12 15C12.8 15 13.5 14.5 14 14L18 10C19 9 19 7 18 6C17 5 15 5 14 6L12.5 7.5" 
                [attr.stroke]="color" stroke-width="2" stroke-linecap="round"/>
          <path d="M14 10C13.5 9.5 12.8 9 12 9C11.2 9 10.5 9.5 10 10L6 14C5 15 5 17 6 18C7 19 9 19 10 18L11.5 16.5" 
                [attr.stroke]="color" stroke-width="2" stroke-linecap="round"/>
        </ng-container>

        <!-- BOOKMARK -->
        <ng-container *ngSwitchCase="'bookmark'">
          <path d="M5 3H19V21L12 15L5 21V3Z" [attr.fill]="color" fill-opacity="0.2" [attr.stroke]="color" stroke-width="1.5" stroke-linejoin="round"/>
        </ng-container>

        <!-- TAG -->
        <ng-container *ngSwitchCase="'tag'">
          <path d="M2 2H12L22 12L12 22L2 12V2Z" [attr.fill]="color" fill-opacity="0.2" [attr.stroke]="color" stroke-width="1.5" stroke-linejoin="round"/>
          <circle cx="7" cy="7" r="2" [attr.fill]="color"/>
        </ng-container>

        <!-- TIMER -->
        <ng-container *ngSwitchCase="'timer'">
          <circle cx="12" cy="13" r="8" [attr.fill]="color" fill-opacity="0.1" [attr.stroke]="color" stroke-width="1.5"/>
          <rect x="10" y="2" width="4" height="3" rx="1" [attr.fill]="color" fill-opacity="0.3" [attr.stroke]="color" stroke-width="1"/>
          <path d="M12 9V13L15 15" [attr.stroke]="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="13" r="1.2" [attr.fill]="color"/>
          <path d="M18 6L20 4M20 5L21 6" [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round"/>
        </ng-container>

        <!-- WIFI -->
        <ng-container *ngSwitchCase="'wifi'">
          <path d="M2 8.5C5.5 5 8.5 3.5 12 3.5C15.5 3.5 18.5 5 22 8.5" [attr.stroke]="color" stroke-width="2" stroke-linecap="round"/>
          <path d="M5 12C7.5 9.5 9.5 8.5 12 8.5C14.5 8.5 16.5 9.5 19 12" [attr.stroke]="color" stroke-width="2" stroke-linecap="round"/>
          <path d="M8.5 15.5C10 14 11 13.5 12 13.5C13 13.5 14 14 15.5 15.5" [attr.stroke]="color" stroke-width="2" stroke-linecap="round"/>
          <circle cx="12" cy="19" r="2" [attr.fill]="color"/>
        </ng-container>

        <!-- MUSCLE / FITNESS -->
        <ng-container *ngSwitchCase="'muscle'">
          <path d="M5 18C5 18 5 14 7 12C9 10 11 9 13 9C13 9 15 9 17 11C19 13 20 16 20 18" 
                [attr.stroke]="color" stroke-width="2" stroke-linecap="round"/>
          <path d="M9 12C9 12 8 10 9 8C10 6 13 5 15 6C17 7 17 9 16 10" 
                [attr.fill]="color" fill-opacity="0.25" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M5 18C4 18 3 17 3 16C3 15 4 14 5 14" [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M20 18C21 18 22 17 22 16C22 15 21 14 20 14" [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round"/>
        </ng-container>

        <!-- BÉISBOL - Pelota con costuras clásicas -->
        <ng-container *ngSwitchCase="'beisbol'">
          <!-- Sombra -->
          <ellipse cx="12" cy="21" rx="5" ry="1" [attr.fill]="color" fill-opacity="0.15"/>
          <!-- Pelota base -->
          <circle cx="12" cy="11" r="9" [attr.fill]="'url(#grad-' + instanceId + ')'" fill-opacity="0.2"/>
          <circle cx="12" cy="11" r="9" [attr.stroke]="color" stroke-width="1.8" fill="none"/>
          <!-- Costuras izquierdas -->
          <path d="M5.5 6C6.5 8 6.5 10 5.5 12C4.5 14 4.5 16 5.5 18" 
                [attr.stroke]="color" stroke-width="1.2" fill="none" stroke-linecap="round"/>
          <path d="M6.5 5.5L5 6.5M6.5 7.5L5 8.5M6.5 9.5L5 10.5M6.5 11.5L5 12.5M5 13.5L6.5 14.5M5 15.5L6.5 16.5" 
                [attr.stroke]="color" stroke-width="0.8" stroke-linecap="round"/>
          <!-- Costuras derechas -->
          <path d="M18.5 6C17.5 8 17.5 10 18.5 12C19.5 14 19.5 16 18.5 18" 
                [attr.stroke]="color" stroke-width="1.2" fill="none" stroke-linecap="round"/>
          <path d="M17.5 5.5L19 6.5M17.5 7.5L19 8.5M17.5 9.5L19 10.5M17.5 11.5L19 12.5M19 13.5L17.5 14.5M19 15.5L17.5 16.5" 
                [attr.stroke]="color" stroke-width="0.8" stroke-linecap="round"/>
          <!-- Brillo -->
          <path d="M8 4C9.5 3 10.5 2.5 12 2.5" [attr.stroke]="color" stroke-width="1.2" stroke-linecap="round" stroke-opacity="0.3"/>
        </ng-container>

        <!-- BASKETBALL - Balón naranja con líneas -->
        <ng-container *ngSwitchCase="'basketball'">
          <!-- Sombra -->
          <ellipse cx="12" cy="21" rx="5" ry="1" [attr.fill]="color" fill-opacity="0.15"/>
          <!-- Pelota base -->
          <circle cx="12" cy="11" r="9" [attr.fill]="'url(#grad-' + instanceId + ')'" fill-opacity="0.25"/>
          <circle cx="12" cy="11" r="9" [attr.stroke]="color" stroke-width="1.8" fill="none"/>
          <!-- Línea horizontal central -->
          <path d="M3 11H21" [attr.stroke]="color" stroke-width="1.3"/>
          <!-- Línea vertical central -->
          <path d="M12 2V20" [attr.stroke]="color" stroke-width="1.3"/>
          <!-- Curvas laterales izquierda -->
          <path d="M8 2.5C5 5 4 8 4 11C4 14 5 17 8 19.5" 
                [attr.stroke]="color" stroke-width="1.2" fill="none"/>
          <!-- Curvas laterales derecha -->
          <path d="M16 2.5C19 5 20 8 20 11C20 14 19 17 16 19.5" 
                [attr.stroke]="color" stroke-width="1.2" fill="none"/>
          <!-- Brillo -->
          <path d="M7 4C8.5 3 10 2.5 11 2.5" [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.3"/>
        </ng-container>

        <!-- SOFTBALL - Similar al béisbol pero más grande -->
        <ng-container *ngSwitchCase="'softball'">
          <!-- Sombra -->
          <ellipse cx="12" cy="21.5" rx="6" ry="1.2" [attr.fill]="color" fill-opacity="0.15"/>
          <!-- Pelota base (más grande) -->
          <circle cx="12" cy="11" r="9.5" [attr.fill]="'url(#grad-' + instanceId + ')'" fill-opacity="0.2"/>
          <circle cx="12" cy="11" r="9.5" [attr.stroke]="color" stroke-width="2" fill="none"/>
          <!-- Costuras curvadas distintivas del softball -->
          <path d="M4 8C6 6 8 5 10 5.5C12 6 14 8 15 10C16 12 16 14 15 16" 
                [attr.stroke]="color" stroke-width="1.3" fill="none" stroke-linecap="round"/>
          <path d="M20 14C18 16 16 17 14 16.5C12 16 10 14 9 12C8 10 8 8 9 6" 
                [attr.stroke]="color" stroke-width="1.3" fill="none" stroke-linecap="round"/>
          <!-- Puntos de costura -->
          <circle cx="5" cy="7" r="0.5" [attr.fill]="color" fill-opacity="0.6"/>
          <circle cx="7" cy="5.5" r="0.5" [attr.fill]="color" fill-opacity="0.6"/>
          <circle cx="9" cy="5" r="0.5" [attr.fill]="color" fill-opacity="0.6"/>
          <circle cx="19" cy="15" r="0.5" [attr.fill]="color" fill-opacity="0.6"/>
          <circle cx="17" cy="16.5" r="0.5" [attr.fill]="color" fill-opacity="0.6"/>
          <circle cx="15" cy="17" r="0.5" [attr.fill]="color" fill-opacity="0.6"/>
          <!-- Brillo -->
          <path d="M7 3C9 2 10.5 1.8 12 2" [attr.stroke]="color" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.25"/>
        </ng-container>

        <!-- Default fallback con estilo premium -->
        <ng-container *ngSwitchDefault>
          <circle cx="12" cy="12" r="10" [attr.fill]="color" fill-opacity="0.1" [attr.stroke]="color" stroke-width="1.5"/>
          <path d="M12 7V12" [attr.stroke]="color" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="12" cy="16" r="1.5" [attr.fill]="color"/>
        </ng-container>

      </ng-container>
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .sport-icon {
      display: block;
      flex-shrink: 0;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
                  filter 0.2s ease;
    }
    :host(:hover) .sport-icon {
      transform: scale(1.08);
    }
    :host(.icon-glow) .sport-icon {
      filter: drop-shadow(0 0 4px currentColor);
    }
  `]
})
export class SportIconComponent implements OnInit {
  @Input() name: string = '';
  @Input() size: number = 24;
  @Input() color: string = 'currentColor';
  @Input() filled: boolean = false;

  instanceId: string = '';

  ngOnInit() {
    // Genera un ID único para los gradientes de esta instancia
    this.instanceId = Math.random().toString(36).substr(2, 9);
  }
}
