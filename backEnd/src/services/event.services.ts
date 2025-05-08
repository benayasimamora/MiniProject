import { PrismaClient } from "@prisma/client";
import { ICreateEvent } from "../interface/event.interface";



const prisma = new PrismaClient();

// a.1 ngambil semua event
export const getAllEvents = async () => {
    const events = await prisma.events.findMany({
        orderBy: {
            created_at: 'desc',
        },
        include: {
            organizer: {
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                    },
                },
            },
        });
    return events;
};

// a.2 untuk event browsing => browse events, filter by category/location, and view event details
export const searchEvents = async (keyword : string) => {
    const trimmed_keyword = keyword.trim();
    
    if (!trimmed_keyword) {
        throw new Error('Keyword tidak boleh kosong.');
    }

    
    const events = await prisma.events.findMany({
        where : {
            OR : [
                {name        : {contains: trimmed_keyword, mode:'insensitive'}},
                {description : {contains: trimmed_keyword, mode:'insensitive'}},
                {category    : {contains: trimmed_keyword, mode:'insensitive'}},
                {location    : {contains: trimmed_keyword, mode:'insensitive'}}
            ],
        },
        orderBy : {
            start_date : 'asc',
        },
        include : {
            organizer :{
                select : {
                    id : true,
                    full_name : true,
                    email : true,
                }
            },
        },
    });
    return events;
}

// a.3 mencari berdasarkan event id-nya
export const getEventbyID = async (id : number) => {
    const event = await prisma.events.findUnique({
        where : {id},
            include :{
                organizer : {
                    select : {
                        id : true,
                        full_name : true,
                        email : true
                    }
                }
            }
    });

    if (!event){
        throw new Error(`event dengan ID ${id} tidak ditemukan`);
    };
    return event;
}


// b.1 membuat event baru
export const createEvent = async (input: ICreateEvent, organizerId: number) => {
    const startDate = typeof input.start_date === 'string' ? new Date(input.start_date) : input.start_date;
    const endDate = typeof input.end_date === 'string' ? new Date(input.end_date) : input.end_date;

    if (isNaN(startDate.getTime())) {
        throw new Error('Format tanggal mulai (start_date) tidak valid.');
    }
    if (isNaN(endDate.getTime())) {
        throw new Error('Format tanggal selesai (end_date) tidak valid.');
    }
    if (startDate >= endDate) {
        throw new Error('Tanggal mulai (start_date) harus sebelum tanggal selesai (end_date).');
    }

    const newEvent = await prisma.events.create({
        data: {
            name: input.name,
            description: input.description,
            category: input.category,
            location: input.location,
            paid: input.paid,
            price: input.price,
            start_date: startDate, // sesuaikan dengan field di Prisma schema
            end_date: endDate,
            total_seats: input.total_seats,
            remaining_seats: input.total_seats,
            organizer_id: organizerId,
        },
        include: {
            organizer: { // ini tergantung nama relasinya di schema
            select: {
                id: true,
                full_name: true,
                email: true,
                },
            },
        },
    });
    return newEvent;
};

// b.2 delete event berdasarkan ID
export const deleteEvent = async (eventId: number, organizerId: number) => {
    const eventToDelete = await prisma.events.findUnique({
        where: { id: eventId },
    });

    if (!eventToDelete) {
        throw new Error(`Event dengan ID ${eventId} tidak ditemukan.`);
    }
    if (eventToDelete.organizer_id !== organizerId) {
        throw new Error('Anda tidak memiliki izin untuk menghapus event ini.');
    }

    await prisma.events.delete({
        where: { id: eventId },
    });

    return { message: `Event dengan ID ${eventId} berhasil dihapus.` };
};