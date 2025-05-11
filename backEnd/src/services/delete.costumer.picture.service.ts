import prisma from '../lib/prisma';
import { cloudinaryRemove } from '../utils/cloudinary'; // Memperbaiki typo claudinary menjadi cloudinary

export const deleteCustomerPictureService = async (userId: number) => {
    const user = await prisma.user.findUnique({ where: { id: userId } }); // Model 'User', bukan 'users'

    if (!user) throw new Error('User tidak ditemukan');
    if (!user.profile_picture) throw new Error('Foto profil belum ada');

    await cloudinaryRemove(user.profile_picture);

    await prisma.user.update({ // Model 'User', bukan 'users'
        where: { id: userId },
        data: { profile_picture: null },
    });

    return { message: 'Foto profil berhasil dihapus' };
};