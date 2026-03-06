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
    // Clave pública (publishable key) - segura para el frontend
    publishableKey: 'pk_test_51SxfCtDveaissX7we9MZnolhuSFCKdG1ImD40Bvnnig2U2nO01Myqyp12yTq1yTDMz1vh7HlyclRiySaNlK9mMbv00U6oswd0F',
    // URL del backend para Stripe (Vercel)
    functionsUrl: 'https://sportconnecta-stripe-api.vercel.app',
    // Modo simulado: false en producción para usar Stripe real
    simulatedMode: false
  }
};
