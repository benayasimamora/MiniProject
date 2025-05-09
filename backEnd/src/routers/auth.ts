import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { RegisterSchema, LoginSchema } from "../schema/auth";

const router = Router();
router.post("/register", validate(RegisterSchema), AuthController.register);
router.post("/login", validate(LoginSchema), AuthController.login);
router.get("/verify-email", AuthController.verifyEmail);
export default router;
