/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  apiUrl: '/api/v1', // Usa proxy en desarrollo

  // Firebase Configuration - SportConecta
  firebase: {
    apiKey: 'AIzaSyBv0bJnFxUGbuz5NUYuuruP35AhNK_O3ko',
    authDomain: 'sportconecta-6d1ce.firebaseapp.com',
    projectId: 'sportconecta-6d1ce',
    storageBucket: 'sportconecta-6d1ce.firebasestorage.app',
    messagingSenderId: '129548411869',
    appId: '1:129548411869:web:63bbd269f0ef7d80c18c34'
  },

  // Stripe Configuration
  // IMPORTANTE: Reemplaza con tus claves reales de Stripe
  // Obtén tus claves en: https://dashboard.stripe.com/apikeys
  stripe: {
    // Clave pública (publishable key) - segura para el frontend
    publishableKey: 'pk_test_51SxfDODedWVOZwp7giJrXakkl5NUMPjOP9uZ6dFJxgm0CJevBt8vgQYLWNsaflSn3VOCj6PBhT0RLyjJYnFQqZuP00HRvBn0Yx',
    // URL del backend para Stripe (Vercel)
    functionsUrl: 'https://integrador-2026-rho.vercel.app',
    // Modo simulado: true = genera vouchers fake, false = usa Stripe real
    simulatedMode: false
  }
};

