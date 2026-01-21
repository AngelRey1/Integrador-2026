import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  constructor(private api: ApiService) {}

  // Entrenadores
  buscarEntrenadores(query?: any): Observable<any> {
    return this.api.get('/entrenadores', query);
  }

  getEntrenador(id: number): Observable<any> {
    return this.api.get(`/entrenadores/${id}`);
  }

  // Reservas
  misReservas(): Observable<any> {
    return this.api.get('/cliente/reservas');
  }

  crearReserva(reserva: any): Observable<any> {
    return this.api.post('/cliente/reservas', reserva);
  }

  cancelarReserva(id: number): Observable<any> {
    return this.api.delete(`/cliente/reservas/${id}`);
  }

  reprogramarReserva(id: number, nuevaFecha: any): Observable<any> {
    return this.api.put(`/cliente/reservas/${id}/reprogramar`, nuevaFecha);
  }

  // Pagos
  misPagos(): Observable<any> {
    return this.api.get('/cliente/pagos');
  }

  getPago(id: number): Observable<any> {
    return this.api.get(`/cliente/pagos/${id}`);
  }

  // Reseñas
  misResenas(): Observable<any> {
    return this.api.get('/cliente/resenas');
  }

  crearResena(resena: any): Observable<any> {
    return this.api.post('/cliente/resenas', resena);
  }

  actualizarResena(id: number, resena: any): Observable<any> {
    return this.api.put(`/cliente/resenas/${id}`, resena);
  }

  eliminarResena(id: number): Observable<any> {
    return this.api.delete(`/cliente/resenas/${id}`);
  }

  // Perfil
  getPerfil(): Observable<any> {
    return this.api.get('/cliente/perfil');
  }

  actualizarPerfil(perfil: any): Observable<any> {
    return this.api.put('/cliente/perfil', perfil);
  }

  // Dashboard
  getDashboardStats(): Observable<any> {
    return this.api.get('/cliente/dashboard');
  }

  // Catálogos
  getCatalogos(): Observable<any> {
    return this.api.get('/cliente/catalogos');
  }

  getCatalogo(id: number): Observable<any> {
    return this.api.get(`/cliente/catalogos/${id}`);
  }
}
