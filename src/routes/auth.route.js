import { Router } from 'express';
import {
  registerPage,
  userRegister,
  loginPage,
  userLogin,
  userLogout,
  fetchProfilePage,
  fetchEditProfilePage,
  updateUserProfile,
  fetchVerifyEmailPage,
  resendVerificationLink,
  verifyEmailToken,
} from '../controllers/auth.controller.js';

const router = Router();

// User registration and login routes
router.get('/register', registerPage);
router.post('/register', userRegister);

router.get('/login', loginPage);
router.post('/login', userLogin);

// Profile and logout routes
router.get('/profile', fetchProfilePage);
router.get('/edit-profile', fetchEditProfilePage);
router.post('/edit-profile', updateUserProfile);

router.get('/logout', userLogout);

// Email verification routes
router.get('/verify-email', fetchVerifyEmailPage);
router.post('/resend-verification-link', resendVerificationLink);
router.get('/verify-email-token', verifyEmailToken);

export const authRoutes = router;
