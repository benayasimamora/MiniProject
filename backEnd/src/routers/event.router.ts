import express from "express";
// import { getAllEvents } from "../services/event.services"; // Service dipanggil dari controller
import { 
    getAllEventsController, 
    getEventByIdController,
    createEventController,
    deleteEventController,
    searchEventsController 
} from '../controllers/event.controller'; // Impor semua controller event
import { authGuard, AuthRequestWithUser } from '../middlewares/authGuard'; // authGuard dan AuthRequestWithUser
// import { roleMiddleware } from '../middlewares/role'; // File 'role.ts' tidak disertakan, gunakan roleGuard
import { roleGuard } from '../middlewares/roleGuard';
import { validate } from "../middlewares/validate"; // Untuk validasi input
import { ICreateEvent } from "../interface/event.interface"; // Untuk skema validasi (jika ada)
import { z } from "zod"; // Untuk membuat skema validasi

const router = express.Router();

// Skema validasi untuk membuat event
const CreateEventSchemaValidation = z.object({
    name : z.string().min(3, "Nama event minimal 3 karakter"),
    description : z.string().min(10, "Deskripsi event minimal 10 karakter"),
    category : z.string().min(1, "Kategori tidak boleh kosong"),
    location : z.string().min(3, "Lokasi minimal 3 karakter"),
    paid : z.boolean(),
    price : z.number().min(0, "Harga tidak boleh negatif").optional(), // Opsional jika paid=false
    start_date : z.coerce.date({errorMap: () => ({message: "Format tanggal mulai tidak valid"})}),
    end_date : z.coerce.date({errorMap: () => ({message: "Format tanggal selesai tidak valid"})}),
    total_seats : z.number().int().min(1, "Total kursi minimal 1")
}).refine(data => !data.paid || (data.paid && typeof data.price === 'number' && data.price >= 0), {
    message: "Harga wajib diisi jika event berbayar dan tidak boleh negatif",
    path: ["price"],
}).refine(data => data.end_date > data.start_date, {
    message: "Tanggal selesai harus setelah tanggal mulai",
    path: ["end_date"],
});


// GET /events - Tampilkan semua event (Publik)
router.get('/', getAllEventsController);

// GET /events/search - Cari event berdasarkan keyword (Publik)
router.get('/search', searchEventsController); // Misal: /events/search?keyword=musik

// GET /events/:id - Tampilkan detail event berdasarkan ID (Publik)
router.get('/:id', getEventByIdController);

// POST /events - Buat event baru (Hanya ORGANIZER)
router.post(
    '/', 
    authGuard, 
    roleGuard(['ORGANIZER']), 
    validate(CreateEventSchemaValidation),
    (req, res, next) => createEventController(req as AuthRequestWithUser, res, next) // Cast req
);

// DELETE /events/:id - Hapus event (Hanya ORGANIZER pemilik event)
router.delete(
    '/:id', 
    authGuard, 
    roleGuard(['ORGANIZER']), 
    (req, res, next) => deleteEventController(req as AuthRequestWithUser, res, next) // Cast req
);


// PUT /events/:id - Update event (Hanya ORGANIZER pemilik event)
// (Tambahkan jika diperlukan, dengan validasi dan controller yang sesuai)
// router.put('/:id', authGuard, roleGuard(['ORGANIZER']), validate(UpdateEventSchema), updateEventController);


export default router;