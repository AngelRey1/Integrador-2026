/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

export const environment = {
  production: true,
  apiUrl: '/api/v1',

  // Firebase Configuration - SportConecta
  firebase: {
    apiKey: 'AIzaSyBv0bJnFxUGbuz5NUYuuruP35AhNK_O3ko',
    authDomain: 'sportconecta-6d1ce.firebaseapp.com',
    projectId: 'sportconecta-6d1ce',
    storageBucket: 'sportconecta-6d1ce.firebasestorage.app',
    messagingSenderId: '129548411869',
    appId: '1:129548411869:web:63bbd269f0ef7d80c18c34'
  },

  // Stripe Configuration - PRODUCCIÓN
  stripe: {
    // Clave pública LIVE (publishable key) - segura para el frontend
    // ⚠️ REEMPLAZA ESTA CLAVE con tu pk_live_xxx de Stripe Dashboard
    publishableKey: 'pk_live_51SxfCtDveaissX7wlqYZak9vsK4VMl4P7mByJ9Vvc0outf4QZJhJZv45SlrzxnApslIn0ItzCjXIGQAx3Inkc1Yj00T3Qn9DnD',
    // URL del backend para Stripe (Vercel)
    functionsUrl: 'https://sportconnecta-stripe-api.vercel.app',
    // Modo simulado: false en producción para usar Stripe real
    simulatedMode: false
  }
};
