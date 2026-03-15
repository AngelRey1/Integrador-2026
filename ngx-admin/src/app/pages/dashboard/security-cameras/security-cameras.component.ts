import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NbComponentSize, NbMediaBreakpointsService, NbThemeService } from '@nebular/theme';

@Component({
  selector: 'ngx-security-cameras',
  styleUrls: ['./security-cameras.component.scss'],
  templateUrl: './security-cameras.component.html',
})
export class SecurityCamerasComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  cameras: any[] = [];
  selectedCamera: any;
  isSingleView = false;
  actionSize: NbComponentSize = 'medium';

  constructor(
    private themeService: NbThemeService,
    private breakpointService: NbMediaBreakpointsService,
  ) {}

  ngOnInit() {
    // ℹ️ NOTA: Este componente originalmente usaba SecurityCamerasData (mock service)
    // que devolvía 4 imágenes ficticias de cámaras.
    // 
    // En SportCONNECT, esta funcionalidad no aplica.
    // Si en futuro necesitas:
    // - Video en vivo de entrenamiento
    // - Grabación de sesiones
    // → Crear componentes específicos con WebRTC o similar

    // Responsive layout
    const breakpoints = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(map(([, breakpoint]) => breakpoint.width))
      .subscribe((width: number) => {
        this.actionSize = width > breakpoints.md ? 'medium' : 'small';
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectCamera(camera: any) {
    this.selectedCamera = camera;
    this.isSingleView = true;
  }
}
