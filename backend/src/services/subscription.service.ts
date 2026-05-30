
import { Env } from "../config/env.config";
import { stripe } from "../lib/stripe";
import userModel from "../models/user.model"
import { BadRequestException, NotFoundException } from "../utils/app-error";

// Import the actual types directly from stripe.core
import type { Stripe as StripeTypes } from "../../node_modules/stripe/cjs/stripe.core";


// 1. Create (or retrieve) a Stripe Customer for a user
export const getOrCreateStripeCustomer = async(userId:string)=>{
    const user = await userModel.findById(userId);

    if(!user) throw new NotFoundException("User not Found");

     // Already has a Stripe customer, return it
     if(user.stripeCustomerId){
        return user.stripeCustomerId;
     }

     //create new Stripe Customer
     const customer = await stripe.customers.create({
        email:user.email,
        name:user.name,
        metadata:{userId:user._id.toString()},
     });

     user.stripeCustomerId = customer.id;
     await user.save();

     return customer.id;
};


// 2. Create a Stripe Checkout Session → returns a URL
//    the frontend redirects the user to this URL

export const createCheckoutSession = async(userId:string,interval:"monthly"|"yearly" = "monthly")=>{
    const customerId = await getOrCreateStripeCustomer(userId);

    const priceId = interval === "yearly" ? Env.STRIPE_PRO_YEARLY! : Env.STRIPE_PRO_PLAN!;

    const session = await stripe.checkout.sessions.create({
        customer:customerId,
        mode:"subscription",
        payment_method_types:["card"],
        line_items:[
            {
                price:priceId,
                quantity:1,
            },

        ],
        success_url:`${Env.FRONTEND_ORIGIN}/settings/billing?upgraded=true`,
        cancel_url:`${Env.FRONTEND_ORIGIN}/settings/billing?canceled=true`,

        // Tell Stripe to cancel the old free/trialing subscription if any
        subscription_data: {
        metadata: { userId:userId.toString() },
        },
    });

    return {url:session.url};
}

// 3. Create a Stripe Billing Portal Session
//    lets the user manage / cancel their subscription

export const createBillingPortalSession = async(userId:string) =>{
    const customerId = await getOrCreateStripeCustomer(userId);

    const session = await stripe.billingPortal.sessions.create({
        customer:customerId,
        return_url:`${Env.FRONTEND_ORIGIN}/settings`
    });

    return {url:session.url};
};

// 4. Handle incoming Stripe Webhooks
//    This is the most important piece — Stripe tells
//    YOU when a subscription changes, not the other way round.


const getPeriodEnd = (subscription:StripeTypes.Subscription):Date | null =>{
    const ts = subscription.items?.data?.[0]?.current_period_end;
    return ts ? new Date(ts * 1000):null;
}
const STATUS_MAP: Record<StripeTypes.Subscription.Status, string> = {
  active:             "active",
  past_due:           "past_due",
  canceled:           "canceled",
  trialing:           "trialing",
  unpaid:             "inactive",
  incomplete:         "inactive",
  incomplete_expired: "inactive",
  paused:             "inactive",
};
export const handleStripeWebhook = async(
    rawBody:Buffer,
    signature:string,
)=>{

    let event:StripeTypes.Event;

    // Verify the webhook came from Stripe, not a random POST

    try{
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            Env.STRIPE_WEBHOOK_SECRET!
        );
    }catch(error:any){
        throw new BadRequestException(`Webhook signature verification failed: ${error.message}`)
    }

    switch(event.type){
        // ── Checkout completed: user just paid ──────────────────────────
        case "checkout.session.completed":{
            const session = event.data.object as StripeTypes.Checkout.Session;
            if(session.mode !== "subscription") break;

            const customerId = session.customer as string;
            const subscriptionId = session.subscription as string;

            // Fetch the full subscription to get period end
            const subscription = await stripe.subscriptions.retrieve(subscriptionId,{expand:["items.data"]});

            await userModel.findOneAndUpdate(
                {stripeCustomerId:customerId},
                {
                    subscriptionPlan:"pro",
                    subscriptionStatus:"active",
                    subscriptionId,
                    trialEndsAt:null,// trial is over, they paid
                    currentPeriodEnd:getPeriodEnd(subscription as unknown as StripeTypes.Subscription),
                }
            );

            break;
        }
        // ── Subscription updated (renewal, plan change, etc.) ──────────
        case "customer.subscription.updated":{
            const subscription = event.data.object as StripeTypes.Subscription;
            const customerId = subscription.customer as string;

            await userModel.findOneAndUpdate(
                    { stripeCustomerId: customerId },
                    {
                        subscriptionStatus: STATUS_MAP[subscription.status] ?? "inactive",
                        subscriptionPlan:   subscription.status === "active" ? "pro" : "free",
                        currentPeriodEnd:   getPeriodEnd(subscription),
                    }
            );
            break;
            
        }

        case "customer.subscription.deleted":{
            const subscription = event.data.object as StripeTypes.Subscription;
            const customerId = subscription.customer as string;

            await userModel.findOneAndUpdate(
                    { stripeCustomerId: customerId },
                    {
                        subscriptionPlan:   "free",
                        subscriptionStatus: "inactive",
                        subscriptionId:     null,
                        currentPeriodEnd:   null,
                    }

            );
            break;

        }

        case "invoice.payment_failed":{
            const invoice    = event.data.object as StripeTypes.Invoice;
            const customerId =
                typeof invoice.customer === "string"
                    ? invoice.customer
                    : (invoice.customer as StripeTypes.Customer)?.id ?? null;

            if(customerId){
                await userModel.findOneAndUpdate(
                    { stripeCustomerId: customerId },
                    { subscriptionStatus: "past_due" }
                );
            }
            break;
        }

    }

    return { received: true };

}