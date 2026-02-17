import { Injectable } from '@angular/core';

export interface DatosRecibo {
  numero: string;
  fecha: Date;
  cliente: {
    nombre: string;
    email?: string;
  };
  entrenador: {
    nombre: string;
    especialidad?: string;
  };
  sesion: {
    fecha: Date;
    hora: string;
    duracion: number;
    modalidad: string;
    ubicacion?: string;
  };
  pago: {
    subtotal: number;
    comision?: number;
    total: number;
    metodoPago: string;
    estado: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReciboService {

  generarRecibo(datos: DatosRecibo): void {
    const html = this.crearHTMLRecibo(datos);
    this.descargarPDF(html, `Recibo_${datos.numero}.html`);
  }

  private crearHTMLRecibo(datos: DatosRecibo): string {
    const fechaFormateada = this.formatearFecha(datos.fecha);
    const fechaSesion = this.formatearFecha(datos.sesion.fecha);
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Recibo ${datos.numero} - Sportconnecta</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      color: #333;
    }
    
    .recibo {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #00D09C 0%, #00B589 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    
    .logo {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    
    .logo-icon {
      font-size: 32px;
      margin-right: 8px;
    }
    
    .recibo-titulo {
      font-size: 14px;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .recibo-numero {
      font-size: 24px;
      font-weight: 600;
      margin-top: 10px;
    }
    
    .content {
      padding: 30px;
    }
    
    .seccion {
      margin-bottom: 25px;
    }
    
    .seccion-titulo {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #888;
      margin-bottom: 10px;
      border-bottom: 1px solid #eee;
      padding-bottom: 5px;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px dashed #eee;
    }
    
    .info-row:last-child {
      border-bottom: none;
    }
    
    .info-label {
      color: #666;
    }
    
    .info-value {
      font-weight: 500;
      color: #333;
    }
    
    .total-row {
      background: #f8fafb;
      padding: 15px;
      border-radius: 8px;
      margin-top: 15px;
    }
    
    .total-row .info-label {
      font-weight: 600;
      color: #333;
    }
    
    .total-row .info-value {
      font-size: 24px;
      font-weight: 700;
      color: #00D09C;
    }
    
    .estado-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .estado-completado {
      background: #dcfce7;
      color: #16a34a;
    }
    
    .estado-pendiente {
      background: #fef3c7;
      color: #d97706;
    }
    
    .footer {
      text-align: center;
      padding: 20px 30px 30px;
      background: #f8fafb;
      font-size: 12px;
      color: #888;
    }
    
    .footer a {
      color: #00D09C;
      text-decoration: none;
    }
    
    .print-btn {
      display: block;
      width: 100%;
      padding: 15px;
      background: #00D09C;
      color: white;
      border: none;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 20px;
      border-radius: 8px;
    }
    
    .print-btn:hover {
      background: #00B589;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .recibo {
        box-shadow: none;
      }
      .print-btn {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="recibo">
    <div class="header">
      <div class="logo">
        <span class="logo-icon">🏃</span>
        Sportconnecta
      </div>
      <div class="recibo-titulo">Comprobante de Pago</div>
      <div class="recibo-numero">${datos.numero}</div>
    </div>
    
    <div class="content">
      <div class="seccion">
        <div class="seccion-titulo">Información General</div>
        <div class="info-row">
          <span class="info-label">Fecha de emisión</span>
          <span class="info-value">${fechaFormateada}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Estado</span>
          <span class="info-value">
            <span class="estado-badge ${datos.pago.estado === 'COMPLETADO' ? 'estado-completado' : 'estado-pendiente'}">
              ${datos.pago.estado}
            </span>
          </span>
        </div>
      </div>
      
      <div class="seccion">
        <div class="seccion-titulo">Cliente</div>
        <div class="info-row">
          <span class="info-label">Nombre</span>
          <span class="info-value">${datos.cliente.nombre}</span>
        </div>
        ${datos.cliente.email ? `
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">${datos.cliente.email}</span>
        </div>
        ` : ''}
      </div>
      
      <div class="seccion">
        <div class="seccion-titulo">Detalle de la Sesión</div>
        <div class="info-row">
          <span class="info-label">Entrenador</span>
          <span class="info-value">${datos.entrenador.nombre}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Especialidad</span>
          <span class="info-value">${datos.entrenador.especialidad || 'General'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fecha de sesión</span>
          <span class="info-value">${fechaSesion}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Hora</span>
          <span class="info-value">${datos.sesion.hora}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Duración</span>
          <span class="info-value">${datos.sesion.duracion} min</span>
        </div>
        <div class="info-row">
          <span class="info-label">Modalidad</span>
          <span class="info-value">${datos.sesion.modalidad}</span>
        </div>
        ${datos.sesion.ubicacion ? `
        <div class="info-row">
          <span class="info-label">Ubicación</span>
          <span class="info-value">${datos.sesion.ubicacion}</span>
        </div>
        ` : ''}
      </div>
      
      <div class="seccion">
        <div class="seccion-titulo">Detalle del Pago</div>
        <div class="info-row">
          <span class="info-label">Subtotal</span>
          <span class="info-value">$${datos.pago.subtotal.toFixed(2)} MXN</span>
        </div>
        ${datos.pago.comision ? `
        <div class="info-row">
          <span class="info-label">Comisión de servicio</span>
          <span class="info-value">$${datos.pago.comision.toFixed(2)} MXN</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Método de pago</span>
          <span class="info-value">${datos.pago.metodoPago}</span>
        </div>
        <div class="info-row total-row">
          <span class="info-label">Total Pagado</span>
          <span class="info-value">$${datos.pago.total.toFixed(2)} MXN</span>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>Gracias por confiar en Sportconnecta</p>
      <p style="margin-top: 8px;">
        ¿Dudas? Contáctanos: <a href="mailto:sportconnecta@gmail.com">sportconnecta@gmail.com</a>
      </p>
      <button class="print-btn" onclick="window.print()">
        📄 Imprimir / Guardar como PDF
      </button>
    </div>
  </div>
</body>
</html>
    `;
  }

  private descargarPDF(html: string, nombreArchivo: string): void {
    // Abrir en nueva ventana para imprimir/guardar como PDF
    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(html);
      ventana.document.close();
    }
  }

  private formatearFecha(fecha: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(fecha);
  }
}
