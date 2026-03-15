import { Injectable } from '@angular/core';
import { SmartTableData } from '../data/smart-table';

@Injectable()
export class SmartTableService extends SmartTableData {

  // NOTA: Este servicio contiene datos legacy. En SportCONNECT usamos datos reales de Firebase.
  // Los datos real se cargan desde ClienteFirebaseService y otros servicios Firebase.
  data = [{
    id: 1,
    firstName: 'Demo',
    lastName: 'User',
    username: '@demo',
    email: 'demo@example.com',
    age: '25',
  }, {
    id: 2,
    firstName: 'Test',
    lastName: 'Account',
    username: '@test',
    email: 'test@example.com',
    age: '30',
  }];

  getData() {
    return this.data;
  }
}
