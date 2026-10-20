/**
 * Ödəniş qatının müqaviləsi.
 * 1-ci mərhələdə yalnız qapıda ödəniş (nağd / kart) işləyir; onlayn kart (yerli ödəniş sistemi)
 * sonrakı mərhələdə bu interfeysi həyata keçirən provayder kimi əlavə olunacaq.
 */

export type PaymentMethodId = "cash-on-delivery" | "card-on-delivery" | "online-card";

export interface OrderLine {
  slug: string;
  name: string;
  quantity: number;
  /** Vahid qiymət, AZN */
  unitPrice: number;
  /** Abunə, əkin/quraşdırma xidməti kimi əlavələr */
  options?: string[];
}

export interface OrderPayload {
  id: string;
  lines: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: "AZN";
  customer: {
    name: string;
    phone: string;
    district: string;
    address: string;
    deliverySlot?: string;
    note?: string;
  };
}

export type PaymentResult =
  | { status: "pending-on-delivery" }
  /** Onlayn ödəniş — istifadəçi ödəniş səhifəsinə yönləndirilir */
  | { status: "redirect"; url: string }
  | { status: "failed"; reason: string };

export interface PaymentProvider {
  id: PaymentMethodId;
  /** false → checkout-da "tezliklə" kimi göstərilir */
  available: boolean;
  createPayment(order: OrderPayload): Promise<PaymentResult>;
  /** Onlayn ödənişin nəticəsini (callback) yoxlamaq üçün */
  verifyPayment?(paymentId: string): Promise<"paid" | "failed" | "pending">;
}
