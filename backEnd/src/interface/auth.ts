export interface IRegister {
    full_name: string;
    email: string;
    password: string;
    referralCode?: string;
    is_verified: boolean;
}

export interface ILogin {
    email: string;
    password: string;
}

export interface IJwt {
    id: any;
    user_id: number;
    role: "CUSTOMER" | "ORGANIZER";
}

export interface AuthResponse {
    accessToken: string;
    user: {
        id: number;
        full_name: string;
        email: string;
        role: "CUSTOMER" | "ORGANIZER";
    }
}

export interface IEmail_Verification_Response {
    success: boolean;
    message: string;
    rewarded_points?: number;
}