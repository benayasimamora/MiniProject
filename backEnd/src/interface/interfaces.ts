export interface IRegisterInput {
    full_name: string;
    email: string;
    password: string;
    role: 'CUSTOMER' | 'ORGANIZER';
    referral_code?: string;
    is_verified: boolean;
}

export interface ILoginInput {
    email: string;
    password: string;
}

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

export interface IUpdateProfileInput {
    full_name?: string;
    password?: string;
    profile_picture?: string; // bisa jadi URL atau file, tergantung implementasi
}

export interface AuthRequest extends Request {
    user?: IUserPayload;
}

export interface IUserPayload {
    id: number;
    email: string;
    role: 'CUSTOMER' | 'ORGANIZER';
}


declare global {
    namespace Express {
        interface Request {
            user?: IUserPayload;
        }
    }
}
