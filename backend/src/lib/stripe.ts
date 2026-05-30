import Stripe = require("stripe");
import { Env } from "../config/env.config";


export const stripe = new Stripe(Env.STRIPE_SECRET_KEY!,{
    apiVersion:"2026-03-25.dahlia",
});