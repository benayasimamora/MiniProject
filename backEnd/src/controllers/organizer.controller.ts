import { Request, Response, NextFunction } from "express";
import { 
    getAllEvents, 
    getEventbyID, 
    deleteEvent as deleteEventServiceFunction, 
    createEvent as createEventServiceFunction, 
    searchEvents as searchEventsService 
} from "../services/event.services"; // Nama file event.services.ts
import { OrganizerService } from "../services/organizer.service"; // Nama file organizer.services.ts
import { successResponse, errorResponse } from "../utils/response";
import { ICreateEvent } from "../interface/event.interface";
import { AuthRequestWithUser } from "../middlewares/authGuard"; // Untuk req.user yang sudah diautentikasi
import { OrganizerApplyDTO } from "../interface/organizer";
import { Organizer_Status } from "@prisma/client"; // Impor enum
import { OrganizerEmail } from "../services/organizer-email.service"; // Impor email service

export class OrganizerController {
  // --- Metode dari kode asli Anda (awalnya event controller logic) ---
  // tampilkan event (ini sepertinya harusnya di event.controller.ts)
  static async getAllEventsController(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const events = await getAllEvents();
        successResponse(res, events, 'Daftar Event Berhasil Diambil');
    } catch(error:any) {
        next(error);
    }
  }

  //  menampilkan event dengan keyword (ini sepertinya harusnya di event.controller.ts)
  static async searchEvents(req:Request, res:Response, next:NextFunction){
    try {
        const { keyword } = req.query;

        if (!keyword || typeof keyword !== 'string'){
            // Kembalikan semua event jika tidak ada keyword
            const allEvents = await getAllEvents();
            successResponse(res, allEvents, 'Menampilkan semua event karena keyword tidak valid.');
            return;
        }

        const events = await searchEventsService(keyword);
        successResponse(res, events, `Pencarian event untuk "${keyword}" berhasil`);

    } catch(error) {
        next(error);
    }
  }

  // membuat event baru (ini sepertinya harusnya di event.controller.ts dan memerlukan user terautentikasi)
  static async createEvent(req: AuthRequestWithUser, res: Response, next: NextFunction): Promise<void> { // Butuh AuthRequestWithUser
    try {
        // Pengecekan role sudah dilakukan oleh roleGuard jika rute diproteksi
        // if(req.user?.role != 'ORGANIZER'){
        //     throw { status: 403, message: 'Hanya organizer yang dapat membuat event ya'};
        // }

        const input : ICreateEvent = req.body;
        const organizerId = req.user!.user_id; // Ambil ID dari user yang terautentikasi
        const newEvent = await createEventServiceFunction(input, organizerId);

        successResponse(res, newEvent, 'Event berhasil dibuat', 201);

    } catch (error : any){
        next(error);
    }
  }

  // delete event (ini sepertinya harusnya di event.controller.ts dan memerlukan user terautentikasi)
  static async deleteEventController(req: AuthRequestWithUser, res: Response, next: NextFunction) { // Butuh AuthRequestWithUser
    try {
        const eventId = Number(req.params.id);
        if (isNaN(eventId)) {
            throw { status: 400, message: "ID event tidak valid" };
        }
        // Pastikan req.user ada dan memiliki user_id
        const organizerId = req.user!.user_id;
        const result = await deleteEventServiceFunction(eventId, organizerId);
    
        successResponse(res, null, result.message, 200);
    } catch (err: any) {
        next(err);
    }
  }

  // tampilkan event berdasarkan ID (ini sepertinya harusnya di event.controller.ts)
  static async getEventByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw { status: 400, message: "ID event tidak valid" };
        }
        const event = await getEventbyID(id);
        successResponse(res, event, 'Detail event berhasil diambil');
    } catch (error: any) {
        next(error);
    }
  }

  // --- Metode BARU dan yang diperlukan oleh router admin & organizer ---
  static async apply(req: AuthRequestWithUser, res: Response, next: NextFunction) {
    try {
        const userId = req.user!.user_id;
        const dto: OrganizerApplyDTO = req.body;
        const application = await OrganizerService.apply(userId, dto);
        successResponse(res, application, "Pengajuan menjadi organizer berhasil dikirim dan sedang diproses.", 201);
    } catch (error) {
        next(error);
    }
  }

  static async approve(req: Request, res: Response, next: NextFunction) {
    try {
        const userIdToApprove = parseInt(req.params.user_id, 10);
        if (isNaN(userIdToApprove)) {
            throw { status: 400, message: "User ID tidak valid" };
        }
        const updatedApplication = await OrganizerService.transition(userIdToApprove, Organizer_Status.APPROVED);
        successResponse(res, updatedApplication, `User ID ${userIdToApprove} telah disetujui menjadi organizer.`);
    } catch (error) {
        next(error);
    }
  }

  static async reject(req: Request, res: Response, next: NextFunction) {
    try {
        const userIdToReject = parseInt(req.params.user_id, 10);
        if (isNaN(userIdToReject)) {
            throw { status: 400, message: "User ID tidak valid" };
        }
        const { reason } = req.body;
        if (!reason || typeof reason !== 'string' || reason.trim() === '') {
            throw { status: 400, message: "Alasan penolakan wajib diisi" };
        }
        const updatedApplication = await OrganizerService.transition(userIdToReject, Organizer_Status.REJECTED, reason);
        successResponse(res, updatedApplication, `Pengajuan untuk User ID ${userIdToReject} telah ditolak.`);
    } catch (error) {
        next(error);
    }
  }
  
  // BARU: Metode untuk menampilkan profil publik organizer
  static async getPublicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const organizerId = parseInt(req.params.organizerId, 10);
      if (isNaN(organizerId)) {
        throw { status: 400, message: "ID Penyelenggara tidak valid" };
      }
      const profileData = await OrganizerService.getPublicProfile(organizerId);
      successResponse(res, profileData, "Profil publik penyelenggara berhasil diambil.");
    } catch (error) {
      next(error);
    }
  }
}