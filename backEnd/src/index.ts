// ... impor lainnya ...
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PORT } from './config';
import { errorHandler } from './middlewares/errorHandler'; // Pastikan path benar
import { startExpireCronJob } from './utils/cron/expiretask'; // Path ke cron

// Impor Routers
import authRouter from './routers/auth';
import eventRouter from './routers/event.router';
import profileRouter from './routers/profile.router';
import reviewRouter from './routers/review.router';
import referralRouter from './routers/referral';
import organizerRouter from './routers/organizer';
import adminRouter from './routers/admin'; // Jika admin router terpisah
import dashboardRouter from './routers/dashboard.router';
import transactionRouter from './routers/transaction.router'; // <<< ROUTER BARU

const app: Express = express();

app.use(cors()); // Atur CORS sesuai kebutuhan
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (jika ada)
// app.use(express.static("public"));

// Routers
app.use('/auth', authRouter);
app.use('/events', eventRouter);
app.use('/profile', profileRouter); // Mungkin /users/profile atau /me
app.use('/reviews', reviewRouter);
app.use('/referrals', referralRouter);
app.use('/organizers', organizerRouter);
app.use('/admin', adminRouter); // Rute untuk admin, misal /admin/organizer/:id/approve
app.use('/dashboard', dashboardRouter); // Untuk organizer
app.use('/transactions', transactionRouter); // <<< DAFTARKAN ROUTER TRANSAKSI

// Root Route (Opsional)
app.get('/', (req: Request, res: Response) => {
  res.send('Selamat datang di FindYourTicket API!');
});

// Error Handler Middleware (harus paling bawah setelah semua rute)
app.use(errorHandler);

// Jalankan Cron Jobs
startExpireCronJob();

app.listen(PORT, () => {
  console.log(`Server berjalan di ${APP_URL}`);
});