"use client";

import { useState, useEffect } from "react";
import { X, ShieldCheck, Building2, User, Phone, MapPin, Loader2, ArrowRight } from "lucide-react";
import { BillingDetails, PublicPlan } from "../types/billing.types";

interface BillingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PublicPlan | null;
  billingCycle: "monthly" | "yearly";
  initialDetails?: Partial<BillingDetails>;
  onSubmit: (details: BillingDetails) => void;
  isProcessing?: boolean;
}

const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Other / Outside India"
];

export function BillingDetailsModal({
  isOpen,
  onClose,
  plan,
  billingCycle,
  initialDetails,
  onSubmit,
  isProcessing = false,
}: BillingDetailsModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("Bihar");
  const [postalCode, setPostalCode] = useState("");
  const [isBusiness, setIsBusiness] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialDetails) {
      if (initialDetails.name) setName(initialDetails.name);
      if (initialDetails.phone) setPhone(initialDetails.phone);
      if (initialDetails.state) setState(initialDetails.state);
      if (initialDetails.postal_code) setPostalCode(initialDetails.postal_code);
      if (initialDetails.company_name || initialDetails.gstin) {
        setIsBusiness(true);
        if (initialDetails.company_name) setCompanyName(initialDetails.company_name);
        if (initialDetails.gstin) setGstin(initialDetails.gstin);
      }
    }
  }, [initialDetails, isOpen]);

  if (!isOpen || !plan) return null;

  const currentPrice = plan.prices.find((p) => p.billing_cycle === billingCycle)?.amount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanName = name.trim();
    const cleanPhone = phone.trim().replace(/[^0-9]/g, "");

    if (!cleanName || cleanName.length < 2) {
      setValidationError("Please enter your full legal name.");
      return;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      setValidationError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!state) {
      setValidationError("Please select your state/province.");
      return;
    }

    // Optional GST validation if business toggle is active
    if (isBusiness && gstin.trim()) {
      const cleanGst = gstin.trim().toUpperCase();
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(cleanGst)) {
        setValidationError("Invalid GSTIN format. Expected 15 characters (e.g., 10AAAAA0000A1Z5).");
        return;
      }
    }

    onSubmit({
      name: cleanName,
      phone: cleanPhone,
      state: state,
      postal_code: postalCode.trim() || undefined,
      company_name: isBusiness ? companyName.trim() || undefined : undefined,
      gstin: isBusiness && gstin.trim() ? gstin.trim().toUpperCase() : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 dark:bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl transition-all text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold mb-1 border border-emerald-200 dark:border-emerald-800/60">
              <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
              <span>Official Tax Invoicing</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Billing Information</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Upgrading to <span className="font-semibold text-slate-800 dark:text-slate-200">{plan.plan_name}</span> ({billingCycle === "yearly" ? "Annual" : "Monthly"}) • ₹{currentPrice?.toLocaleString("en-IN")}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {validationError && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-3 text-xs text-rose-700 dark:text-rose-300 font-medium">
              {validationError}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Legal Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={15} />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Phone and State in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone size={15} />
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="9876543210"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                State / UT <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin size={15} />
                </div>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-slate-900 dark:text-slate-100"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Postal Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              PIN Code / Postal Code <span className="text-slate-400 text-[11px]">(Optional)</span>
            </label>
            <input
              type="text"
              maxLength={6}
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 823003"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Business / GST Toggle */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/50 p-3.5 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isBusiness}
                onChange={(e) => setIsBusiness(e.target.checked)}
                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Purchasing for a registered business / company? <span className="text-slate-400 font-normal">(Optional GST)</span>
              </span>
            </label>

            {isBusiness && (
              <div className="space-y-3 pt-2 border-t border-slate-200/70 dark:border-slate-700/70">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Company / Organization Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building2 size={14} />
                    </div>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Patwatoli Technologies Pvt Ltd"
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    GSTIN <span className="text-slate-400">(Optional for 18% Input Tax Credit)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 10AAAAA0000A1Z5"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Security note & Action buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Initiating Secure Gateway...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Payment (₹{currentPrice?.toLocaleString("en-IN")})</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2 flex items-center justify-center gap-1">
              <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>256-bit encrypted SSL checkout powered by Razorpay</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
