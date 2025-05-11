export interface IUser_Profile_Update {
  full_name: string;
  profil_picture_file: Express.Multer.File;
  profil_picture_Url?: string;
}

export interface Change_Password {
  current_password: string;
  new_password: string;
}

export interface Reset_Password_Request {
  email: string;
}

export interface Reset_Password_Confirm {
  token: string;
  new_password: string;
}