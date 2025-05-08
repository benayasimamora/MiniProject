export type transaction_status =
  | "WAITING_PAYMENT"
  | "WAITING_CONFIRMATION"
  | "CONFIRMED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELED";

export interface ICheckout {
  event_id: number;
  ticket_types_id: number;
  quantity: number;
  usePoint?: number;
  coupon_code?: string;
  voucher_code?: string;
  payment_proof?: string;
}

export interface ITransaction {
  id: number;
  user_id: number;
  event_id: number;
  status: transaction_status;
  total_amount: number;
  used_point: number;
  used_point_id: number;
  used_voucher_id: number;
  payment_proof: string;
  created_at: Date;
}

export interface ITransaction_Detail {
  id: number;
  transaction_id: number;
  ticket_type_id: number;
  quantity: number;
}
