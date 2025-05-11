// src/types/midtrans-client.d.ts

declare module 'midtrans-client' {
    // --- ADDRESS INTERFACE (Used in customer_details) ---
    export interface Address {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
        postal_code?: string;
        country_code?: string; // ISO 3166-1 alpha-3 country code
    }

    // --- SNAP API INTERFACES ---
    export interface SnapTransactionItemDetail {
        id: string;
        price: number;
        quantity: number;
        name: string;
        brand?: string;
        category?: string;
        merchant_name?: string;
        url?: string;
    }

    export interface SnapCreditCardOptions {
        secure?: boolean;
        channel?: 'migs';
        bank?: 'bca' | 'mandiri' | 'cimb' | 'bni' | 'bri' | string; // Allow other bank codes
        installment?: {
            required?: boolean;
            terms?: {
                bni?: number[];
                mandiri?: number[];
                cimb?: number[];
                bca?: number[];
                offline?: number[];
                [key: string]: number[] | undefined; // For other banks
            };
        };
        whitelist_bins?: string[];
        save_card?: boolean; // For one-click or two-clicks payment
        saved_tokens?: Array<{ token_id: string, masked_card: string }>;
        type?: 'authorize'; // If you want to use pre-authorization
    }

    export interface SnapCallbacks {
        finish?: string;
        error?: string;
        pending?: string;
        unfinish?: string; // Alternative to finish
        [key: string]: string | undefined;
    }

    export interface SnapExpiry {
        start_time?: string; // YYYY-MM-DD HH:mm:ss ZZ
        unit?: 'minute' | 'hour' | 'day';
        duration?: number;
    }

    export interface SnapGopayOptions {
        enable_callback?: boolean;
        callback_url?: string;
    }
    
    export interface SnapShopeepayOptions {
        callback_url?: string;
    }

    export interface SnapTransactionParam {
        transaction_details: {
            order_id: string;
            gross_amount: number;
        };
        item_details?: SnapTransactionItemDetail[];
        customer_details?: {
            first_name?: string;
            last_name?: string;
            email?: string;
            phone?: string;
            billing_address?: Address;
            shipping_address?: Address;
        };
        enabled_payments?: string[]; // Array of payment method codes
        credit_card?: SnapCreditCardOptions;
        callbacks?: SnapCallbacks;
        expiry?: SnapExpiry;
        gopay?: SnapGopayOptions;
        shopeepay?: SnapShopeepayOptions;
        // BCA KlikPay, CIMB Clicks, BRI ePay, etc.
        // bca_klikpay?: { type: string; description: string; misc_fee?: number };
        // cimb_clicks?: { description: string; fail_url?: string; success_url?: string };
        // ... other payment specific options
        [key: string]: any; // For other dynamic properties
    }

    export interface SnapTransactionResponse {
        token: string;
        redirect_url: string;
    }

    export class Snap {
        constructor(options: {
            isProduction: boolean;
            serverKey: string;
            clientKey: string;
        });
        createTransaction(
            parameter: SnapTransactionParam
        ): Promise<SnapTransactionResponse>;
        // createTransactionToken(parameter: SnapTransactionParam): Promise<string>; // Alternative
    }

    // --- CORE API INTERFACES ---
    export type MidtransTransactionStatusString =
        | 'authorize'
        | 'capture'
        | 'settlement'
        | 'pending'
        | 'deny'
        | 'cancel'
        | 'expire'
        | 'failure'
        | 'refund'
        | 'partial_refund';

    export interface CoreApiTransactionStatusResponse {
        status_code: string;
        status_message: string;
        transaction_id: string; // Midtrans UUID
        order_id: string;       // Your order ID
        gross_amount: string;   // String representation of number
        currency: string;
        payment_type: string;
        transaction_time: string; // YYYY-MM-DD HH:mm:ss
        transaction_status: MidtransTransactionStatusString;
        fraud_status?: 'accept' | 'challenge' | 'deny';
        settlement_time?: string; // YYYY-MM-DD HH:mm:ss, only if settled
        signature_key?: string; // Only in notification, not direct status check
        // ... other fields depending on payment type (masked_card, bank, va_numbers, etc.)
        [key: string]: any;
    }
    
    export interface CoreApiAction {
        name: string;
        method: string;
        url: string;
    }
    
