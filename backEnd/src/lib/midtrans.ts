import midtransClient from 'midtrans-client';
import { MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY, MIDTRANS_IS_PRODUCTION } from '../config';

if (!MIDTRANS_SERVER_KEY || !MIDTRANS_CLIENT_KEY) {
    console.warn("Peringatan: Kunci Midtrans (Server Key atau Client Key) tidak dikonfigurasi. Fitur pembayaran mungkin tidak berfungsi.");
}

// Inisialisasi Midtrans Snap API
export const snap = new midtransClient.Snap({
    isProduction: MIDTRANS_IS_PRODUCTION,
    serverKey: MIDTRANS_SERVER_KEY!, // Tambahkan '!' jika Anda yakin ini ada, atau handle jika null/undefined
    clientKey: MIDTRANS_CLIENT_KEY!
});

// Anda juga bisa menginisialisasi Midtrans Core API jika diperlukan untuk operasi lain (misal, cek status manual)
export const coreApi = new midtransClient.CoreApi({
    isProduction: MIDTRANS_IS_PRODUCTION,
    serverKey: MIDTRANS_SERVER_KEY!,
    clientKey: MIDTRANS_CLIENT_KEY!
});

export default snap;