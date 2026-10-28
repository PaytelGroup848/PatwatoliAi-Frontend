"use client";

import { useState } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { LandingFooter } from "./landing-footer";
import { useAuthStore } from "@/stores/auth-store";
import { useRazorpay } from "@/features/billing/hooks/use-razorpay";
import {
  fetchPublicPlans,
  purchaseSubscription,
  verifyPayment,
} from "@/features/billing/services/billing.service";
import { PublicPlan } from "@/features/billing/types/billing.types";

type CtaSectionProps = {
  annual: boolean;
  setAnnual: (value: boolean) => void;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ detail?: string }>(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
  }
  return error instanceof Error ? error.message : fallback;
}

export function CtaSection({ annual, setAnnual }: CtaSectionProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const { openCheckout } = useRazorpay();
  const [processingPlanCode, setProcessingPlanCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const billingCycle = annual ? "yearly" : "monthly";

  const {
    data,
    isLoading: isPlansLoading,
    isError: isPlansError,
    error: plansError,
  } = useQuery({
    queryKey: ["public-plans"],
    queryFn: fetchPublicPlans,
    staleTime: 5 * 60 * 1000,
  });

  const activePlanCode = (data?.active_plan_code ?? "free").toLowerCase();
  const activeBillingCycle = data?.active_billing_cycle ?? "monthly";

  const handleChoosePlan = async (plan: PublicPlan) => {
    if (plan.plan_code.toLowerCase() === "free") {
      router.push("/chat");
      return;
    }

    if (!user) {
      router.push("/login?redirect=/pricing");
      return;
    }

    if (processingPlanCode) return;
    setErrorMessage(null);
    setProcessingPlanCode(plan.plan_code);

    try {
      const purchase = await purchaseSubscription({
        plan_code: plan.plan_code,
        billing_cycle: billingCycle,
        provider: "razorpay",
        currency: "INR",
      });
      const orderId = purchase.payment.payment_intent_id;
      const keyId = purchase.razorpay_key_id;
      const amount = purchase.payment.payment?.amount;

      if (!orderId || !keyId || typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
        throw new Error("The payment order is missing valid gateway details. Please try again.");
      }

      await openCheckout({
        key: keyId,
        amount: Math.round(amount * 100),
        currency: purchase.payment.payment?.currency || "INR",
        order_id: orderId,
        name: "Patwatoli AI",
        description: `${plan.plan_name} (${billingCycle}) Subscription`,
        prefill: {
          name: user.full_name || undefined,
          email: user.email || undefined,
        },
        themeColor: "#0b6e42",
        onSuccess: async (response) => {
          try {
            const verification = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verification.status !== "verified" && verification.status !== "already_paid") {
              setErrorMessage("Payment verification is pending. Your account has not been updated yet.");
              return;
            }

            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ["public-plans"] }),
              queryClient.invalidateQueries({ queryKey: ["billing-usage"] }),
              queryClient.invalidateQueries({ queryKey: ["user-subscription"] }),
            ]);
            router.replace("/chat");
          } catch (error: unknown) {
            setErrorMessage(getErrorMessage(error, "Payment verification failed. Please contact support."));
          } finally {
            setProcessingPlanCode(null);
          }
        },
        onDismiss: () => setProcessingPlanCode(null),
        onError: (error: { message?: string }) => {
          setErrorMessage(error.message || "Payment failed. Please try again.");
          setProcessingPlanCode(null);
        },
      });
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, "Unable to start checkout. Please try again."));
      setProcessingPlanCode(null);
    }
  };

  return (
    <>
      <section className="pricing section" id="pricing">
        <div className="pricing-heading">
          <h2>
            More possibilities.<br />
            <span>A plan to match.</span>
          </h2>
          <p>
            Start exploring for free. Step up your token allowance
            <br />
            and access as your ambitions grow.
          </p>

          <div className="billing-toggle" role="group" aria-label="Billing frequency">
            <button aria-pressed={!annual} onClick={() => setAnnual(false)}>
              Monthly
            </button>
            <button aria-pressed={annual} onClick={() => setAnnual(true)}>
              Annually <span>Save 17%</span>
            </button>
          </div>

          <p className="billing-caption">
            {annual
              ? "Annual billing. Save approximately 17% compared with 12 monthly payments."
              : "Monthly billing. Choose the plan that fits your work."}
          </p>
        </div>

        {isPlansLoading ? (
          <div className="pricing-grid" aria-live="polite">
            <p>Loading available plans...</p>
          </div>
        ) : isPlansError ? (
          <p role="alert" className="pricing-note">
            {getErrorMessage(plansError, "Unable to load plans. Please refresh and try again.")}
          </p>
        ) : (
          <div className="pricing-grid">
            {(data?.plans ?? []).map((plan) => {
              const planCode = plan.plan_code.toLowerCase();
              const isFree = planCode === "free";
              const isCurrentPlan = activePlanCode === planCode;
              const isCurrentSelection = !isFree && isCurrentPlan && activeBillingCycle === billingCycle;
              const price =
                plan.prices.find((item) => item.billing_cycle === billingCycle) ??
                plan.prices.find((item) => item.billing_cycle === "monthly");
              const amountLabel = price
                ? `${price.currency === "INR" ? "₹" : `${price.currency} `}${price.amount.toLocaleString("en-IN")}`
                : "Unavailable";
              const isProcessing = processingPlanCode === plan.plan_code;
              const isDisabled = processingPlanCode !== null || (!isFree && !price);

              return (
                <article
                  className={`price-card${planCode === "pro" ? " pro-card" : ""}${planCode === "enterprise" ? " enterprise-card" : ""}`}
                  key={plan.id}
                >
                  {planCode === "pro" && <div className="plan-badge">MOST POPULAR</div>}
                  <div className="plan-symbol">{planCode === "enterprise" ? "◈" : planCode === "pro" ? "♛" : "✧"}</div>
                  <h3>{plan.plan_name}</h3>
                  <p className="plan-description">{plan.description || "A plan for your AI workspace."}</p>
                  <div className="price-line">
                    <strong>{isFree ? "Free" : amountLabel}</strong>
                    <span className="paid-period">{isFree ? "/ forever" : annual ? "/ year" : "/ month"}</span>
                  </div>
                  <p className="annual-detail">
                    {isFree ? "No subscription payment." : annual ? "Billed annually." : "Billed monthly."}
                  </p>
                  <div className="token-allowance">
                    <b>{plan.monthly_token_limit.toLocaleString("en-IN")}</b> tokens per month
                  </div>
                  <button
                    className="plan-button"
                    type="button"
                    onClick={() => void handleChoosePlan(plan)}
                    disabled={isDisabled || isCurrentSelection}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Opening secure checkout...
                      </>
                    ) : isCurrentSelection ? (
                      <>
                        <Check size={16} />
                        Current plan
                      </>
                    ) : isFree ? (
                      "Start chatting"
                    ) : (
                      `Choose ${plan.plan_name}`
                    )}
                  </button>
                  <div className="included">INCLUDED FEATURES</div>
                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        )}

        {errorMessage && (
          <p role="alert" className="pricing-note" style={{color: "red" }}>
            {errorMessage}
          </p>
        )}
        <div className="pricing-foot">
          <span>✓ Checkout via Razorpay</span>
          <span>UPI · Credit/debit cards · NetBanking</span>
        </div>
        <p className="pricing-note">
          Payment is verified securely before your account is updated. Token allowances are monthly for both billing options.
        </p>
      </section>

      <section className="faq section" id="faq">
        <div>
          <div className="eyebrow">A FEW GOOD QUESTIONS</div>
          <h2>
            Curious?<br />
            <span>You&apos;re in good company.</span>
          </h2>
        </div>

        <div className="questions">
          <details open>
            <summary>What is Patwatoli AI?<span>＋</span></summary>
            <p>
              Patwatoli AI is a multi-model AI platform featuring General, LawGPT, Code Architect, Med Assist, and more. Choose a specialist for your topic, alongside AI conversations, PDF analysis, and voice processing.
            </p>
          </details>
          <details>
            <summary>How do I get started?<span>＋</span></summary>
            <p>Select “Try Patwatoli” to open the platform. Sign up or log in there, then start a conversation.</p>
          </details>
          <details>
            <summary>How should I use specialist AI models?<span>＋</span></summary>
            <p>
              Use specialist models to explore and understand topics. LawGPT does not replace a qualified legal professional, and Med Assist is for health information, not diagnosis or treatment. Review generated code and verify important AI responses.
            </p>
          </details>
          <details>
            <summary>Where can I find account and pricing details?<span>＋</span></summary>
            <p>
              Compare the Free, Pro, and Enterprise plans above, then open the platform to select a plan and complete payment. For specific questions, visit our{" "}
              <a href="https://patwatoliai.com/contact">contact page</a>.
            </p>
          </details>
        </div>
      </section>

      <section className="closing">
        <span className="closing-star">✳</span>
        <h2>
          Many models.<br />
          <em>One powerful possibility. You.</em>
        </h2>
        <a className="button" href="/chat">
          Let’s get started <span>↗</span>
        </a>
        <p>Think it. Ask it. Make it happen.</p>
      </section>

      <LandingFooter />
    </>
  );
}
