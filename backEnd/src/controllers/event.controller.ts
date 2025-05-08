import { Request, Response, NextFunction } from "express";
import { getAllEvents, getEventbyID, deleteEvent, createEvent as createEventServiceFunction, searchEvents as searchEventsService } from "../services/event.services";
import { successResponse, errorResponse } from "../utils/response";
import { ICreateEvent } from "../interface/event.interface";
import { error } from "console";

// tampilkan event
export const getAllEventsController = async (req : Request, res : Response): Promise<void> => {
    try {
        const events = await getAllEvents();
        successResponse(res, events, 'Daftar Event Berhasil Diambil');
    } catch(error:any) {
        errorResponse(res, error.message || 'Gagal Mengambil Daftar Event', 500);
    }
};

//  menampilkan event dengan keyword
export const searchEvents = async (req:Request, res:Response, next:NextFunction)=>{
    try {
        const { keyword } = req.query;

        if (!keyword || typeof keyword !== 'string'){
            errorResponse(res, 'Keyword Harus Tersedia', 400);
            return;
        }

        const events = await searchEventsService(keyword);

        successResponse(res, events, 'Pencarian event berhasil');

    } catch(error) {
        console.error(error);
        errorResponse(res, (error as Error).message || 'Gagal mencari event', 500);
    }
}

// membuat event baru
export const createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        if(req.user ?.role != 'ORGANIZER'){
            res.status(403).json({
                success: false,
                message: 'Hanya organizer yang dapat membuat event ya',
            });
            return;
        }

        const input : ICreateEvent = req.body;
        const newEvent = await createEventServiceFunction(input, req.user.id);

        successResponse(res, newEvent, 'Event berhasil dibuat', 201);


    } catch (error : any){
        errorResponse(res, error.message || 'Gagal membuat event', 500);
    }
};


// delete event
export const deleteEventController = async (req: Request, res: Response) => {
    try {
        const eventId = Number(req.params.id);
        const result = await deleteEvent(eventId, req.user!.id);
    
        res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (err: any) {
        res.status(400).json({
            success: false,
            message: err.message || 'Gagal menghapus event',
        });
    }
};

// tampilkan event berdasarkan ID
export const getEventByIdController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ success: false, message: 'ID tidak valid' });
            return;
        }
        const event = await getEventbyID(id);
        successResponse(res, event, 'Detail event berhasil diambil');
    } catch (error: any) {
        errorResponse(res, error.message || 'Gagal mengambil detail event', 404);
    }
};