    export interface CoreApiChargeParamsBase {
        payment_type: string;
        transaction_details: {
            order_id: string;
            gross_amount: number;
        };
        customer_details?: {
            first_name?: string;
            last_name?: string;
            email: string; // Usually required for Core API
            phone?: string;
            billing_address?: Address;
            shipping_address?: Address;
        };
        item_details?: SnapTransactionItemDetail[];
        custom_field1?: string;
        custom_field2?: string;
        custom_field3?: string;
        [key: string]: any;
    }

    // Example for Bank Transfer
    export interface CoreApiBankTransferVa {
        bank: 'bca' | 'permata' | 'bni' | 'bri' | string; // etc.
        va_number: string;
    }
    export interface CoreApiChargeBankTransferParams extends CoreApiChargeParamsBase {
        payment_type: 'bank_transfer';
        bank_transfer: {
            bank: 'bca' | 'permata' | 'bni' | 'bri' | string;
            va_number?: string; // Optional, Midtrans can generate
            free_text?: { // For BCA VA
                inquiry?: Array<{ id: string; en: string }>;
                payment?: Array<{ id: string; en: string }>;
            };
        };
    }
    export interface CoreApiChargeBankTransferResponse extends CoreApiTransactionStatusResponse {
        payment_type: 'bank_transfer';
        va_numbers?: CoreApiBankTransferVa[]; // If multiple VAs returned
        permata_va_number?: string; // Specific for Permata
        bca_va_number?: string;
        bni_va_number?: string;
        bri_va_number?: string;
        // ...
    }

    // Example for GoPay
    export interface CoreApiChargeGoPayParams extends CoreApiChargeParamsBase {
        payment_type: 'gopay';
        gopay: {
            enable_callback?: boolean;
            callback_url?: string;
        }
    }
    export interface CoreApiChargeGoPayResponse extends CoreApiTransactionStatusResponse {
        payment_type: 'gopay';
        actions?: CoreApiAction[]; // QR code URL, deeplink
    }
    
    export interface CoreApiCancelResponse {
        status_code: string;
        status_message: string;
        transaction_id: string;
        order_id: string;
        gross_amount: string;
        currency: string;
        payment_type: string;
        transaction_time: string;
        transaction_status: 'cancel'; // Should be 'cancel'
        fraud_status?: 'accept' | 'challenge' | 'deny';
        [key: string]: any;
    }
    
    export interface CoreApiRefundParams {
        refund_key?: string; // Your unique key for the refund request
        amount?: number;     // Amount to refund (can be partial)
        reason?: string;
        [key: string]: any;
    }

    export interface CoreApiRefundResponse extends CoreApiTransactionStatusResponse {
        refund_chargeback_id?: number;
        refund_amount?: string;
        // ...
    }

    export class CoreApi {
        cancel(midtrans_order_id: string) {
            throw new Error("Method not implemented.");
        }
        constructor(options: {
            isProduction: boolean;
            serverKey: string;
            clientKey: string; // clientKey is often not needed for CoreApi server-side operations
        });

        // Charge method (generic, specific params needed based on payment_type)
        charge(parameter: CoreApiChargeParamsBase | CoreApiChargeBankTransferParams | CoreApiChargeGoPayParams | any ): Promise<CoreApiTransactionStatusResponse | CoreApiChargeBankTransferResponse | CoreApiChargeGoPayResponse | any>;
        
        transaction: {
            status(transactionIdOrOrderId: string): Promise<CoreApiTransactionStatusResponse>;
            // statusb2b(transactionIdOrOrderId: string): Promise<any>; // For B2B transactions
            approve(transactionIdOrOrderId: string): Promise<CoreApiTransactionStatusResponse>;
            deny(transactionIdOrOrderId: string): Promise<CoreApiTransactionStatusResponse>;
            cancel(transactionIdOrOrderId: string): Promise<CoreApiCancelResponse>;
            expire(transactionIdOrOrderId: string): Promise<CoreApiTransactionStatusResponse>;
            refund(transactionIdOrOrderId: string, parameter?: CoreApiRefundParams): Promise<CoreApiRefundResponse>;
            notification(notificationJSON: object): Promise<CoreApiTransactionStatusResponse>; // Use for validating notification
        };
        // card: { // Methods for card registration, tokenization, etc.
        //     register(parameter: any): Promise<any>;
        //     tokenize(parameter: any): Promise<any>;
        //     // ...
        // };
    }

    // Export default jika ada (sesuai cara library di-bundle)
    // Contoh, jika library export class Snap dan CoreApi sebagai named export
    // dan tidak ada default export.
}