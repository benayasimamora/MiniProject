import express from 'express';
import { verifyEmailController } from '../controllers/verify.controller';

const router = express.Router();

// Path biasanya '/' relatif thd mount point (misal /verify)
// Atau, jika ingin /verify?token=xxx, maka path-nya adalah '/'
// Endpoint di controller auth: /auth/verify-email?token=xxx
// Endpoint di controller verify: /verify?token=xxx
// Pilih salah satu yang konsisten. Jika verify.controller.ts berdiri sendiri:
router.get('/', verifyEmailController); // Akan menjadi /verify?token=xxx

export default router;