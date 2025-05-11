import prisma from '../lib/prisma';
import { cloudinaryUpload, cloudinaryRemove } from '../utils/cloudinary'; // Memperbaiki typo claudinary

export async function updatePictureService(userId: number, file: Express.Multer.File) {
    let uploadedUrl = ''; // Untuk menyimpan URL jika terjadi error setelah upload

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } }); // Model 'User', bukan 'users'
        if (!user) throw new Error('User tidak ditemukan');

        // Simpan URL lama jika ada, untuk menghapus jika update berhasil
        const oldPictureUrl = user.profile_picture;

        // Upload dulu di luar transaction
        const { secure_url } = await cloudinaryUpload(file);
        uploadedUrl = secure_url; // Simpan URL baru

        // Update database di dalam transaction (meskipun hanya satu operasi, ini pola yang baik)
        await prisma.$transaction(async (tx) => {
        await tx.user.update({ // Model 'User', bukan 'users'
            where: { id: userId },
            data: { profile_picture: secure_url, updated_at: new Date() },
        });
        });

        // Jika ada foto lama dan upload berhasil, hapus foto lama dari Cloudinary
        if (oldPictureUrl) {
            try {
                await cloudinaryRemove(oldPictureUrl);
            } catch (removeError) {
                console.error("Gagal menghapus foto lama dari Cloudinary:", removeError);
                // Tidak perlu throw error utama, cukup log saja
            }
        }

        return { message: 'Foto profil berhasil diupdate', secure_url };
    } catch (error) {
        // Jika error terjadi SETELAH file diupload ke Cloudinary tapi SEBELUM DB update,
        // maka kita perlu menghapus file yang baru diupload dari Cloudinary (rollback).
        if (uploadedUrl && !(error instanceof Error && error.message.includes("Foto profil berhasil diupdate"))) {
            try {
                await cloudinaryRemove(uploadedUrl);
                console.log("Rollback: Berhasil menghapus file dari Cloudinary karena error DB.");
            } catch (rollbackError) {
                console.error("Gagal melakukan rollback file dari Cloudinary:", rollbackError);
            }
        }
        throw error; // Lemparkan error asli
    }
}