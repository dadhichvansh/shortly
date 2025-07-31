import { Router } from "express";
import {
  registerPage,
  userRegister,
  loginPage,
  userLogin,
  fetchProfile,
  userLogout,
} from "../controllers/auth.controller.js";

const router = Router();

router.route("/register").get(registerPage).post(userRegister);
router.route("/login").get(loginPage).post(userLogin);
router.route("/profile").get(fetchProfile);
router.route("/logout").get(userLogout);

export const authRoutes = router;
