import { getEnv } from "../utils/get-env";


const envConfig = () => ({
    NODE_ENV: getEnv("NODE_ENV","development"),
    PORT:getEnv("PORT","8000"),
    BASE_PATH:getEnv("BASE_PATH","/api"),
    MONGO_URI:getEnv("MONGO_URI"),
    JWT_SECRET:getEnv("JWT_SECRET","jwt12@df"),
    JWT_EXPIRES_IN:getEnv("JWT_EXPIRES_IN","15m") as string,
    JWT_REFRESH_SECRET:getEnv("JWT_REFRESH_SECRET","jwt54354"),
    JWT_REFRESH_EXPIRES_IN:getEnv("JWT_REFRESH_EXPIRES_IN","7d") as string,
    
    CLOUDINARY_CLOUD_NAME:getEnv("CLOUDINARY_CLOUD_NAME"),
    CLOUDINARY_API_KEY:getEnv("CLOUDINARY_API_KEY"),
    CLOUDINARY_API_SECRET:getEnv("CLOUDINARY_API_SECRET"),


    FRONTEND_ORIGIN:getEnv("FRONTEND_ORIGIN","localhost"),
    GEMINI_API_KEY:getEnv("GEMINI_API_KEY"),
    HUGGING_FACE_API:getEnv("HUGGING_FACE_API"),
    BACKEND_URL:getEnv("BACKEND_URL"),

    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: Number(process.env.SMTP_PORT),
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SENDER_EMAIL: process.env.SENDER_EMAIL,
      
  
    RESEND_API_KEY: getEnv("RESEND_API_KEY"),

    STRIPE_SECRET_KEY:getEnv("STRIPE_SECRET_KEY"),
    STRIPE_WEBHOOK_SECRET:getEnv("STRIPE_WEBHOOK_SECRET"),

    STRIPE_PRO_YEARLY:getEnv("STRIPE_PRO_YEARLY"),
    STRIPE_PRO_PLAN:getEnv("STRIPE_PRO_PLAN"),

    GOOGLE_CLIENT_ID:getEnv("GOOGLE_CLIENT_ID"),
});
export const Env = envConfig();