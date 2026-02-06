import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, from, throwError, of } from 'rxjs';
import { switchMap, catchError, map, delay } from 'rxjs/operators';

export interface OxxoPaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  oxxoVoucher: {
    number: string;        // Referencia de pago OXXO
    expiresAt: number;     // Unix timestamp de expiración
    hostedVoucherUrl: string; // URL del voucher hosted por Stripe
  };
}

export interface PaymentIntentRequest {
  amount: number;          // Monto en pesos (ej: 350 = $350 MXN)
  currency: string;        // 'mxn'
  customerEmail: string;
  customerName: string;
  description: string;
  metadata?: {
    reservaId?: string;
    entrenadorId?: string;
    clienteId?: string;
    fecha?: string;
    hora?: string;
  };
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  status?: string;
  oxxoVoucher?: {
    number: string;
    expiresAt: Date;
    hostedVoucherUrl: string;
  };
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripePromise: Promise<Stripe | null>;
  private stripe: Stripe | null = null;
  private simulatedMode: boolean;

  constructor(private http: HttpClient) {
    // Verificar si estamos en modo simulado
    this.simulatedMode = (environment.stripe as any).simulatedMode === true || 
                         !environment.stripe.functionsUrl;
    
    // Inicializar Stripe con la clave pública
    this.stripePromise = loadStripe(environment.stripe.publishableKey);
    this.initStripe();
    
    if (this.simulatedMode) {
      console.log('💳 StripeService: Modo SIMULADO activo (los pagos son de prueba)');
    }
  }

  private async initStripe(): Promise<void> {
    this.stripe = await this.stripePromise;
  }

  /**
   * Generar referencia OXXO simulada (formato real)
   */
  private generateOxxoReference(): string {
    // Formato real de OXXO: 14 dígitos
    const digits = Array.from({ length: 14 }, () => Math.floor(Math.random() * 10)).join('');
    return digits;
  }

  /**
   * Crear un PaymentIntent para OXXO
   * En modo simulado, genera un voucher fake
   */
  createOxxoPaymentIntent(request: PaymentIntentRequest): Observable<any> {
    console.log('createOxxoPaymentIntent llamado, modo simulado:', this.simulatedMode);
    
    if (this.simulatedMode) {
      // Modo simulado - generar datos fake
      const fakePaymentIntentId = 'pi_simulated_' + Math.random().toString(36).substr(2, 24);
      
      console.log('Generando PaymentIntent simulado:', fakePaymentIntentId);
      
      return of({
        clientSecret: 'seti_simulated_' + Math.random().toString(36).substr(2, 24),
        paymentIntentId: fakePaymentIntentId,
        amount: request.amount, // Ya viene en centavos del componente
        currency: 'mxn'
      }).pipe(delay(800)); // Simular latencia de red
    }

    // Modo real - llamar a Vercel API
    return this.http.post<any>(
      `${environment.stripe.functionsUrl}/api/create-oxxo-payment`,
      request
    ).pipe(
      catchError(error => {
        console.error('Error creating OXXO PaymentIntent:', error);
        return throwError(() => new Error(error.error?.message || 'Error al crear el pago OXXO'));
      })
    );
  }

  /**
   * Confirmar el PaymentIntent de OXXO
   * Esto genera el voucher con la referencia de pago
   */
  async confirmOxxoPayment(
    clientSecret: string,
    billingDetails: {
      name: string;
      email: string;
    }
  ): Promise<PaymentResult> {
    console.log('confirmOxxoPayment llamado, modo simulado:', this.simulatedMode);
    
    if (this.simulatedMode) {
      // Modo simulado - generar voucher fake
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3);
      
      // Simular un pequeño delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const voucher = {
        number: this.generateOxxoReference(),
        expiresAt: expiresAt,
        hostedVoucherUrl: '' // En modo simulado no hay URL externa
      };
      
      console.log('Voucher simulado generado:', voucher);
      
