import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { AdminChatService, ConversacionAdmin, MensajeAdmin } from '../../../@core/services/admin-chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ngx-chat-admin',
  templateUrl: './chat-admin.component.html',
  styleUrls: ['./chat-admin.component.scss']
})
export class ChatAdminComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('mensajesContainer') private mensajesContainer!: ElementRef;

  conversaciones: ConversacionAdmin[] = [];
  conversacionActiva: ConversacionAdmin | null = null;
  mensajes: MensajeAdmin[] = [];
  nuevoMensaje = '';
  loading = true;
  enviando = false;

  private subscriptions: Subscription[] = [];
  private shouldScrollToBottom = false;

  constructor(
    private chatService: AdminChatService,
    private toastr: NbToastrService
  ) { }

  ngOnInit(): void {
    this.cargarConversaciones();
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
    const sub = this.chatService.getMisConversacionesConAdmin().subscribe(
      convs => {
        this.conversaciones = convs;
        this.loading = false;
        
        // Si hay una conversación, abrirla automáticamente
        if (convs.length > 0 && !this.conversacionActiva) {
          this.seleccionarConversacion(convs[0]);
        }
      },
      error => {
        console.error('Error cargando conversaciones:', error);
        this.loading = false;
      }
    );
    this.subscriptions.push(sub);
  }

  seleccionarConversacion(conversacion: ConversacionAdmin): void {
    this.conversacionActiva = conversacion;
    this.cargarMensajes(conversacion.id!);
    this.chatService.marcarComoLeido(conversacion.id!);
  }

  cargarMensajes(conversacionId: string): void {
    const existingSub = this.subscriptions.find(s => (s as any)._mensajesSub);
    if (existingSub) {
      existingSub.unsubscribe();
      this.subscriptions = this.subscriptions.filter(s => s !== existingSub);
    }

    const sub = this.chatService.getMensajes(conversacionId).subscribe(
      msgs => {
        const prevLength = this.mensajes.length;
        this.mensajes = msgs;
        if (msgs.length > prevLength) {
          this.shouldScrollToBottom = true;
        }
      },
      error => {
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
