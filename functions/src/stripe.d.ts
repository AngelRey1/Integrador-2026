// Declaración de tipos para Stripe
// Este archivo ayuda a TypeScript a encontrar los tipos del módulo stripe
declare module 'stripe' {
  import Stripe from 'stripe/types';
  export = Stripe;
  export default Stripe;
}
