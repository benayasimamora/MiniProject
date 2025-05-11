import { Request, Response, NextFunction } from "express";
import { 
    getAllEvents, 
    getEventbyID, // getEventById lebih konsisten
    deleteEvent as deleteEventService, // Alias agar tidak konflik dengan nama fungsi
    createEvent as createEventService, 
    searchEvents as searchEventsService 
} from "../services/event.services"; // Nama file: event.services.ts
import { successResponse, errorResponse } from "../utils/response";
import { ICreateEvent } from "../interface/event.interface";
// import { error } from "console"; // 'error' dari console tidak digunakan
import { AuthRequestWithUser } from "../middlewares/authGuard"; // Menggunakan interface dari authGuard

// tampilkan semua event
export const getAllEventsController = async (req : Request, res : Response, next: NextFunction): Promise<void> => {
    try {
        const events = await getAllEvents();
        successResponse(res, events, 'Daftar semua event berhasil diambil');
    } catch(error:any) {
        // errorResponse(res, error.message || 'Gagal mengambil daftar event', error.status || 500);
        next(error); // Biarkan errorHandler menangani
    }
};

//  menampilkan event dengan keyword
export const searchEventsController = async (req:Request, res:Response, next:NextFunction)=>{ // nama diubah agar lebih deskriptif
    try {
        const { keyword } = req.query;

        if (!keyword || typeof keyword !== 'string'){
            // errorResponse(res, 'Keyword pencarian harus berupa string dan tidak boleh kosong', 400);
            // return;
            // Jika keyword kosong, mungkin lebih baik kembalikan semua event atau array kosong
            const allEvents = await getAllEvents();
            successResponse(res, allEvents, 'Menampilkan semua event karena keyword tidak ada.');
            return;
        }

        const events = await searchEventsService(keyword);
        if (events.length === 0) {
            successResponse(res, [], `Tidak ada event yang cocok dengan keyword "${keyword}"`);
        } else {
            successResponse(res, events, `Hasil pencarian event untuk keyword "${keyword}"`);
        }

    } catch(error) {
        // console.error("Error in searchEventsController:", error); // Log error server-side
        // errorResponse(res, (error as Error).message || 'Gagal mencari event', 500);
        next(error);
    }
}

// membuat event baru
export const createEventController = async (req: AuthRequestWithUser, res: Response, next: NextFunction): Promise<void> => { // Menggunakan AuthRequestWithUser
    try {
        // Role check sudah dilakukan oleh roleGuard middleware jika rute diproteksi
        // if(req.user?.role !== 'ORGANIZER'){
        //     errorResponse(res, 'Hanya organizer yang dapat membuat event', 403);
        //     return;
        // }

        const input : ICreateEvent = req.body;
        const organizerId = req.user!.user_id; // Ambil user_id dari token
        const newEvent = await createEventService(input, organizerId);

        successResponse(res, newEvent, 'Event berhasil dibuat', 201);

    } catch (error : any){
        // errorResponse(res, error.message || 'Gagal membuat event', error.status || 500);
        next(error);
    }
};

// delete event
export const deleteEventController = async (req: AuthRequestWithUser, res: Response, next: NextFunction) => { // Menggunakan AuthRequestWithUser
    try {
        const eventId = Number(req.params.id);
        if (isNaN(eventId)) {
            // errorResponse(res, 'ID event tidak valid', 400);
            // return;
            throw { status: 400, message: 'ID event tidak valid' };
        }
        const organizerId = req.user!.id; // Ambil user_id dari token (pastikan req.user.id ada, atau user_id)
                                        // Dari authGuard.ts, req.user adalah IJwt { user_id, role }
                                        // Jadi, seharusnya req.user!.user_id

        const result = await deleteEventService(eventId, req.user!.user_id);
    
        successResponse(res, null, result.message, 200); // Tidak ada data yang dikembalikan, cukup pesan
    } catch (err: any) {
        // errorResponse(res, err.message || 'Gagal menghapus event', err.status || 400);
        next(err);
    }
};

// tampilkan event berdasarkan ID
export const getEventByIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            // errorResponse(res, 'ID event tidak valid', 400);
            // return;
            throw { status: 400, message: 'ID event tidak valid' };
        }
        const event = await getEventbyID(id); // getEventById
        successResponse(res, event, 'Detail event berhasil diambil');
    } catch (error: any) {
        // errorResponse(res, error.message || 'Gagal mengambil detail event', error.status || 404);
        next(error);
    }
};