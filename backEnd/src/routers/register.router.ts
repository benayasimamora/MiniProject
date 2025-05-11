import express from 'express';
import { RegisterController } from '../controllers/register.controller';
import { validate } from '../middlewares/validate';
import { registerSchema } from '../validation/auth.validation'; // Nama file: auth.validation.ts

const router = express.Router();

// Path biasanya '/' relatif thd mount point (misal /register)
router.post('/', validate(registerSchema), RegisterController);

export default router;