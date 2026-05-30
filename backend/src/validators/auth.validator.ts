import passport from 'passport';
import {z} from 'zod';
export const emailSchema = z.string().trim().email("Invalid email address").min(1).max(255);
export const passwordSchema = z.string().trim().min(4);
export const verificationCodeSchema = z.string().trim().min(1).max(25);


export const registerSchema = z.object({
    name:z.string().trim().min(1).max(255),
    email:emailSchema,
    password:passwordSchema,
});
export const loginSchema = z.object({
    email:emailSchema,
    password:passwordSchema,
    userAgent:z.string().optional(),
});

export const resetPasswordSchema = z.object({
    password:passwordSchema,
    verificationCode:verificationCodeSchema,
});


export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;
