export interface ICoupon {
    id: number;
    code: string;
    discount_amount: number;
    expired_at: Date;
}

export interface IRewardResponse {
    point: number;
    coupons: ICoupon[];
}