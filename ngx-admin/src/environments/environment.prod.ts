/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.tudominio.com/api/v1', // Cambiar por tu URL de producción
  
  // Firebase Configuration
  firebase: {
    apiKey: 'TU_API_KEY',
    authDomain: 'TU_PROJECT_ID.firebaseapp.com',
    projectId: 'TU_PROJECT_ID',
    storageBucket: 'TU_PROJECT_ID.appspot.com',
    messagingSenderId: 'TU_MESSAGING_SENDER_ID',
    appId: 'TU_APP_ID',
    measurementId: 'TU_MEASUREMENT_ID' // Opcional, solo si usas Analytics
  }
};
