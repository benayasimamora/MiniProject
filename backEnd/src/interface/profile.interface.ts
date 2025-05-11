export interface IUpdateProfileInput {
    full_name?: string;
    password?: string;
    profile_picture?: string; // bisa jadi URL atau file, tergantung implementasi
}