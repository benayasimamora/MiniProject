import { PrismaClient } from "@prisma/client"; // Tidak perlu, prisma sudah diimpor dari lib
import prisma from "../lib/prisma";
import { ICreateEvent } from "../interface/event.interface";

// a.1 ngambil semua event
export const getAllEvents = async () => {
  const events = await prisma.event.findMany({
    orderBy: {
      created_at: "desc",
    },
    include: {
      organizer: { // Ini adalah relasi ke User model dengan alias organizer
        select: {
          id: true,
          full_name: true, // Dari model User
          email: true,     // Dari model User
          organizer_profile: { // Ambil nama organisasi dari profil
            select: {
                organization_name: true,
            }
          }
        },
      },
    },
  });
  return events;
};

// a.2 untuk event browsing => browse events, filter by category/location, and view event details
export const searchEvents = async (keyword: string) => {
  const trimmed_keyword = keyword.trim();

  if (!trimmed_keyword) {
    // Sebaiknya kembalikan semua event atau array kosong daripada throw error
    // throw new Error("Keyword tidak boleh kosong.");
    return getAllEvents(); // Atau return [];
  }

  const events = await prisma.event.findMany({
    where: {
      OR: [
        { name: { contains: trimmed_keyword, mode: "insensitive" } },
        { description: { contains: trimmed_keyword, mode: "insensitive" } },
        { category: { contains: trimmed_keyword, mode: "insensitive" } },
        { location: { contains: trimmed_keyword, mode: "insensitive" } },
        // Mungkin juga cari berdasarkan nama organizer
        { organizer: { full_name: { contains: trimmed_keyword, mode: "insensitive" }}},
        { organizer: { organizer_profile: { organization_name: {contains: trimmed_keyword, mode: "insensitive"}}}},
      ],
    },
    orderBy: {
      start_date: "asc",
    },
    include: {
      organizer: {
        select: {
          id: true,
          full_name: true,
          email: true,
           organizer_profile: {
            select: {
                organization_name: true,
            }
          }
        },
      },
    },
  });
  return events;
};

// a.3 mencari berdasarkan event id-nya
export const getEventbyID = async (id: number) => { // getEventById lebih konsisten
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: {
        select: {
          id: true,
          full_name: true,
          email: true,
           organizer_profile: {
            select: {
                organization_name: true,
            }
          }
        },
      },
      // Mungkin ingin menyertakan reviews juga
      reviews: { // Tambahkan ini jika ingin menampilkan ulasan di detail event
        select: {
            id: true,
            rating: true,
            comment: true,
            created_at: true,
            user: {
                select: {
                    full_name: true,
                    profile_picture: true,
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
      }
    },
  });

  if (!event) {
    // Sebaiknya throw error dengan status agar bisa ditangkap di controller
    const error = new Error(`Event dengan ID ${id} tidak ditemukan`);
    (error as any).status = 404;
    throw error;
  }
  return event;
};

// b.1 membuat event baru
export const createEvent = async (input: ICreateEvent, organizerId: number) => {
  // Validasi tanggal seharusnya dilakukan di schema Zod atau di controller
  const startDate =
    typeof input.start_date === "string"
      ? new Date(input.start_date)
      : input.start_date;
  const endDate =
    typeof input.end_date === "string"
      ? new Date(input.end_date)
      : input.end_date;

  if (isNaN(startDate.getTime())) {
    const error = new Error("Format tanggal mulai (start_date) tidak valid.");
    (error as any).status = 400;
    throw error;
  }
  if (isNaN(endDate.getTime())) {
    const error = new Error("Format tanggal selesai (end_date) tidak valid.");
    (error as any).status = 400;
    throw error;
  }
  if (startDate >= endDate) {
    const error = new Error(
      "Tanggal mulai (start_date) harus sebelum tanggal selesai (end_date)."
    );
    (error as any).status = 400;
    throw error;
  }
  if (input.price < 0) {
    const error = new Error("Harga tidak boleh negatif.");
    (error as any).status = 400;
    throw error;
  }
    if (input.total_seats <= 0) {
    const error = new Error("Total kursi harus lebih dari 0.");
    (error as any).status = 400;
    throw error;
  }


  const newEvent = await prisma.event.create({
    data: {
      name: input.name,
      description: input.description,
      category: input.category,
      location: input.location,
      paid: input.paid,
      price: input.paid ? input.price : 0, // Jika tidak berbayar, harga 0
      start_date: startDate,
      end_date: endDate,
      total_seats: input.total_seats,
      remaining_seats: input.total_seats, // Awalnya remaining_seats sama dengan total_seats
      organizer_id: organizerId,
    },
    include: {
      organizer: {
        select: {
          id: true,
          full_name: true,
          email: true,
            organizer_profile: {
            select: {
                organization_name: true,
            }
          }
        },
      },
    },
  });
  return newEvent;
};

// b.2 delete event berdasarkan ID
export const deleteEvent = async (eventId: number, organizerId: number) => {
  const eventToDelete = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!eventToDelete) {
    const error = new Error(`Event dengan ID ${eventId} tidak ditemukan.`);
    (error as any).status = 404;
    throw error;
  }
  if (eventToDelete.organizer_id !== organizerId) {
    // Periksa juga apakah user adalah admin jika ada role admin
    const error = new Error("Anda tidak memiliki izin untuk menghapus event ini.");
    (error as any).status = 403;
    throw error;
  }

  // Pertimbangkan apa yang terjadi jika event sudah ada transaksi atau review
  // Mungkin perlu soft delete atau validasi tambahan
  await prisma.event.delete({
    where: { id: eventId },
  });

  return { message: `Event dengan ID ${eventId} berhasil dihapus.` };
};