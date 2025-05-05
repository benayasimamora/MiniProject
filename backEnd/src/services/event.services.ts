import { PrismaClient } from "@prisma/client";
import { ICreateEvent } from "../interface/event.interface";


const prisma = new PrismaClient();

// ngambil semua event
