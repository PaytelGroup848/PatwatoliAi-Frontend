"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Crown,
  HelpCircle,
  ArrowRight,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import {
  fetchPublicPlans,
  purchaseSubscription,
  verifyPayment,
  cancelSubscription,
  fetchBillingProfile,
} from "../services/billing.service";
import { useRazorpay } from "../hooks/use-razorpay";
import { useAuthStore } from "@/stores/auth-store";
import { PublicPlan, BillingDetails } from "../types/billing.types";
import { BillingDetailsModal } from "./billing-details-modal";

const PLAN_RANK: Record<string, number> = {
  free: 0,
  pro: 1,
  enterprise: 2,
};

export function PricingView({ showBackButton = true }: { showBackButton?: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const { openCheckout } = useRazorpay();

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [processingPlanCode, setProcessingPlanCode] = useState<string | null>(null);
  const [isDowngradeModalOpen, setIsDowngradeModalOpen] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data, isLoading: isPlansLoading } = useQuery({
    queryKey: ["public-plans"],
    queryFn: fetchPublicPlans,
    staleTime: 30 * 1000,
  });

  const plans = data?.plans || [];
  const activePlanCode = (data?.active_plan_code || "free").toLowerCase();
  const activeBillingCycle = data?.active_billing_cycle || "monthly";
  const userRank = PLAN_RANK[activePlanCode] ?? 0;

  // Auto-sync billing cycle toggle with user's active cycle when loaded
  useEffect(() => {
    if (data?.active_billing_cycle && (data.active_billing_cycle === "monthly" || data.active_billing_cycle === "yearly")) {
      setBillingCycle(data.active_billing_cycle);
    }
  }, [data?.active_billing_cycle]);

  // Calculate annual savings percentage
  const proPlan = plans.find((p) => p.plan_code === "pro");
  const proMonthly = proPlan?.prices.find((p) => p.billing_cycle === "monthly")?.amount;
  const proYearly = proPlan?.prices.find((p) => p.billing_cycle === "yearly")?.amount;
  const annualDiscountPct =
    proMonthly && proYearly
      ? Math.round(((proMonthly * 12 - proYearly) / (proMonthly * 12)) * 100)
      : 17;

  const [selectedPlanForBilling, setSelectedPlanForBilling] = useState<PublicPlan | null>(null);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  const { data: savedProfile } = useQuery({
    queryKey: ["billing-profile"],
    queryFn: fetchBillingProfile,
    enabled: !!user && user.role !== "guest",
    staleTime: 30 * 1000,
  });

  const handleUpgrade = (plan: PublicPlan) => {
    if (!user || user.role === "guest") {
      router.push("/login?redirect=/pricing");
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setSelectedPlanForBilling(plan);
    setIsBillingModalOpen(true);
  };

  const executePurchaseAndCheckout = async (billingDetails: BillingDetails) => {
    const plan = selectedPlanForBilling;
    if (!plan || !user || user.role === "guest") return;

    if (processingPlanCode) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setProcessingPlanCode(plan.plan_code);

    try {
      const purchaseRes = await purchaseSubscription({
        plan_code: plan.plan_code,
        billing_cycle: billingCycle,
        provider: "razorpay",
        currency: "INR",
        billing_details: billingDetails,
      });

      const orderId = purchaseRes.payment.payment_intent_id;
      const keyId = purchaseRes.razorpay_key_id;
      const orderAmountPaise = purchaseRes.payment.payment?.amount
        ? Math.round(purchaseRes.payment.payment.amount * 100)
        : 79900;

      if (!orderId || !keyId) {
        throw new Error("Unable to create payment order. Gateway key missing.");
      }

      await openCheckout({
        key: keyId,
        amount: orderAmountPaise,
        currency: purchaseRes.payment.payment?.currency || "INR",
        order_id: orderId,
        name: "Patwatoli AI",
        description: `${plan.plan_name} (${billingCycle}) Subscription`,
        prefill: {
          name: billingDetails.name || user?.full_name || undefined,
          email: user?.email || undefined,
          contact: billingDetails.phone || undefined,
        },
        themeColor: "#059669",
        onSuccess: async (response) => {
          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.status === "verified" || verifyRes.status === "already_paid") {
              setSuccessMessage(`🎉 Success! Your account is now upgraded to ${plan.plan_name} (${billingCycle}).`);
              queryClient.invalidateQueries({ queryKey: ["public-plans"] });
              queryClient.invalidateQueries({ queryKey: ["billing-usage"] });
              queryClient.invalidateQueries({ queryKey: ["user-subscription"] });

              queryClient.invalidateQueries({ queryKey: ["billing-profile"] });
              await queryClient.refetchQueries({ queryKey: ["public-plans"] });
              await queryClient.refetchQueries({ queryKey: ["billing-usage"] });
              await queryClient.refetchQueries({ queryKey: ["user-subscription"] });

              // Immediate zero-delay cross-component UI synchronization
              if (typeof window !== "undefined") {
                window.dispatchEvent(
                  new CustomEvent("subscription_updated", {
                    detail: { plan: plan.plan_code },
                  })
                );
              }
              setIsBillingModalOpen(false);
            } else {
              setErrorMessage("Payment completed, but verification is still pending. Your account will update shortly.");
            }
          } catch (verifyErr: unknown) {
            const errObj = verifyErr as { response?: { data?: { detail?: string } }; message?: string };
            setErrorMessage(
              errObj.response?.data?.detail || errObj.message || "Payment verification failed. Please contact support."
            );
          } finally {
            setProcessingPlanCode(null);
          }
        },
        onDismiss: () => {
          setProcessingPlanCode(null);
        },
        onError: (err: { message?: string }) => {
          setProcessingPlanCode(null);
          setErrorMessage(err.message || "Payment cancelled or failed.");
        },
      });
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { detail?: string } }; message?: string };
      setProcessingPlanCode(null);
      setErrorMessage(
        errObj.response?.data?.detail || errObj.message || "Checkout initiation failed. Please try again."
      );
    }
  };

  const handleDowngradeToFree = async () => {
    if (!user || user.role === "guest") {
      router.push("/login?redirect=/pricing");
      return;
    }
    setIsDowngrading(true);
    setErrorMessage(null);
    try {
      await cancelSubscription();
      setSuccessMessage("Your subscription has been cancelled. Your account has been reverted to the Free tier.");
      queryClient.invalidateQueries({ queryKey: ["public-plans"] });
      queryClient.invalidateQueries({ queryKey: ["billing-usage"] });
      queryClient.invalidateQueries({ queryKey: ["user-subscription"] });

      await queryClient.refetchQueries({ queryKey: ["public-plans"] });
      await queryClient.refetchQueries({ queryKey: ["billing-usage"] });
      setIsDowngradeModalOpen(false);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { detail?: string } }; message?: string };
      setErrorMessage(errObj.response?.data?.detail || errObj.message || "Failed to cancel subscription. Please contact support.");
    } finally {
      setIsDowngrading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* HEADER SECTION */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-3">
          <Sparkles size={13} />
          <span>Scale Your Intelligence</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100 mb-4">
          Choose the Perfect Plan
        </h1>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
          Unlock high token allowances, frontier AI models , and priority generation latency with enterprise security.
        </p>

        {/* BILLING CYCLE TOGGLE */}
        <div className="mt-6 inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
              billingCycle === "monthly"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
              billingCycle === "yearly"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Annual Billing</span>
            {annualDiscountPct > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold">
                Save {annualDiscountPct}%
              </span>
            )}
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      {errorMessage && (
        <div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-sm flex items-center gap-3 shadow-xs">
          <AlertCircle size={18} className="shrink-0 text-red-600 dark:text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-3 font-semibold shadow-xs">
          <ShieldCheck size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* PLAN CARDS GRID */}
      {isPlansLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-emerald-600 dark:text-emerald-400" size={36} />
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading plan tiers...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mb-14">
          {plans.map((plan) => {
            const cardCode = plan.plan_code.toLowerCase();
            const cardRank = PLAN_RANK[cardCode] ?? 0;
            const isPro = cardCode === "pro";
            const isFree = cardCode === "free";

            const isCurrentTier = cardCode === activePlanCode;
            const isCurrentPlanAndCycle =
              isCurrentTier && (isFree || activeBillingCycle === billingCycle);

            const priceObj =
              plan.prices.find((p) => p.billing_cycle === billingCycle) ||
              plan.prices.find((p) => p.billing_cycle === "monthly") ||
              plan.prices[0];

            const amount = priceObj ? priceObj.amount : 0;
            const currency = priceObj?.currency === "INR" ? "₹" : "$";
            const isProcessing = processingPlanCode === plan.plan_code;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl p-6 bg-white dark:bg-slate-900 transition-all duration-300 ${
                  isPro
                    ? "border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 dark:shadow-emerald-500/5 md:-translate-y-2"
                    : "border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold tracking-wide uppercase shadow-md">
                    Most Popular
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {isPro && <Crown size={18} className="text-emerald-600 dark:text-emerald-400" />}
                    <span>{plan.plan_name}</span>
                  </div>
                  {isCurrentTier && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/60">
                      Current Plan
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 min-h-9 line-clamp-2">
                  {plan.description || "Comprehensive AI platform access"}
                </p>

                {/* PRICE BLOCK */}
                <div className="my-5 pb-5 border-b border-slate-100 dark:border-slate-800">
                  {isFree ? (
                    <div className="text-4xl font-black text-slate-900 dark:text-slate-100">
                      Free
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1.5">/ forever</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-slate-900 dark:text-slate-100">
                        {currency}{amount.toLocaleString()}
                      </span>
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                        /{billingCycle === "yearly" ? "year" : "month"}
                      </span>
                    </div>
                  )}
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1.5">
                    {plan.monthly_token_limit > 0
                      ? `${plan.monthly_token_limit.toLocaleString()} monthly tokens`
                      : "Standard token limit"}
                  </div>
                </div>

                {/* FEATURES LIST */}
                <div className="flex-1 space-y-3 mb-8">
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Included Features
                  </div>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 mt-0.5">
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span className="font-medium leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* ACTION BUTTON */}
                <div className="mt-auto pt-2">
                  {isCurrentPlanAndCycle ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 cursor-default flex items-center justify-center gap-2"
                    >
                      <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
                      <span>Current Plan</span>
                    </button>
                  ) : isCurrentTier && !isCurrentPlanAndCycle ? (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={isProcessing || processingPlanCode !== null}
                      className="w-full py-3 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Securing Checkout...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          <span>Switch to {billingCycle === "yearly" ? "Annual" : "Monthly"}</span>
                        </>
                      )}
                    </button>
                  ) : cardRank > userRank ? (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={isProcessing || processingPlanCode !== null}
                      className={`w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                        isPro
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:scale-[1.01]"
                          : "bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white shadow-slate-900/10"
                      } ${
                        isProcessing || processingPlanCode !== null
                          ? "opacity-60 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Securing Checkout...</span>
                        </>
                      ) : (
                        <>
                          <Zap size={16} />
                          <span>Upgrade to {plan.plan_name}</span>
                        </>
                      )}
                    </button>
                  ) : isFree ? (
                    <button
                      onClick={() => setIsDowngradeModalOpen(true)}
                      disabled={isProcessing || isDowngrading}
                      className="w-full py-3 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-red-700 dark:hover:text-red-400 bg-slate-50 dark:bg-slate-800/80 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Downgrade to Free</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={isProcessing || processingPlanCode !== null}
                      className="w-full py-3 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Securing Checkout...</span>
                        </>
                      ) : (
                        <span>Change to {plan.plan_name}</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TRUST & SECURITY BADGES */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400 mb-14">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800/60">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100">Encrypted 256-bit Razorpay Checkout</div>
            <div className="text-slate-500 dark:text-slate-400">Instant token activation directly applied to your user balance.</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
          <span>Supported:</span>
          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-semibold text-slate-700 dark:text-slate-300">UPI (GPay / PhonePe / Paytm)</span>
          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-semibold text-slate-700 dark:text-slate-300">Cards</span>
          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md font-semibold text-slate-700 dark:text-slate-300">NetBanking</span>
        </div>
      </div>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-8 flex items-center justify-center gap-2">
          <HelpCircle size={22} className="text-emerald-600 dark:text-emerald-400" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1.5">Can I cancel or downgrade my subscription anytime?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Yes, absolutely. You can downgrade back to the Free Tier with a single click. Your plan will transition cleanly without hidden charges or retention locks.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1.5">How are tokens measured and consumed?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tokens are counted in real-time for input prompts and model responses across standard chat, tool calls, and document intelligence. Pro Tier includes 50 Million monthly tokens.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1.5">Will I get a GST Tax Invoice?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Yes, all paid purchases generate automated Razorpay invoices with GST breakdowns suitable for business expense accounting.
            </p>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL FOR DOWNGRADE TO FREE */}
      {isDowngradeModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-800/60">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Downgrade to Free Tier?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cancel your paid subscription plan</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to downgrade? Your active subscription will be cancelled immediately and your account limits will revert to the standard Free Tier (10,000,000 tokens/month).
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsDowngradeModalOpen(false)}
                disabled={isDowngrading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Keep My Plan
              </button>
              <button
                onClick={handleDowngradeToFree}
                disabled={isDowngrading}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm shadow-red-600/20"
              >
                {isDowngrading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Downgrading...</span>
                  </>
                ) : (
                  <span>Confirm Downgrade</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* BILLING & INVOICING PRE-CHECKOUT MODAL */}
      <BillingDetailsModal
        isOpen={isBillingModalOpen}
        onClose={() => {
          if (!processingPlanCode) {
            setIsBillingModalOpen(false);
            setSelectedPlanForBilling(null);
          }
        }}
        plan={selectedPlanForBilling}
        billingCycle={billingCycle}
        initialDetails={savedProfile || { name: user?.full_name || "" }}
        onSubmit={executePurchaseAndCheckout}
        isProcessing={!!processingPlanCode}
      />
    </div>
  );
}
