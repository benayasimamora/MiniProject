import { Request } from "express";
import multer, { MulterError } from "multer"; // Tambahkan MulterError
import path from "path";

export function Multer(
    type: "memoryStorage" | "diskStorage" = "memoryStorage",
    filePrefix?: string,
    folderName?: string
    ) {
    const defaultDir = path.join(__dirname, "../../public"); // Pastikan folder public ada di root proyek

    const storage =
        type === "memoryStorage"
        ? multer.memoryStorage()
        : multer.diskStorage({
            destination: (
                req: Request,
                file: Express.Multer.File,
                cb: (err: Error | null, destination: string) => void
            ) => {
                // Pastikan folder tujuan ada, jika tidak, buatlah
                const destFolder = folderName ? path.join(defaultDir, folderName) : defaultDir;
                // fs.mkdirSync(destFolder, { recursive: true }); // Uncomment jika perlu membuat folder otomatis
                cb(null, destFolder);
            },
            filename: (
                req: Request,
                file: Express.Multer.File,
                cb: (err: Error | null, filename: string) => void
            ) => {
                const prefix = filePrefix || "file-";
                const originalNameParts = file.originalname.split(".");
                const fileExtension = originalNameParts[originalNameParts.length - 1];
                const baseName = originalNameParts.slice(0, -1).join("_").replace(/\s+/g, '_'); // Ganti spasi dengan underscore

                cb(null, `${prefix}${Date.now()}-${baseName}.${fileExtension}`);
            },
            });

    return multer({
        storage,
        limits: {
        fileSize: 1 * 1024 * 1024, // 1MB max (1024*1024*1 -> lebih jelas)
        },
        fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            // Berikan error yang lebih spesifik ke Multer
            cb(new MulterError("LIMIT_UNEXPECTED_FILE", "Hanya file gambar yang diperbolehkan"));
        }
        },
    });
}