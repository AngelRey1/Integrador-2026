import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { AdminChatService, ConversacionAdmin, MensajeAdmin } from 'src/app/core/services/admin-chat.service';
import { AdminFirebaseService } from 'src/app/core/services/admin-firebase.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('mensajesContainer') private mensajesContainer!: ElementRef;

  conversaciones: ConversacionAdmin[] = [];
  entrenadores: any[] = [];
  conversacionActiva: ConversacionAdmin | null = null;
  mensajes: MensajeAdmin[] = [];
  nuevoMensaje = '';
  loading = true;
  enviando = false;
  
  // Para iniciar nueva conversación
  mostrarNuevaConversacion = false;
  entrenadorSeleccionado: any = null;
  busquedaEntrenador = '';

  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;

  constructor(
    private chatService: AdminChatService,
    private adminFirebase: AdminFirebaseService,
    private toastr: NbToastrService
  ) { }

  ngOnInit(): void {
    this.cargarConversaciones();
    this.cargarEntrenadores();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  cargarConversaciones(): void {
    this.loading = true;
    const sub = this.chatService.getConversaciones().subscribe(
      (convs: ConversacionAdmin[]) => {
        this.conversaciones = convs;
        this.loading = false;
      },
      (error: Error) => {
        console.error('Error cargando conversaciones:', error);
        this.loading = false;
      }
    );
    this.subscriptions.push(sub);
  }

  cargarEntrenadores(): void {
    const sub = this.adminFirebase.getEntrenadores().subscribe(
      (entrenadores: any[]) => {
        this.entrenadores = entrenadores.filter((e: any) => e.verificado && e.activo);
      }
    );
    this.subscriptions.push(sub);
  }

  get entrenadoresFiltrados(): any[] {
    if (!this.busquedaEntrenador.trim()) return this.entrenadores;
    const busqueda = this.busquedaEntrenador.toLowerCase();
    return this.entrenadores.filter(e => 
      e.nombre?.toLowerCase().includes(busqueda) ||
      e.email?.toLowerCase().includes(busqueda)
    );
  }

  toggleNuevaConversacion(): void {
    this.mostrarNuevaConversacion = !this.mostrarNuevaConversacion;
    this.entrenadorSeleccionado = null;
    this.busquedaEntrenador = '';
  }

  async iniciarConversacion(entrenador: any): Promise<void> {
    try {
      const conversacionId = await this.chatService.obtenerOCrearConversacionAdmin(entrenador.id, entrenador.nombre);
      this.mostrarNuevaConversacion = false;
      
      // Recargar conversaciones y seleccionar la nueva
      this.cargarConversaciones();
      
      // Esperar un momento y seleccionar
      setTimeout(() => {
        const conv = this.conversaciones.find(c => c.id === conversacionId);
        if (conv) {
          this.seleccionarConversacion(conv);
        }
      }, 500);
    } catch (error) {
      console.error('Error iniciando conversación:', error);
      this.toastr.danger('No se pudo iniciar la conversación', 'Error');
    }
  }

  seleccionarConversacion(conversacion: ConversacionAdmin): void {
    this.conversacionActiva = conversacion;
    this.cargarMensajes(conversacion.id!);
    this.chatService.marcarComoLeido(conversacion.id!);
  }

  cargarMensajes(conversacionId: string): void {
    // Cancelar suscripción anterior si existe
    const existingSub = this.subscriptions.find(s => (s as any)._mensajesSub);
    if (existingSub) {
      existingSub.unsubscribe();
      this.subscriptions = this.subscriptions.filter(s => s !== existingSub);
    }

    const sub = this.chatService.getMensajes(conversacionId).subscribe(
      (msgs: MensajeAdmin[]) => {
        const prevLength = this.mensajes.length;
        this.mensajes = msgs;
        if (msgs.length > prevLength) {
          this.shouldScrollToBottom = true;
        }
      },
      (error: Error) => {
        console.error('Error cargando mensajes:', error);
      }
    );
    (sub as any)._mensajesSub = true;
    this.subscriptions.push(sub);
    this.shouldScrollToBottom = true;
  }

  async enviarMensaje(): Promise<void> {
    if (!this.nuevoMensaje.trim() || !this.conversacionActiva?.id || this.enviando) {
      return;
    }

    this.enviando = true;
    const texto = this.nuevoMensaje.trim();
    this.nuevoMensaje = '';

    try {
      await this.chatService.enviarMensaje(this.conversacionActiva.id, texto);
      this.shouldScrollToBottom = true;
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      this.toastr.danger('No se pudo enviar el mensaje', 'Error');
      this.nuevoMensaje = texto;
    } finally {
      this.enviando = false;
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.mensajesContainer) {
        this.mensajesContainer.nativeElement.scrollTop = 
          this.mensajesContainer.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }

  formatearFecha(fecha: Date): string {
    if (!fecha) return '';
    const hoy = new Date();
    const fechaMensaje = new Date(fecha);
    
    if (fechaMensaje.toDateString() === hoy.toDateString()) {
      return fechaMensaje.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    }
    
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    if (fechaMensaje.toDateString() === ayer.toDateString()) {
      return 'Ayer ' + fechaMensaje.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    }
    
    return fechaMensaje.toLocaleDateString('es-MX', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getIniciales(nombre: string): string {
    if (!nombre) return '?';
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
}
