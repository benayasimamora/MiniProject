export type organizer_status = "PENDING" | "APPROVED" | "REJECTED";

export interface IOrganizer {
  organization_name: string;
  organization_email: string;
  phone_number: string;
  website_url?: string;
  address: string;
}

export interface OrganizerProfile {
  id: number;
  user_id: number;
  organization_name: string;
  organization_email: string;
  phone_number: string;
  website_url: string;
  address: string;
  status: organizer_status;
  submitted_at: Date;
  reviewed_at?: Date;
  rejection_reason?: string;
}

export interface OrganizerApplyDTO {
  organization_name: string;
  organization_email: string;
  phone_number: string;
  website_url?: string;
  address: string;
}
