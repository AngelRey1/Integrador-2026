import { Component, OnInit } from '@angular/core';

interface Cliente {
  id: number;
  nombre: string;
  avatar: string;
  email: string;
  telefono: string;
  sesiones_totales: number;
  sesiones_completadas: number;
  ultima_sesion: Date;
  notas: string;
}

@Component({
  selector: 'ngx-mis-clientes',
  templateUrl: './mis-clientes.component.html',
  styleUrls: ['./mis-clientes.component.scss']
})
export class MisClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  filtro = '';

  ngOnInit(): void {
    this.clientes = [
      {
        id: 1,
        nombre: 'María González',
        avatar: 'https://i.pravatar.cc/150?img=5',
        email: 'maria@example.com',
        telefono: '+34 612 345 678',
        sesiones_totales: 24,
        sesiones_completadas: 22,
        ultima_sesion: new Date(2025, 10, 10),
        notas: 'Cliente regular, muy comprometida'
      },
      {
        id: 2,
        nombre: 'Carlos Ruiz',
        avatar: 'https://i.pravatar.cc/150?img=12',
        email: 'carlos@example.com',
        telefono: '+34 623 456 789',
        sesiones_totales: 18,
        sesiones_completadas: 17,
        ultima_sesion: new Date(2025, 10, 8),
        notas: 'Enfoque en fuerza'
      }
    ];
  }

  get clientesFiltrados(): Cliente[] {
    if (!this.filtro) return this.clientes;
    return this.clientes.filter(c =>
      c.nombre.toLowerCase().includes(this.filtro.toLowerCase()) ||
      c.email.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  getTasaAsistencia(cliente: Cliente): number {
    return Math.round((cliente.sesiones_completadas / cliente.sesiones_totales) * 100);
  }
}
