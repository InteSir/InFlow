import { apiClient } from "@/app/api-client";

type SubscriptionStatus = {
  plan: "free" | "pro";
  status: "trialing" | "active" | "canceled" | "past_due" | "inactive";
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  hasAccess: boolean;
};

type CheckoutRequest = {
  interval: "monthly" | "yearly";
};

type CheckoutResponse = {
  message: string;
  data: { url: string };
};

type PortalResponse = {
  data: { url: string };
};


export const subscriptionApi = apiClient.injectEndpoints({
    endpoints:(builder)=>({
        getSubscriptionStatus:builder.query<SubscriptionStatus, void>({
            query:()=>({
                url:"/subscription/status",
                method:"GET",

            }),
            providesTags: ["Subscription"],
        }),


        subscriptionCheckout:builder.mutation<CheckoutResponse, CheckoutRequest>({
            query:(body)=>({
                url:"/subscription/checkout",
                method:"POST",
                body:body
            }),
        }),

        billingPortal:builder.mutation<PortalResponse,void>({
            query:()=>({
                url:"/subscription/portal",
                method:"POST"
            }),
         

        }),
    })
});

export const {
  useGetSubscriptionStatusQuery,
  useSubscriptionCheckoutMutation,
  useBillingPortalMutation,
} = subscriptionApi;

