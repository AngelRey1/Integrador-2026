/**
 * SportCONNECT Admin - Production Environment Configuration
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

  // Stripe Configuration
  stripe: {
    publishableKey: 'pk_live_51SxfCtDveaissX7wlqYZak9vsK4VMl4P7mByJ9Vvc0outf4QZJhJZv45SlrzxnApslIn0ItzCjXIGQAx3Inkc1Yj00T3Qn9DnD',
    functionsUrl: 'https://sportconnecta-stripe-api.vercel.app',
    simulatedMode: false
  }
};
