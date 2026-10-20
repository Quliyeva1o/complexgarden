import type { PaymentMethodId, PaymentProvider } from "./types";

const payOnDelivery = (id: PaymentMethodId): PaymentProvider => ({
  id,
  available: true,
  async createPayment() {
    return { status: "pending-on-delivery" };
  },
});

/**
 * Onlayn kart ödənişi — yerli ödəniş sistemi qoşulana qədər deaktivdir.
 * İnteqrasiya zamanı `createPayment` ödəniş sessiyası yaradıb `redirect` URL-i qaytarmalı,
 * `verifyPayment` isə callback-də statusu yoxlamalıdır.
 */
const onlineCard: PaymentProvider = {
  id: "online-card",
  available: false,
  async createPayment() {
    return { status: "failed", reason: "online-card-not-configured" };
  },
};

export const paymentProviders: Record<PaymentMethodId, PaymentProvider> = {
  "cash-on-delivery": payOnDelivery("cash-on-delivery"),
  "card-on-delivery": payOnDelivery("card-on-delivery"),
  "online-card": onlineCard,
};

export function getPaymentProvider(id: PaymentMethodId): PaymentProvider {
  return paymentProviders[id];
}

export type * from "./types";
