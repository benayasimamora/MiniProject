import { transporter } from "./email.services"; // Seharusnya email.service.ts
import { Organizer_Status } from "@prisma/client"; // Pastikan enum ini diimpor

export class OrganizerEmail {
  static async notifyPending(to: string, organizationName: string) {
    await transporter.sendMail({
      from: "'EventApp Admin' <no-reply@eventapp.com>",
      to,
      subject: `Pengajuan Pendaftaran Organizer (${organizationName}) Sedang Ditinjau`,
      html: `<p>Halo,</p><p>Terima kasih telah mengajukan pendaftaran sebagai organizer untuk <strong>${organizationName}</strong>. Pengajuan Anda sedang kami proses dan akan kami tinjau sesegera mungkin.</p><p>Kami akan memberitahukan hasilnya melalui email.</p><p>Salam,<br>Tim EventApp</p>`,
    });
  }
  static async notifyResult(
    to: string,
    organizationName: string,
    status: Organizer_Status,
    reason?: string
  ) {
    const subject =
      status === Organizer_Status.APPROVED
        ? `Selamat! Pengajuan Organizer (${organizationName}) Disetujui`
        : `Informasi Pengajuan Organizer (${organizationName})`;
    
    let body = `<p>Halo,</p>`;
    if (status === Organizer_Status.APPROVED) {
        body += `<p>Selamat! Pengajuan Anda untuk menjadi organizer dengan nama organisasi <strong>${organizationName}</strong> telah disetujui.</p><p>Anda sekarang dapat mulai membuat dan mengelola acara melalui dashboard organizer Anda.</p>`;
    } else if (status === Organizer_Status.REJECTED) {
        body += `<p>Dengan berat hati kami memberitahukan bahwa pengajuan Anda untuk menjadi organizer dengan nama organisasi <strong>${organizationName}</strong> belum dapat kami setujui saat ini.</p>`;
        if (reason) {
            body += `<p>Alasan: ${reason}</p>`;
        }
        body += `<p>Anda dapat mengajukan kembali setelah 7 hari dari tanggal penolakan ini jika Anda telah memenuhi persyaratan yang dibutuhkan.</p>`;
    }
    body += `<p>Salam,<br>Tim EventApp</p>`;


    // kirim setelah 5 menit (mungkin tidak perlu delay ini?)
    // Jika ingin mengirim langsung, hapus setTimeout
    // setTimeout(() => {
      transporter.sendMail({ from: "'EventApp Admin' <no-reply@eventapp.com>", to, subject, html: body });
    // }, 5 * 60 * 1000);
  }
}