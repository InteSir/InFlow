// src/pages/PricingPage.tsx
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSearchParams ,useNavigate} from "react-router-dom";

import {
  CheckCircle2,
  TriangleAlert,
  Zap,
  Shield,
  BarChart3,
  Headphones,
  CreditCard,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Infinity as InfinityIcon } from "lucide-react";
import { useBillingPortalMutation, useGetSubscriptionStatusQuery, useSubscriptionCheckoutMutation } from "@/features/subscription/subscriptionAPI";



const PRO_FEATURES = [
  { icon: InfinityIcon,   text: "Unlimited transactions" },
  { icon: BarChart3,  text: "Advanced analytics" },
  { icon: Headphones, text: "Priority support" },
  { icon: Shield,     text: "MFA & session management" },
  { icon: Zap,        text: "Early access to new features" },
];

const FREE_FEATURES = [
  "Up to 3 days trial",
  "Basic analytics",
  "Email support",
  "Basic reports",
];
//pro_monthly 20 dollar, pro yearly 200 dollar save/discount 16.6%


function TrialBanner({trialEndsAt}:{ trialEndsAt: string }){
  const daysLeft = Math.ceil(
    (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const urgent = daysLeft <= 1;

   return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 mb-8 text-sm ${
        urgent
          ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40 text-red-700 dark:text-red-400"
          : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
      }`}
    >
      <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" />
      <span>
        <strong>Trial {urgent ? "expiring today!" : `expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}</strong>
        {" "}— upgrade now to keep full access.
      </span>
    </div>
  );

}

type SubscriptionStatus = {
  plan: "free" | "pro";
  status: "trialing" | "active" | "canceled" | "past_due" | "inactive";
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  hasAccess: boolean;
};

function ActiveSubscriptionCard({
  status,
  onManage,
  managing,
}: {
  status: SubscriptionStatus;
  onManage: () => void;
  managing: boolean;
}) {
  const renewDate = status.currentPeriodEnd
    ? new Date(status.currentPeriodEnd).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const badgeColor: Record<string, string> = {
    active:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    past_due: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    canceled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    trialing: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Pro Plan
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                badgeColor[status.status] ?? badgeColor.inactive
              }`}
            >
              {status.status}
            </span>
          </div>
          {renewDate && status.status === "active" && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Renews on {renewDate}
            </p>
          )}
          {status.status === "past_due" && (
            <p className="text-sm text-red-600 dark:text-red-400">
              Payment failed — update your payment method to avoid interruption.
            </p>
          )}
        </div>
        <button
          onClick={onManage}
          disabled={managing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {managing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ExternalLink className="w-4 h-4" />
          )}
          Manage Subscription
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: InfinityIcon,    label: "Unlimited transactions" },
          { icon: BarChart3,   label: "Advanced analytics" },
          { icon: Shield,      label: "MFA & sessions" },
          { icon: Headphones,  label: "Priority support" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"
          >
            <Icon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
export default function PricingPage() {
  const [searchParams] = useSearchParams();
  const [annual, setAnnual] = useState(false);
  const navigate = useNavigate();


 const {data:subStatus} = useGetSubscriptionStatusQuery(undefined,{refetchOnMountOrArgChange:true});
 const [subscriptionCheckout,{isLoading:checkoutLoading}] = useSubscriptionCheckoutMutation();
 const [billingPortal,{isLoading:portalLoading}] = useBillingPortalMutation();

 useEffect(()=>{
  if(searchParams.get("upgraded") === "true"){
    toast.success("🎉 You're now on Pro! Welcome aboard.");
    navigate("/settings/billing", { replace: true });
  }
   if (searchParams.get("canceled") === "true") {
      toast.info("Checkout canceled — no charge was made.");
      navigate("/settings/billing", { replace: true });
    }

 },[searchParams,navigate]);

  const handleUpgrade = (interval:"monthly"| "yearly") => {
    subscriptionCheckout({interval})
      .unwrap()
      .then((data)=>{
          if (data?.data?.url) {
            window.location.href = data.data.url;
          }
      })
       .catch((error) => {
        toast.error(error?.data?.message ?? "Failed to start checkout.");
      });

  };

  const handleManageBilling = () => {
    billingPortal()
    .unwrap()
    .then((data)=>{
      if (data?.data?.url) {
          window.location.href = data.data.url;
        }

    })
    .catch((error) => {
        toast.error(error?.data?.message ?? "Failed to open billing portal.");
      });
  }

  const upgradeLoading = checkoutLoading;
  const isPro   = subStatus?.plan === "pro" && subStatus?.status === "active";
  const isTrial = subStatus?.status === "trialing";



  return (
    
        <div className="max-w-3xl mx-auto">

      {/* Trial banner */}
      {isTrial && subStatus?.trialEndsAt && (
        <TrialBanner trialEndsAt={subStatus.trialEndsAt} />
      )}


      {/* Pricing header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {isPro ? "Your Plan" : "Upgrade to Pro"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isPro
            ? "Manage or cancel your subscription below."
            : "Unlock everything — cancel anytime."}
        </p>

        {/* Monthly / Yearly toggle — only when not yet pro */}
        {!isPro && (
          <div className="mt-5 inline-flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2">
            <span
              className={`text-sm font-medium transition-colors ${
                !annual ? "text-gray-900 dark:text-white" : "text-gray-400"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setAnnual((v) => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                annual ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
              aria-label="Toggle annual billing"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                  annual ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium transition-colors ${
                annual ? "text-gray-900 dark:text-white" : "text-gray-400"
              }`}
            >
              Yearly
              <span className="ml-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                Save 16%
              </span>
            </span>
          </div>
        )}
      </div>

      
      {/* Active Pro card — shown only when subscribed */}
      {isPro && (
        <div className="mb-10">
          <ActiveSubscriptionCard
            status={subStatus!}
            onManage={handleManageBilling}
            managing={portalLoading}
          />
        </div>
      )}

      {/* Plan cards — hide if already pro */}
      {!isPro && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Free card */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-7 flex flex-col">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-0.5">
                Free Trial
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                3 days to explore the app.
              </p>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">$0</span>
                <span className="text-sm text-gray-400 mb-0.5">/3 days</span>
              </div>
            </div>

            <ul className="flex-1 space-y-2.5 mb-6">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-gray-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="h-11 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500 font-medium">
              {isTrial ? "Current plan" : "Expired"}
            </div>
          </div>

          {/* Pro card */}
          <div className="relative rounded-2xl border-2 border-blue-500 bg-white dark:bg-gray-900 shadow-lg shadow-blue-100 dark:shadow-none p-7 flex flex-col">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Most popular
            </span>

            <div className="mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-0.5">
                Pro
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                For power users and small teams.
              </p>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {annual ? "$200" : "$20"}
                </span>
                <span className="text-sm text-gray-400 mb-0.5">
                  {annual ? "/year" : "/month"}
                </span>
              </div>
              {annual && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                  Save $40/year vs monthly
                </p>
              )}
            </div>

            <ul className="flex-1 space-y-2.5 mb-6">
              {PRO_FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Icon className="w-4 h-4 text-blue-500 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(annual ? "yearly" : "monthly")}
              disabled={upgradeLoading}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {(upgradeLoading) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              {annual ? "Upgrade — $200/yr" : "Upgrade — $20/mo"}
            </button>
          </div>
        </div>
      )}



      <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
        Payments securely processed by Stripe. Cancel anytime.
      </p>
    </div>
  );
}