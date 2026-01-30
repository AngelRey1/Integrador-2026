import { Component, OnInit } from '@angular/core';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: 'activo' | 'baneado' | 'pendiente';
  fechaRegistro: Date;
  avatar: string;
  reservas: number;
}

@Component({
  selector: 'app-usuarios-list',
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.scss']
})
export class UsuariosListComponent implements OnInit {
  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  searchTerm = '';
  filterEstado = 'todos';
  
  stats = {
    total: 0,
    activos: 0,
    baneados: 0,
    nuevosEsteMes: 0
  };

  constructor() { }

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    // Datos de demo
    this.usuarios = [
      { id: 1, nombre: 'Juan Pérez', email: 'juan.perez@email.com', rol: 'Cliente', estado: 'activo', fechaRegistro: new Date('2025-11-15'), avatar: '', reservas: 12 },
      { id: 2, nombre: 'María García', email: 'maria.garcia@email.com', rol: 'Cliente', estado: 'activo', fechaRegistro: new Date('2025-12-01'), avatar: '', reservas: 8 },
      { id: 3, nombre: 'Carlos López', email: 'carlos.lopez@email.com', rol: 'Cliente', estado: 'activo', fechaRegistro: new Date('2026-01-05'), avatar: '', reservas: 3 },
      { id: 4, nombre: 'Ana Martínez', email: 'ana.martinez@email.com', rol: 'Cliente', estado: 'baneado', fechaRegistro: new Date('2025-10-20'), avatar: '', reservas: 0 },
      { id: 5, nombre: 'Roberto Sánchez', email: 'roberto.sanchez@email.com', rol: 'Cliente', estado: 'activo', fechaRegistro: new Date('2026-01-10'), avatar: '', reservas: 5 },
      { id: 6, nombre: 'Laura Fernández', email: 'laura.fernandez@email.com', rol: 'Cliente', estado: 'activo', fechaRegistro: new Date('2025-12-15'), avatar: '', reservas: 15 },
      { id: 7, nombre: 'Diego Ramírez', email: 'diego.ramirez@email.com', rol: 'Cliente', estado: 'pendiente', fechaRegistro: new Date('2026-01-20'), avatar: '', reservas: 0 },
      { id: 8, nombre: 'Patricia Vega', email: 'patricia.vega@email.com', rol: 'Cliente', estado: 'activo', fechaRegistro: new Date('2025-11-28'), avatar: '', reservas: 7 },
    ];

    this.calculateStats();
    this.applyFilters();
  }

  calculateStats(): void {
    this.stats.total = this.usuarios.length;
    this.stats.activos = this.usuarios.filter(u => u.estado === 'activo').length;
    this.stats.baneados = this.usuarios.filter(u => u.estado === 'baneado').length;
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    this.stats.nuevosEsteMes = this.usuarios.filter(u => u.fechaRegistro >= thisMonth).length;
  }

  applyFilters(): void {
    this.filteredUsuarios = this.usuarios.filter(u => {
      const matchSearch = u.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchEstado = this.filterEstado === 'todos' || u.estado === this.filterEstado;
      return matchSearch && matchEstado;
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  onFilterChange(estado: string): void {
    this.filterEstado = estado;
    this.applyFilters();
  }

  banUser(usuario: Usuario): void {
    usuario.estado = 'baneado';
    this.calculateStats();
    this.applyFilters();
  }

  unbanUser(usuario: Usuario): void {
    usuario.estado = 'activo';
    this.calculateStats();
    this.applyFilters();
  }

  viewUser(usuario: Usuario): void {
    console.log('Ver usuario:', usuario);
  }
}
