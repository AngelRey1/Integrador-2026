import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { AdminFirebaseService, Usuario as UsuarioFirebase } from '../../../../core/services/admin-firebase.service';
import { Subscription } from 'rxjs';

interface Usuario {
  id: string;
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
export class UsuariosListComponent implements OnInit, OnDestroy {
  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  searchTerm = '';
  filterEstado = 'todos';
  loading = true;

  stats = {
    total: 0,
    activos: 0,
    baneados: 0,
    nuevosEsteMes: 0
  };

  private subscription: Subscription | null = null;

  constructor(
    private adminFirebase: AdminFirebaseService,
    private toastr: NbToastrService
  ) { }

  ngOnInit(): void {
    this.loadUsuarios();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadUsuarios(): void {
    this.loading = true;
    this.subscription = this.adminFirebase.getUsuarios().subscribe(usuarios => {
      this.usuarios = usuarios.map(u => this.convertirUsuario(u));
      this.calculateStats();
      this.applyFilters();
      this.loading = false;
    });
  }

  private convertirUsuario(u: UsuarioFirebase): Usuario {
    const fechaRegistro = u.fechaRegistro instanceof Date
      ? u.fechaRegistro
      : u.fechaRegistro
        ? new Date((u.fechaRegistro as any)?.seconds * 1000)
        : new Date();

    return {
      id: u.id || '',
      nombre: `${u.nombre} ${u.apellidoPaterno}`,
      email: u.email,
      rol: u.tipo === 'cliente' ? 'Cliente' : u.tipo === 'entrenador' ? 'Entrenador' : 'Admin',
      estado: u.activo ? 'activo' : 'baneado',
      fechaRegistro: fechaRegistro,
      avatar: u.fotoUrl || '',
      reservas: 0
    };
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

  async banUser(usuario: Usuario): Promise<void> {
    const result = await this.adminFirebase.desactivarUsuario(usuario.id);
    if (result.success) {
      this.toastr.success('Usuario baneado', 'Éxito');
    } else {
      this.toastr.danger(result.message, 'Error');
    }
  }

  async unbanUser(usuario: Usuario): Promise<void> {
    const result = await this.adminFirebase.activarUsuario(usuario.id);
    if (result.success) {
      this.toastr.success('Usuario activado', 'Éxito');
    } else {
      this.toastr.danger(result.message, 'Error');
    }
  }

  viewUser(usuario: Usuario): void {
    console.log('Ver usuario:', usuario);
  }
}

