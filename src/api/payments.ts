import { apiRequest } from './client';
import type { PricingPlan, Payment, PaymentProvider, PlanKey } from './types';

export function getPricingPlans() {
  return apiRequest<{ plans: PricingPlan[] }>('/payments/pricing');
}

export interface CreatePaymentPayload {
  plan_key: PlanKey;
  provider: PaymentProvider;
  currency: 'RWF' | 'USD';
  listing_id?: string;
  reference_note?: string;
}

export function createPayment(payload: CreatePaymentPayload) {
  return apiRequest<{ payment: Payment; message: string }>('/payments', {
    method: 'POST',
    auth: true,
    body: payload,
  });
}

export function getMyPayments() {
  return apiRequest<{ payments: Payment[] }>('/payments/mine', { auth: true });
}
