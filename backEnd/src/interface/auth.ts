export interface IRegister {
    full_name: string;
    email: string;
    password: string;
    referralCode?: string;
}

export interface ILogin {
    email: string;
    password: string;
}

export interface IJwt {
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