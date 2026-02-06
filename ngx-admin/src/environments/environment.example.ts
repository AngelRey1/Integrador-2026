/**
 * ARCHIVO DE EJEMPLO - Copia este archivo como environment.ts
 * y reemplaza los valores con tus credenciales reales
 */

export const environment = {
  production: false,
  apiUrl: '/api/v1',

  // Firebase Configuration
  // Obtén estos valores en: https://console.firebase.google.com
  // Tu proyecto → Configuración → General → Tus apps → SDK de Firebase
  firebase: {
    apiKey: 'TU_FIREBASE_API_KEY',
    authDomain: 'TU_PROYECTO.firebaseapp.com',
    projectId: 'TU_PROYECTO_ID',
    storageBucket: 'TU_PROYECTO.firebasestorage.app',
    messagingSenderId: 'TU_SENDER_ID',
    appId: 'TU_APP_ID'
  },

  // Stripe Configuration
  // Obtén tus claves en: https://dashboard.stripe.com/apikeys
  stripe: {
    publishableKey: 'pk_test_TU_CLAVE_PUBLICA',
    functionsUrl: '',
    simulatedMode: true
  }
};
