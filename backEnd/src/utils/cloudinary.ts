<<<<<<< HEAD
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from "cloudinary"; // Tambahkan UploadApiErrorResponse
import * as streamifier from "streamifier";
import { CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } from "../config"; // Pastikan ini diekspor dari config

cloudinary.config({
    cloud_name: CLOUDINARY_NAME || "",
    api_key: CLOUDINARY_KEY || "",
    api_secret: CLOUDINARY_SECRET || "",
});

export function cloudinaryUpload(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream((err, res) => { // res bisa jadi UploadApiResponse atau undefined
        if (err) return reject(err as UploadApiErrorResponse); // Cast err
        if (!res) return reject(new Error("Cloudinary upload failed with no response"));
        resolve(res);
        });

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
}

export function extractPublicIdFromUrl(url: string): string {
    try {
        const parts = url.split("/");
        const publicIdWithExt = parts[parts.length - 1];
        const publicId = publicIdWithExt.split(".")[0];
        return publicId;
    } catch (err) {
        console.error("Error extracting public_id:", err);
        throw new Error("Gagal mengekstrak public_id dari URL");
    }
}

export async function cloudinaryRemove(secure_url: string) {
    const publicId = extractPublicIdFromUrl(secure_url);
    return await cloudinary.uploader.destroy(publicId);
}
=======
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
>>>>>>> 827f6d5d8f0bfb7c4ff81713c36e16f8eb8282a5
