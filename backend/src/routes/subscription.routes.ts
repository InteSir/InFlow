import {Router} from 'express';
import { createBillingPortalController, createCheckoutController, getStatus, handleStripeWebhookController } from '../controllers/subscription.controller';
import { passportAuthenticateJwt } from '../config/passport.config';


const subscriptionRoute = Router();

subscriptionRoute.post("/checkout",passportAuthenticateJwt,createCheckoutController);
subscriptionRoute.post("/portal",passportAuthenticateJwt,createBillingPortalController);
subscriptionRoute.get("/status",passportAuthenticateJwt,getStatus);
// subscriptionRoute.post("/webhook",handleStripeWebhookController);






export default subscriptionRoute;
