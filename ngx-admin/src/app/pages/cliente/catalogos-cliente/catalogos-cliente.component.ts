import { Component, OnInit } from '@angular/core';
import { ClienteService } from '../../../@core/services/cliente.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

interface Catalogo {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  imagen_url?: string;
  precio?: number;
  disponible: boolean;
  fecha_creacion: Date;
}

@Component({
  selector: 'ngx-catalogos-cliente',
  templateUrl: './catalogos-cliente.component.html',
  styleUrls: ['./catalogos-cliente.component.scss']
})
export class CatalogosClienteComponent implements OnInit {
  catalogos: Catalogo[] = [];
  catalogosFiltrados: Catalogo[] = [];
  loading = false;
  
  // Filtros
  filtroBusqueda = '';
  filtroCategoria = '';
  
  // Categorías disponibles
  categorias = [
    { value: '', label: 'Todas las categorías' },
    { value: 'deportes', label: 'Deportes' },
    { value: 'equipamiento', label: 'Equipamiento' },
    { value: 'suplementos', label: 'Suplementos' },
    { value: 'ropa', label: 'Ropa Deportiva' },
    { value: 'servicios', label: 'Servicios' }
  ];

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.loading = true;
    
    this.clienteService.getCatalogos().pipe(
      catchError(error => {
        console.error('Error al cargar catálogos:', error);
        // Sin mockups - solo datos reales
        return of([]);
      }),
      finalize(() => this.loading = false)
    ).subscribe(data => {
      if (data && Array.isArray(data)) {
        this.catalogos = data;
      } else if (data && data.catalogos) {
        this.catalogos = data.catalogos;
      } else {
        this.catalogos = [];
      }
      this.aplicarFiltros();
    });
  }

  aplicarFiltros(): void {
    this.catalogosFiltrados = this.catalogos.filter(catalogo => {
      const coincideBusqueda = !this.filtroBusqueda || 
        catalogo.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        catalogo.descripcion.toLowerCase().includes(this.filtroBusqueda.toLowerCase());
      
      const coincideCategoria = !this.filtroCategoria || 
        catalogo.categoria === this.filtroCategoria;
      
      return coincideBusqueda && coincideCategoria;
    });
  }

  verDetalle(catalogo: Catalogo): void {
    console.log('Ver detalle de catálogo:', catalogo);
    // TODO: Abrir modal o navegar a detalle
  }

  getCategoriaLabel(categoria: string): string {
    const cat = this.categorias.find(c => c.value === categoria);
    return cat ? cat.label : categoria;
  }
}

