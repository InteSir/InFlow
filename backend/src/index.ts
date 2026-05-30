import 'dotenv/config';
import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { Env } from './config/env.config';
import cors from 'cors';
import { HTTPSTATUS } from './config/http.config';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { asyncHandler } from './middlewares/asyncHanlder.middleware';
import connectDB from './config/database.config';
import authRoutes from './routes/auth.route';
import passport from 'passport';
import './config/passport.config';
import userRoutes from './routes/user.routes';
import { passportAuthenticateJwt } from './config/passport.config';
import TransactionRoutes from './routes/transaction.route';
import { initializeCrons } from './crons';
import reportRoutes from './routes/report.route';
import analyticsRoutes from './routes/analytics.route';
import cookieParser from 'cookie-parser';
import mfaRoutes from './routes/mfa.routes';
import sessionRoutes from './routes/session.route';
import subscriptionRoute from './routes/subscription.routes';
import { handleStripeWebhookController } from './controllers/subscription.controller';
import multer from 'multer';
import * as path from 'path';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import ContactRouter from './routes/contact.route';

const app = express();
app.use(
  cors({
    origin: Env.FRONTEND_ORIGIN,
    credentials: true,
  }),
);
const BASE_PATH = Env.BASE_PATH;

app.use(
  `${BASE_PATH}/subscription/webhook`,
  express.raw({ type: 'application/json' }),
  handleStripeWebhookController,
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.get(
  '/',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.status(HTTPSTATUS.OK).json({
      message: 'Hello INAR-FLOW',
    });
  }),
);
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, passportAuthenticateJwt, userRoutes);
app.use(`${BASE_PATH}/transaction`, passportAuthenticateJwt, TransactionRoutes);
app.use(`${BASE_PATH}/report`, passportAuthenticateJwt, reportRoutes);
app.use(`${BASE_PATH}/analytics`, passportAuthenticateJwt, analyticsRoutes);
app.use(`${BASE_PATH}/session`, passportAuthenticateJwt, sessionRoutes);
app.use(`${BASE_PATH}/mfa`, passportAuthenticateJwt, mfaRoutes);
app.use(`${BASE_PATH}/subscription`, subscriptionRoute);
app.use(`${BASE_PATH}/contact`, ContactRouter);

app.use(errorHandler);

app.listen(Env.PORT, async () => {
  await connectDB();
  if (Env.NODE_ENV === 'development') {
    await initializeCrons();
  }
  console.log(
    `server running on http://localhost:${Env.PORT} in ${Env.NODE_ENV} mode`,
  );
});