      return {
        success: true,
        paymentIntentId: 'pi_simulated_' + Math.random().toString(36).substr(2, 24),
        status: 'requires_action',
        oxxoVoucher: voucher
      };
    }

    // Modo real - usar Stripe SDK
    if (!this.stripe) {
      this.stripe = await this.stripePromise;
    }

    if (!this.stripe) {
      return {
        success: false,
        error: 'Stripe no está inicializado'
      };
    }

    try {
      const { paymentIntent, error } = await this.stripe.confirmOxxoPayment(
        clientSecret,
        {
          payment_method: {
            billing_details: billingDetails
          }
        }
      );

      if (error) {
        console.error('Error confirming OXXO payment:', error);
        return {
          success: false,
          error: error.message || 'Error al confirmar el pago'
        };
      }

      if (paymentIntent) {
        // Extraer información del voucher OXXO
        const oxxoDisplayDetails = (paymentIntent as any).next_action?.oxxo_display_details;
        
        return {
          success: true,
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
          oxxoVoucher: oxxoDisplayDetails ? {
            number: oxxoDisplayDetails.number,
            expiresAt: new Date(oxxoDisplayDetails.expires_after * 1000),
            hostedVoucherUrl: oxxoDisplayDetails.hosted_voucher_url
          } : undefined
        };
      }

      return {
        success: false,
        error: 'No se recibió respuesta del pago'
      };
    } catch (err: any) {
      console.error('Exception confirming OXXO payment:', err);
      return {
        success: false,
        error: err.message || 'Error inesperado al procesar el pago'
      };
    }
  }

  /**
   * Verificar si estamos en modo simulado
   */
  isSimulatedMode(): boolean {
    return this.simulatedMode;
  }

  /**
   * Obtener el estado de un PaymentIntent
   */
  getPaymentIntentStatus(paymentIntentId: string): Observable<{status: string; amount: number}> {
    if (this.simulatedMode) {
      return of({ status: 'requires_action', amount: 0 }).pipe(delay(300));
    }
    return this.http.get<{status: string; amount: number}>(
      `${environment.stripe.functionsUrl}/api/get-payment-status?id=${paymentIntentId}`
    );
  }

  /**
   * Crear un PaymentIntent para tarjeta
   */
  createCardPaymentIntent(request: PaymentIntentRequest): Observable<{clientSecret: string}> {
    if (this.simulatedMode) {
      return of({
        clientSecret: 'seti_simulated_card_' + Math.random().toString(36).substr(2, 24)
      }).pipe(delay(800));
    }

    return this.http.post<{clientSecret: string}>(
      `${environment.stripe.functionsUrl}/api/create-card-payment`,
      request
    ).pipe(
      catchError(error => {
        console.error('Error creating Card PaymentIntent:', error);
        return throwError(() => new Error(error.error?.message || 'Error al procesar el pago'));
      })
    );
  }

  /**
   * Confirmar pago con tarjeta usando Stripe Elements
   */
  async confirmCardPayment(
    clientSecret: string,
    cardElement: any,
    billingDetails: {
      name: string;
      email: string;
    }
  ): Promise<PaymentResult> {
    if (!this.stripe) {
      this.stripe = await this.stripePromise;
    }

    if (!this.stripe) {
      return {
        success: false,
        error: 'Stripe no está inicializado'
      };
    }

    try {
      const { paymentIntent, error } = await this.stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: billingDetails
          }
        }
      );

      if (error) {
        return {
          success: false,
          error: error.message || 'Error al procesar el pago'
        };
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        return {
          success: true,
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status
        };
      }

      return {
        success: false,
        error: 'El pago no fue completado'
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Error inesperado'
      };
    }
  }

  /**
   * Obtener instancia de Stripe (para crear Elements)
   */
  async getStripe(): Promise<Stripe | null> {
    if (!this.stripe) {
      this.stripe = await this.stripePromise;
    }
    return this.stripe;
  }
}
