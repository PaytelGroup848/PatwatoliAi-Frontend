
"use client";

import { motion } from "framer-motion";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFooter } from "@/components/landing/landing-footer";
import {
  Shield,
  FileText,
  Users,
  Lock,
  Server,
  Globe,
  Mail,
  Building,
  Clock,
  Sparkles,
} from "lucide-react";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function PrivacyPage() {
  const sections = [
    {
      icon: FileText,
      title: "1. Overview",
      content: `This Universal Terms of Service Agreement ("Agreement") is entered into between Patwatoli and you ("User") and becomes effective on the date you access our website or electronically accept these terms.

Unless stated otherwise, the contracting entity is:

Paytel Terminal Pvt. Ltd.

Registered Address: Okhla Industrial Estate, Phase 3, New Delhi – 110020, India

This Agreement governs your use of:
• The Patwatoli website ("Site")
• All products and services provided by Patwatoli ("Services")

Your use of the Site or Services confirms that you have read and understood this Agreement, agree to comply with all applicable policies, and are using our Services for commercial or professional purposes. Patwatoli reserves the right to update or modify these terms at any time; continued use constitutes acceptance.`,
    },
    {
      icon: Shield,
      title: "2. Eligibility & Authority",
      content: `To use Patwatoli Services, you confirm that:
• You are at least 18 years of age
• You are legally capable of entering into binding agreements
• You are not prohibited under applicable laws of India or other jurisdictions

If you accept this Agreement on behalf of a business or legal entity, you confirm that you have full authority to bind that entity to these terms. You remain responsible for all activities conducted through your account.`,
    },
    {
      icon: Globe,
      title: "3. Sanctions & Compliance",
      content: `You represent and warrant that you are not located in, resident of, or operating from a sanctioned country, nor affiliated with any sanctioned individual or entity. You will not use Patwatoli Services for or on behalf of any sanctioned party.

Patwatoli reserves the right to conduct sanctions screening, request verification information, and suspend or terminate Services immediately if sanctions violations are detected. You agree to indemnify Patwatoli against any losses arising from non-compliance.`,
    },
    {
      icon: Lock,
      title: "4. Account Registration & Security",
      content: `To access certain Services, you must create a Patwatoli account. You agree to provide accurate and complete account information, keep login credentials secure, and update information promptly.

Security recommendation: Change your password at least once every six (6) months.

Patwatoli is not responsible for losses resulting from unauthorised access caused by your failure to secure your credentials.`,
    },
    {
      icon: Users,
      title: "5. Account Access & Sharing",
      content: `Patwatoli allows controlled account access to trusted third parties. By granting access, you acknowledge that access is provided at your own risk, authorised users may view limited personal and billing information, and certain critical actions remain restricted.

You assume full legal and financial responsibility for actions taken by authorised users. Patwatoli is not responsible for disputes between account holders and authorised third parties.`,
    },
    {
      icon: Server,
      title: "6. International Data Transfers",
      content: `If you access Patwatoli Services from outside the country where our servers are located, your data may be transferred across international borders. By using our Services, you consent to such transfers in compliance with applicable data protection laws.`,
    },
    {
      icon: Clock,
      title: "7. Service Availability",
      content: `Patwatoli aims to provide services 24/7, using commercially reasonable efforts. However, you acknowledge that services may occasionally be unavailable due to scheduled maintenance, system upgrades, network failures, cybersecurity incidents, or events beyond our reasonable control.

Patwatoli does not guarantee uninterrupted availability and shall not be liable for downtime beyond its reasonable control.`,
    },
    {
      icon: Sparkles,
      title: "8. Pre-Release & Beta Services",
      content: `From time to time, Patwatoli may offer beta services or limited preview features. These services are provided "as-is" and may be modified or discontinued at any time.`,
    },
  ];

  return (
    <>
    <LandingNavbar />
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-[#f4faf6] to-white px-4 pt-8 pb-12">

      {/* Decorative Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-[#087849]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#087849]/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#087849]/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl">

        {/* Header */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#087849]/20 bg-[#087849]/5 px-4 py-2 backdrop-blur-sm">
            <Shield className="h-4 w-4 text-[#087849]" />
            <span className="text-sm font-medium text-[#087849]">
              Legal Document
            </span>
          </div>

          <h1 className="mb-4 text-4xl font-bold md:text-6xl">
            <span className="text-[#087849]">
              Privacy & Terms
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-xl text-zinc-600">
            Please read this agreement carefully, as it contains important
            information regarding your legal rights and remedies.
          </p>

          <div className="mt-4 flex flex-col items-center justify-center gap-4 text-sm text-zinc-500 sm:flex-row">
            <span className="flex items-center gap-1">
              <Mail className="h-4 w-4 text-[#087849]" />
              support@patwatoli.com
            </span>

            <span className="hidden sm:block">•</span>
            <span>www.patwatoliai.com</span>
            <span className="hidden sm:block">•</span>
            <span>Effective: July 11, 2026</span>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="h-1 w-24 rounded-full bg-[#087849]" />
          </div>
        </motion.div>

        {/* Company Information */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8 rounded-2xl border border-[#087849]/20 bg-[#087849]/5 p-6 shadow-lg shadow-[#087849]/5"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#087849]/10">
                <Building className="h-6 w-6 text-[#087849]" />
              </div>
            </div>

            <div>
              <h3 className="mb-1 text-lg font-semibold text-zinc-900">
                Contracting Entity
              </h3>

              <p className="font-medium text-zinc-700">
                Paytel Terminal Pvt. Ltd.
              </p>

              <p className="mt-1 text-sm text-zinc-600">
                Registered Address: Okhla Industrial Estate, Phase 3,
                New Delhi – 110020, India
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          variants={staggerContainer}
          initial={false}
          animate="animate"
          className="space-y-6"
        >
          {sections.map((section, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
              }}
              className="group rounded-2xl border border-zinc-200/70 bg-white/90 p-6 shadow-lg shadow-zinc-500/5 backdrop-blur-sm transition-all duration-300 hover:border-[#087849]/40 hover:shadow-xl hover:shadow-[#087849]/10"
            >
              <div className="flex items-start gap-4">

                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#087849]/10 transition-transform duration-300 group-hover:scale-110">
                    <section.icon className="h-5 w-5 text-[#087849]" />
                  </div>
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-zinc-900">
                    {section.title}
                  </h3>

                  <div className="leading-relaxed text-zinc-600 whitespace-pre-line">
                    {section.content.split("\n").map((line, i) => {
                      if (line.trim().startsWith("•")) {
                        return (
                          <div
                            key={i}
                            className="ml-2 mt-1 flex items-start gap-2"
                          >
                            <span className="mt-1 text-[#087849]">
                              •
                            </span>
                            <span>
                              {line.trim().substring(1).trim()}
                            </span>
                          </div>
                        );
                      }

                      return line ? (
                        <p key={i} className="mt-1">
                          {line}
                        </p>
                      ) : (
                        <br key={i} />
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mt-12 rounded-2xl border border-[#087849]/20 bg-[#087849]/5 p-8 text-center"
        >
          <h3 className="mb-4 text-xl font-semibold text-zinc-900">
            Contact Information
          </h3>

          <p className="mb-2 text-zinc-600">
            For questions regarding these Terms of Service,
            please contact:
          </p>

          <div className="flex flex-col items-center justify-center gap-4 text-sm sm:flex-row">
            <a
              href="mailto:support@patwatoli.com"
              className="flex items-center gap-2 font-medium text-[#087849] hover:text-[#065c37] hover:underline"
            >
              <Mail className="h-4 w-4" />
              support@patwatoli.com
            </a>

            <span className="hidden text-zinc-300 sm:block">
              |
            </span>

            <span className="text-zinc-500">
              www.patwatoliai.com
            </span>
          </div>

          <div className="mt-4 border-t border-[#087849]/15 pt-4">
            <p className="text-xs text-zinc-400">
              Last updated: July 11, 2026
            </p>

            <p className="mt-1 text-xs text-zinc-400">
              © 2026 Patwatoli. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
    <LandingFooter />
    </>
  );
}
