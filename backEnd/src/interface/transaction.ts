import { $Enums } from "@prisma/client";

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
  used_point_id: number; // Sepertinya ini tidak digunakan di Prisma schema, User_Points terhubung ke user_id
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

export interface ITransactionOutput {
    id: number;
    user_id: number;
    event_id: number;
    status: $Enums.transaction_status;
    gross_amount: number;
    net_amount: number;
    used_point_amount: number;
    used_coupon_id: number | null;
    used_voucher_id: number | null;
    midtrans_snap_token: string | null;
    payment_due_date: Date | null;
    created_at: Date | null; // Allow null for created_at
    details: {
        ticket_type_id: number;
        quantity: number;
        price_per_ticket: number;
        subtotal: number;
    }[];
}