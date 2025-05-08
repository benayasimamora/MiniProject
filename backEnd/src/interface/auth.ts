export interface IRegister {
  full_name: string;
  email: string;
  password: string;
  referral_code?: string;
}

export interface ILogin {
  email: string;
  password: string;
}

export interface JWTPayload {
  user_id: number;
  role: "CUSTOMER" | "ORGANIZER";
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    full_name: string;
    email: string;
    role: "CUSTOMER" | "ORGANIZER";
  };
}
