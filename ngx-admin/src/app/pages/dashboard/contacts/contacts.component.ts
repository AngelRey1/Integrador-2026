import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-contacts',
  styleUrls: ['./contacts.component.scss'],
  templateUrl: './contacts.component.html',
})
export class ContactsComponent implements OnInit {

  contacts: any[] = [];
  recent: any[] = [];

  constructor() {}

  ngOnInit() {
    // ℹ️ NOTA: Este componente originalmente usaba UserData (mock service)
    // que devolvía usuarios ficticios (Nick, Eva, Jack, Lee, Alan, Kate)
    // 
    // En una aplicación real, los "contactos" en SportCONNECT son:
    // - Para Clientes: Sus entrenadores (accesibles desde ClienteDashboard)
    // - Para Entrenadores: Sus clientes (accesibles desde EntrenadorDashboard)
    // 
    // Por ahora, este componente está deshabilitado.
    // Si necesitas mostrar contactos reales, consulta ChatFirebaseService.
  }
}
