import { z } from "zod";

export const CreateReviewSchema = z.object({
    rating: z
        .number({
            required_error: "Peringkat wajib diisi",
            invalid_type_error: "Peringkat harus berupa angka"
        })
        .int({ message: "Peringkat harus bilangan bulat"})
        .min(1, { message: "Peringkat minimal harus 1" })
        .max(5, { message: "Peringkat maksimal harus 5" }),
    comment: z
        .string({
            required_error: "Komentar wajib diisi"
        })
        .min(10, { message: "Komentar minimal harus 10 karakter" })
        .max(500, { message: "Komentar tidak boleh melebihi 500 karakter" }),
});