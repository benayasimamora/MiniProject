import prisma from "../lib/prisma";
import { OrganizerProfileUpdateSchema } from "../schema/organizerProfile";
import { z } from "zod";

export class OrganizerProfileService {
  // ambil profil organizer
  static async getOrganizerProfile(userId: number) {
    return prisma.organizer_Profile.findUnique({
      where: { user_id: userId },
    });
  }

  // update profil organizer
  static async updateOrganizerProfile(
    userId: number,
    data: z.infer<typeof OrganizerProfileUpdateSchema>
  ) {
    return prisma.organizer_Profile.update({
      where: { user_id: userId },
      data: {
        organization_name: data.organization_name,
        phone_number: data.phone_number,
        address: data.address,
        website_url: data.website_url,
      },
    });
  }
}
