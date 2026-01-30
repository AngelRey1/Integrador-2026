import { Component, OnInit } from '@angular/core';

interface Entrenador {
  id: string;
  nombre: string;
  email: string;
  especialidad: string;
  estado: 'pendiente' | 'activo' | 'rechazado';
  fechaSolicitud: Date;
  avatar: string;
  rating: number;
  clientes: number;
  documentos: boolean;
  // Datos originales del registro
  originalData?: any;
}

// Interface para usuarios guardados en localStorage (de ngx-admin)
interface UserFromStorage {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  nombreUsuario: string;
  rol: string;
  estado: 'ACTIVO' | 'PENDIENTE' | 'RECHAZADO' | 'SUSPENDIDO';
  fechaRegistro: string;
}

@Component({
  selector: 'app-entrenadores-list',
  templateUrl: './entrenadores-list.component.html',
  styleUrls: ['./entrenadores-list.component.scss']
})
export class EntrenadoresListComponent implements OnInit {
  entrenadores: Entrenador[] = [];
  filteredEntrenadores: Entrenador[] = [];
  filterEstado = 'todos';
  private usersKey = 'fit_users'; // Misma clave que usa ngx-admin

  stats = {
    total: 0,
    pendientes: 0,
    activos: 0,
    rechazados: 0
  };

  constructor() { }

  ngOnInit(): void {
    this.loadEntrenadores();
  }

  loadEntrenadores(): void {
    // Cargar entrenadores de localStorage (registrados en ngx-admin)
    const entrenadoresFromStorage = this.getEntrenadoresFromStorage();
    
    // Datos mock adicionales para el demo
    const mockEntrenadores: Entrenador[] = [
      { id: 'mock-1', nombre: 'Carlos Mendoza', email: 'carlos.mendoza@email.com', especialidad: 'Entrenamiento Funcional', estado: 'pendiente', fechaSolicitud: new Date('2026-01-10'), avatar: '', rating: 0, clientes: 0, documentos: true },
      { id: 'mock-2', nombre: 'Roberto Sánchez', email: 'roberto.sanchez@email.com', especialidad: 'CrossFit', estado: 'activo', fechaSolicitud: new Date('2025-12-01'), avatar: '', rating: 4.8, clientes: 23, documentos: true },
      { id: 'mock-3', nombre: 'Luis Hernández', email: 'luis.hernandez@email.com', especialidad: 'Boxeo', estado: 'activo', fechaSolicitud: new Date('2025-11-15'), avatar: '', rating: 4.9, clientes: 31, documentos: true },
    ];

    // Combinar entrenadores reales (de registro) con los mock
    // Los reales van primero para que se vean los nuevos registros
    this.entrenadores = [...entrenadoresFromStorage, ...mockEntrenadores];

    this.calculateStats();
    this.applyFilters();
  }

  // Obtener entrenadores registrados desde localStorage
  private getEntrenadoresFromStorage(): Entrenador[] {
    try {
      const usersJson = localStorage.getItem(this.usersKey);
      if (!usersJson) return [];
      
      const users: UserFromStorage[] = JSON.parse(usersJson);
      
      // Filtrar solo los que son ENTRENADOR
      return users
        .filter(u => u.rol === 'ENTRENADOR')
        .map(u => this.mapUserToEntrenador(u));
    } catch (e) {
      console.error('Error leyendo usuarios de localStorage:', e);
      return [];
    }
  }

  // Convertir usuario de localStorage a formato Entrenador
  private mapUserToEntrenador(user: UserFromStorage): Entrenador {
    const especialidades = ['Fitness General', 'Entrenamiento Personal', 'CrossFit', 'Yoga', 'Pilates', 'Funcional'];
    const randomEspecialidad = especialidades[Math.floor(Math.random() * especialidades.length)];
    
    return {
      id: user.id,
      nombre: `${user.nombre} ${user.apellido}`.trim() || user.nombreUsuario,
      email: user.email,
      especialidad: randomEspecialidad,
      estado: user.estado === 'PENDIENTE' ? 'pendiente' : 
              user.estado === 'ACTIVO' ? 'activo' : 
              user.estado === 'RECHAZADO' ? 'rechazado' : 'pendiente',
      fechaSolicitud: new Date(user.fechaRegistro),
      avatar: '',
      rating: 0,
      clientes: 0,
      documentos: true,
      originalData: user
    };
  }

  // Guardar cambios de estado en localStorage
  private updateUserInStorage(entrenador: Entrenador, nuevoEstado: 'ACTIVO' | 'PENDIENTE' | 'RECHAZADO'): void {
    try {
      const usersJson = localStorage.getItem(this.usersKey);
      if (!usersJson) return;
      
      const users: UserFromStorage[] = JSON.parse(usersJson);
      const userIndex = users.findIndex(u => u.id === entrenador.id);
      
      if (userIndex !== -1) {
        users[userIndex].estado = nuevoEstado;
        localStorage.setItem(this.usersKey, JSON.stringify(users));
        console.log(`Usuario ${entrenador.email} actualizado a estado: ${nuevoEstado}`);
      }
    } catch (e) {
      console.error('Error actualizando usuario en localStorage:', e);
    }
  }

  calculateStats(): void {
    this.stats.total = this.entrenadores.length;
    this.stats.pendientes = this.entrenadores.filter(e => e.estado === 'pendiente').length;
    this.stats.activos = this.entrenadores.filter(e => e.estado === 'activo').length;
    this.stats.rechazados = this.entrenadores.filter(e => e.estado === 'rechazado').length;
  }

  applyFilters(): void {
    this.filteredEntrenadores = this.entrenadores.filter(e => {
      return this.filterEstado === 'todos' || e.estado === this.filterEstado;
    });
  }

  onFilterChange(estado: string): void {
    this.filterEstado = estado;
    this.applyFilters();
  }

  aprobar(entrenador: Entrenador): void {
    entrenador.estado = 'activo';
    // Guardar cambio en localStorage para que ngx-admin lo reconozca
    this.updateUserInStorage(entrenador, 'ACTIVO');
    this.calculateStats();
    this.applyFilters();
    alert(`✅ ${entrenador.nombre} ha sido aprobado como entrenador.`);
  }

  rechazar(entrenador: Entrenador): void {
    entrenador.estado = 'rechazado';
    // Guardar cambio en localStorage para que ngx-admin lo reconozca
    this.updateUserInStorage(entrenador, 'RECHAZADO');
    this.calculateStats();
    this.applyFilters();
    alert(`❌ ${entrenador.nombre} ha sido rechazado.`);
  }

  // Refrescar lista de entrenadores
  refrescar(): void {
    this.loadEntrenadores();
    alert('📋 Lista de entrenadores actualizada');
  }

  verPerfil(entrenador: Entrenador): void {
    console.log('Ver perfil:', entrenador);
    alert(`👤 Perfil de ${entrenador.nombre}\n\nEmail: ${entrenador.email}\nEspecialidad: ${entrenador.especialidad}\nEstado: ${entrenador.estado}`);
  }

  verDocumentos(entrenador: Entrenador): void {
    console.log('Ver documentos:', entrenador);
    alert(`📄 Documentos de ${entrenador.nombre}\n\n${entrenador.documentos ? '✅ Documentación completa' : '⚠️ Documentación pendiente'}`);
  }
}
