export interface IReferral {
  id: number;
  referred_id: number;
  referee_id: number;
  created_at: Date;
}

export interface IUserPoint {
  user_id: number;
  amount: number;
  expires_at: Date;
  updated_at: Date;
}

export interface ICoupon {
  id: number;
  user_id: number;
  code: string;
  discount_value: number;
  expires_at: Date;
  is_used: boolean;
  created_at: Date;
}
