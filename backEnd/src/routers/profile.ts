import { Router } from "express";
import multer from "multer";
import { authGuard } from "../middlewares/authGuard";
import { validate } from "../middlewares/validate";
import { ProfileController } from "../controllers/profile.controller";
import {
  ProfileUpdateSchema,
  ChangePasswordSchema,
  ResetPasswordSchema,
  ResetPasswordConfirmSchema,
} from "../schema/profile";

const upload = multer({
  limits: { fileSize: 500 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "image/jpeg") cb(new Error("hanya JPG"));
    else cb(null, true);
  },
});

const router = Router();
router.use(authGuard);

// edit profil
router.put(
  "/",
  upload.single("profilPictureFile"),
  validate(ProfileUpdateSchema),
  ProfileController.updateProfile
);

// change password
router.put(
  "/password",
  validate(ChangePasswordSchema),
  ProfileController.changePassword
);

// reset password: request
router.post(
  "/reset-request",
  validate(ResetPasswordSchema),
  ProfileController.resetRequest
);

// reset password: confirm
router.post(
  "/reset-confirm",
  validate(ResetPasswordConfirmSchema),
  ProfileController.resetConfirm
);

export default router;
