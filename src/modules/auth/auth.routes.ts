import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../core/validate-request";
import { registerSchema, loginSchema } from "./auth.types";

const router = Router();

router.post("/register", validateRequest(registerSchema), AuthController.register);
router.post("/login", validateRequest(loginSchema), AuthController.login);

export default router;
