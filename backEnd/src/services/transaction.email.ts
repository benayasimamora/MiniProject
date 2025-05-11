import { transporter } from "./email.services";

export class TransactionEmail {
  static async sendStatusEmail(
    to: string,
    status: "CONFIRMED" | "REJECTED",
    txId: number
  ) {
    const subject =
      status === "CONFIRMED"
        ? "Transaksi Anda Disetujui"
        : "Transaksi Anda Ditolak";
    const html = `<p>Transaksi #${txId} status: ${status}.</p>
        <p>Silahkan cek detail transaksi Anda di aplikasi.</p>`;
    await transporter.sendMail({ to, subject, html });
  }
}
