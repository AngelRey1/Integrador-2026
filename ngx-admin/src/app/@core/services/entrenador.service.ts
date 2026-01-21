import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EntrenadorService {
  constructor(private api: ApiService) {}

  // Clases
  misClases(): Observable<any> {
    return this.api.get('/entrenador/clases');
  }

  crearClase(clase: any): Observable<any> {
    return this.api.post('/entrenador/clases', clase);
  }

  actualizarClase(id: number, clase: any): Observable<any> {
    return this.api.put(`/entrenador/clases/${id}`, clase);
  }

  eliminarClase(id: number): Observable<any> {
    return this.api.delete(`/entrenador/clases/${id}`);
  }

  // Calendario y Disponibilidad
  getDisponibilidad(fecha?: string): Observable<any> {
    return this.api.get('/entrenador/disponibilidad', { fecha });
  }

  actualizarDisponibilidad(disponibilidad: any): Observable<any> {
    return this.api.put('/entrenador/disponibilidad', disponibilidad);
  }

  // Clientes
  misClientes(): Observable<any> {
    return this.api.get('/entrenador/clientes');
  }

  getCliente(id: number): Observable<any> {
    return this.api.get(`/entrenador/clientes/${id}`);
  }

  // Ingresos
  getIngresos(fechaInicio?: string, fechaFin?: string): Observable<any> {
    return this.api.get('/entrenador/ingresos', { fechaInicio, fechaFin });
  }

  // Reservas
  getReservas(estado?: string): Observable<any> {
    return this.api.get('/entrenador/reservas', { estado });
  }

  confirmarReserva(id: number): Observable<any> {
    return this.api.put(`/entrenador/reservas/${id}/confirmar`, {});
  }

  cancelarReserva(id: number, motivo?: string): Observable<any> {
    return this.api.put(`/entrenador/reservas/${id}/cancelar`, { motivo });
  }

  // Dashboard
  getDashboardStats(): Observable<any> {
    return this.api.get('/entrenador/dashboard');
  }

  // Perfil
  getPerfil(): Observable<any> {
    return this.api.get('/entrenador/perfil');
  }

  actualizarPerfil(perfil: any): Observable<any> {
    return this.api.put('/entrenador/perfil', perfil);
  }
}
