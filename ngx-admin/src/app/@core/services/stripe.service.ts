import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../../../environments/environment';

// Declaración de Stripe global (se carga desde el CDN)
declare var Stripe: any;

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentResult {
  success: boolean;
  error?: string;
  oxxoVoucher?: {
    number: string;
    expiresAt: Date;
    hostedVoucherUrl?: string;
  };
}

export interface PaymentIntentRequest {
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  description?: string;
  metadata?: {
    reservaId?: string;
    entrenadorId?: string;
    clienteId?: string;
    fecha?: string;
    hora?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripe: any;
  private apiUrl: string;

  constructor(private http: HttpClient) {
    // URL base para Vercel API
    this.apiUrl = environment.stripe?.functionsUrl || 
                  'https://integrador-2026-rho.vercel.app';
    
    // Inicializar Stripe con la clave pública
    if (typeof Stripe !== 'undefined') {
      this.stripe = Stripe(environment.stripe?.publishableKey || 'pk_test_placeholder');
    }
  }

  /**
   * Crear PaymentIntent para pago con OXXO
   */
  createOxxoPaymentIntent(request: PaymentIntentRequest): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(
      `${this.apiUrl}/api/create-oxxo-payment`,
      request
    );
  }

  /**
   * Crear PaymentIntent para pago con tarjeta
   */
  createCardPaymentIntent(request: PaymentIntentRequest): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(
      `${this.apiUrl}/api/create-card-payment`,
      request
    );
  }

  /**
   * Confirmar pago OXXO (genera el voucher)
   */
  async confirmOxxoPayment(clientSecret: string, billingDetails: { name: string; email: string }): Promise<PaymentResult> {
    if (!this.stripe) {
      return {
        success: false,
        error: 'Stripe no está inicializado'
      };
    }

    try {
      const result = await this.stripe.confirmOxxoPayment(clientSecret, {
        payment_method: {
          billing_details: billingDetails
        }
      });

      if (result.error) {
        return {
          success: false,
          error: result.error.message
        };
      }

      // Si fue exitoso, obtener información del voucher
      if (result.paymentIntent) {
        const nextAction = result.paymentIntent.next_action;
        
        if (nextAction && nextAction.oxxo_display_details) {
          return {
            success: true,
            oxxoVoucher: {
              number: nextAction.oxxo_display_details.number,
              expiresAt: new Date(nextAction.oxxo_display_details.expires_after * 1000),
              hostedVoucherUrl: nextAction.oxxo_display_details.hosted_voucher_url
            }
          };
        }
      }

      return {
        success: true
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error al confirmar el pago'
      };
    }
  }

  /**
   * Confirmar pago con tarjeta
   */
  async confirmCardPayment(clientSecret: string, paymentMethodId?: string): Promise<PaymentResult> {
    if (!this.stripe) {
      return {
        success: false,
        error: 'Stripe no está inicializado'
      };
    }

    try {
      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId
      });

      if (result.error) {
        return {
          success: false,
          error: result.error.message
        };
      }

      return {
        success: true
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error al confirmar el pago'
      };
    }
  }

  /**
   * Obtener estado de un PaymentIntent
   */
  getPaymentIntentStatus(paymentIntentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/getPaymentIntentStatus/${paymentIntentId}`);
  }

  /**
   * Cancelar un PaymentIntent
   */
  cancelPaymentIntent(paymentIntentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cancelPaymentIntent`, { paymentIntentId });
  }

  /**
   * Enviar email con instrucciones de pago OXXO
   */
  sendOxxoEmail(data: {
    customerEmail: string;
    customerName: string;
    amount: number;
    oxxoNumber: string;
    expiresAt: number;
    entrenadorNombre?: string;
    fecha?: string;
    hora?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/send-oxxo-email`, data);
  }
}
