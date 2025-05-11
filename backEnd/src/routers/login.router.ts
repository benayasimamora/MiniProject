import express from 'express';
// import { LoginController } from '../controllers/login.controller'; // File login.controller.ts tidak disertakan
// Untuk sementara, kita bisa arahkan ke AuthController.login jika fungsinya sama
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { loginSchema } from '../validation/auth.validation'; // Nama file: auth.validation.ts

const router = express.Router();

// Jika LoginController adalah alias untuk AuthController.login
router.post('/', validate(loginSchema), AuthController.login); // Path biasanya '/' relatif thd mount point (misal /login)

export default router;