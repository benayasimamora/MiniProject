import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } from "../config";

cloudinary.config({
  cloud_name: CLOUDINARY_NAME!,
  api_key: CLOUDINARY_KEY!,
  api_secret: CLOUDINARY_SECRET!,
});

export async function uploadToCloudinary(file: Express.Multer.File) {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: "profile_picture",
    resource_type: "image",
  });
  return result;
}
