import { transporter } from "./email.services";
import { Organizer_Status } from "@prisma/client";

export class OrganizerEmail {
  static async notifyPending(to: string) {
    await transporter.sendMail({
      to,
      subject: "Pengajuan Organizer: Pending",
      html: `<p>Terima kasih, pengajuan Anda sedang di proses.</p>`,
    });
  }
  static async notifyResult(
    to: string,
    status: Organizer_Status,
    reason?: string
  ) {
    const subject =
      status === Organizer_Status.APPROVED
        ? "Pengajuan Organizer Disetujui"
        : "Pengajuan Organizer Ditolak";
    const body =
      status === Organizer_Status.APPROVED
        ? `<p>Selamat! Anda sekarang menjadi Organizer.</p>`
        : `<p>Maaf, pengajuan ditolak. Alasan: ${reason}. Anda dapat re-apply setelah 7 hari.</p>`;

    // kirim setelah 5 menit
    setTimeout(() => {
      transporter.sendMail({ to, subject, html: body });
    }, 5 * 60 * 1000);
  }
}
