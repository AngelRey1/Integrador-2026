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
    publishableKey: 'pk_test_51SxfDODedWVOZwp7nQkcMstSmOPb5QhheyyjmG7UB0ZAv3Tm8QIttkWM58gxOmGKMWKLuhJRxQ71ReIQsn2H8DTt00XPL3kROR',
    functionsUrl: 'https://sportconnecta-stripe-api.vercel.app',
    simulatedMode: false
  }
};
