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
        console.warn('Error al cargar catálogos, usando datos mock:', error);
        // Datos mock como fallback
        return of(this.getMockCatalogos());
      }),
      finalize(() => this.loading = false)
    ).subscribe(data => {
      if (data && Array.isArray(data)) {
        this.catalogos = data;
      } else if (data && data.catalogos) {
        this.catalogos = data.catalogos;
      } else {
        this.catalogos = this.getMockCatalogos();
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

  getMockCatalogos(): Catalogo[] {
    return [
      {
        id: 1,
        nombre: 'Plan de Entrenamiento Personalizado',
        descripcion: 'Plan de entrenamiento diseñado específicamente para tus objetivos y nivel de condición física.',
        categoria: 'servicios',
        imagen_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        precio: 1799,
        disponible: true,
        fecha_creacion: new Date('2026-01-01')
      },
      {
        id: 2,
        nombre: 'Kit de Pesas Ajustables',
        descripcion: 'Set completo de pesas ajustables de 2.5kg a 25kg, perfectas para entrenamiento en casa.',
        categoria: 'equipamiento',
        imagen_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop',
        precio: 2699,
        disponible: true,
        fecha_creacion: new Date('2026-01-02')
      },
      {
        id: 3,
        nombre: 'Proteína Whey Premium',
        descripcion: 'Proteína de suero de leche de alta calidad, 2kg. Sabor chocolate.',
        categoria: 'suplementos',
        imagen_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=300&fit=crop',
        precio: 899,
        disponible: true,
        fecha_creacion: new Date('2026-01-03')
      },
      {
        id: 4,
        nombre: 'Clases de Yoga Online',
        descripcion: 'Acceso ilimitado a clases de yoga en línea durante 1 mes.',
        categoria: 'servicios',
        imagen_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
        precio: 549,
        disponible: true,
        fecha_creacion: new Date('2026-01-04')
      },
      {
        id: 5,
        nombre: 'Camiseta Deportiva Técnica',
        descripcion: 'Camiseta transpirable y ligera, ideal para running y entrenamientos intensos.',
        categoria: 'ropa',
        imagen_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
        precio: 449,
        disponible: true,
        fecha_creacion: new Date('2026-01-05')
      },
      {
        id: 6,
        nombre: 'Programa de CrossFit Avanzado',
        descripcion: 'Programa completo de 12 semanas para atletas avanzados de CrossFit.',
        categoria: 'deportes',
        imagen_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop',
        precio: 1449,
        disponible: true,
        fecha_creacion: new Date('2026-01-06')
      }
    ];
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

