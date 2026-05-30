import {Router} from 'express';
import { forgotPasswordController, googleAuthController, loginController, logoutController, refreshTokenController, registerController, resetPasswordController, updateUserController, verifyEmailController } from '../controllers/auth.controller';
import { passportAuthenticateJwt } from '../config/passport.config';

const authRoutes = Router();

authRoutes.post("/register",registerController);
authRoutes.post("/login",loginController);
authRoutes.get('/refresh',refreshTokenController);
authRoutes.post('/logout',passportAuthenticateJwt,logoutController);
authRoutes.post('/forgot-password',forgotPasswordController);
authRoutes.post('/reset-password',resetPasswordController);
authRoutes.post('/verify-email',verifyEmailController);
authRoutes.post('/updateUser',updateUserController);
authRoutes.post("/google", googleAuthController);

export default authRoutes;