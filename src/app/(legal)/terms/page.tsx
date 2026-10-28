
"use client";

import { motion } from "framer-motion";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFooter } from "@/components/landing/landing-footer";
import {
  Shield,
  FileText,
  CheckCircle,
  AlertCircle,
  Users,
  Lock,
  Server,
  CreditCard,
  Scale,
  Mail,
  Globe,
  BookOpen,
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

export default function TermsPage() {
  const sections = [
    {
      icon: FileText,
      title: "1. Overview",
      content:
        "We, Us, Our refer to Cloude Data. You, User, Customer refer to any individual or legal entity using our services. Services refer to all products and solutions offered by Cloude Data. This Agreement does not create any third-party rights.",
    },
    {
      icon: BookOpen,
      title: "2. Definitions",
      content:
        "We, Us, Our = Cloude Data; You, User, Customer = individual or entity using services; Services = all products and solutions. This Agreement does not create any third-party rights.",
    },
    {
      icon: AlertCircle,
      title: "3. Modifications to Terms",
      content:
        "Cloude Data reserves the right to modify these Terms at any time. Updated terms become effective immediately once posted on the website. Continued use of the website or services after updates indicates acceptance of the revised terms.",
    },
    {
      icon: Shield,
      title: "4. Eligibility & Authority",
      content:
        "By using our services, you confirm that: (1) you are at least 18 years of age; (2) you are legally capable of entering binding contracts; (3) you are not restricted under Indian or international law; and (4) if acting on behalf of an organization, you have the legal authority to bind that organization to these Terms.",
    },
    {
      icon: Globe,
      title: "5. Sanctions Compliance",
      content:
        "You represent that you are not subject to sanctions imposed by India, the United States, the European Union, the United Nations, or other governing authorities. Cloude Data reserves the right to suspend or terminate services immediately if sanctions violations are suspected.",
    },
    {
      icon: Lock,
      title: "6. Account Registration & Security",
      content:
        "To access certain services, you must create an account. You agree to provide accurate and complete information, maintain confidentiality of login credentials, and notify us immediately of unauthorized access. You are solely responsible for all activities that occur under your account.",
    },
    {
      icon: Server,
      title: "7. International Data Transfer",
      content:
        "By accessing our website or services, you consent to the transfer, storage, and processing of data across international borders, including servers located outside your country.",
    },
    {
      icon: Users,
      title: "8. Account Sharing & Access Permissions",
      content:
        "Users may grant limited access to trusted individuals. However, the account holder remains fully responsible for all actions taken through the account, and Cloude Data is not responsible for disputes between account holders and authorized users.",
    },
    {
      icon: CheckCircle,
      title: "9. Service Availability",
      content:
        "Cloude Data aims to provide services 24/7. However, service availability may be affected by scheduled maintenance, technical failures, or events beyond our control. We do not guarantee uninterrupted service and are not liable for downtime.",
    },
    {
      icon: AlertCircle,
      title: "10. Acceptable Use Policy",
      content:
        "You agree not to use Cloude Data services for: illegal activities, child exploitation, terrorism, spam, malware distribution, cryptocurrency mining without permission, intellectual property violations, false claims, or activities threatening national security. Violations may result in immediate suspension or termination.",
    },
    {
      icon: Scale,
      title: "11. Intellectual Property Rights",
      content:
        "All content, software, trademarks, designs, and materials on the website are owned or licensed by Cloude Data and protected under intellectual property laws. You may not copy, reproduce, modify, or distribute any materials without written permission.",
    },
    {
      icon: FileText,
      title: "12. User Content",
      content:
        "You retain ownership of the content you host using our services. However, by uploading content, you grant Cloude Data a limited license to host and process the content solely for service delivery. You are responsible for ensuring that your content does not violate third-party rights.",
    },
    {
      icon: Shield,
      title: "13. Monitoring & Termination",
      content:
        "Cloude Data reserves the right to monitor hosted content, remove prohibited materials, and suspend or terminate accounts without prior notice. Repeated violations may result in permanent service termination.",
    },
    {
      icon: AlertCircle,
      title: "14. No Spam Policy",
      content:
        "Sending spam, bulk messages, or unsolicited communications using Cloude Data services is strictly prohibited. Violations will result in immediate service suspension or termination.",
    },
    {
      icon: Globe,
      title: "15. Third-Party Links",
      content:
        "Our website may contain links to third-party websites. Cloude Data is not responsible for their content, policies, or practices. Use third-party websites at your own risk.",
    },
    {
      icon: Sparkles,
      title: "16. AI & Automated Tools",
      content:
        "Cloude Data may provide AI-based tools and automation features. Users are responsible for reviewing AI-generated outputs before using them. Sensitive or confidential data should not be uploaded to AI tools.",
    },
    {
      icon: AlertCircle,
      title: "17. Disclaimer of Warranties",
      content:
        "All services are provided 'as is' and 'as available' without warranties of any kind. Cloude Data does not guarantee uninterrupted service or accuracy of information.",
    },
    {
      icon: Scale,
      title: "18. Limitation of Liability",
      content:
        "To the maximum extent permitted by law, Cloude Data will not be liable for loss of data, business interruption, loss of profits, or indirect damages. Total liability shall not exceed the amount paid by the user in the previous 12 months or ₹100,000, whichever is lower.",
    },
    {
      icon: Shield,
      title: "19. Indemnification",
      content:
        "You agree to indemnify and hold Cloude Data harmless against claims arising from your use of services, violation of this Agreement, or infringement of third-party rights.",
    },
    {
      icon: AlertCircle,
      title: "20. Discontinued Services",
      content:
        "Cloude Data may discontinue services at any time. Where possible, customers will receive advance notice and may be provided with migration or refund options depending on the situation.",
    },
    {
      icon: CreditCard,
      title: "21. Fees, Payments & Renewals",
      content:
        "All prices exclude applicable taxes. Services may automatically renew unless disabled. Refunds are governed by the Refund Policy. Non-payment may result in suspension or termination.",
    },
    {
      icon: Scale,
      title: "22. Governing Law & Jurisdiction",
      content:
        "These Terms are governed by the laws of India. All disputes shall be subject to the exclusive jurisdiction of the courts in New Delhi.",
    },
    {
      icon: Mail,
      title: "23. Contact Information",
      content:
        "Address: Okhla Industrial Estate, Phase 3, New Delhi – 110020, India",
    },
  ];

  const erpSections = [
    {
      title: "24.1 Scope of Services",
      content:
        "Secure cloud-hosted access to Accounting ERP solutions including storage and management of client accounting data on dedicated cloud servers.",
    },
    {
      title: "24.2 Data Responsibility & Security",
      content:
        "Cloude Data maintains uptime and data protection. In case of cyber-attack, the most recent verified backup will be restored. Liability is limited to restoration up to the latest available backup.",
    },
    {
      title: "24.3 Client Conduct & Liability",
      content:
        "Clients must use services responsibly and lawfully. Abusive, unlawful, or inappropriate conduct may result in service suspension or termination.",
    },
    {
      title: "24.4 Data Access & Client Control",
      content:
        "Cloude Data does not access, modify, or control client data stored in the assigned cloud environment. Clients retain full responsibility for managing, copying, editing, and deleting their data.",
    },
    {
      title: "24.5 Malicious File Policy",
      content:
        "Uploading malicious or harmful files is strictly prohibited. If such actions cause damage or service interruption, the client will be fully liable for losses and associated recovery costs.",
    },
    {
      title: "24.6 Backup Policy",
      content:
        "Client data is backed up regularly (typically daily). In case of data loss, restoration will occur within 6–24 hours from the latest available backup.",
    },
    {
      title: "24.7 Server Maintenance & Downtime",
      content:
        "Emergency maintenance may occur when required for system stability. Where possible, at least 1 hour prior notice will be provided.",
    },
    {
      title: "24.8 Support Availability",
      content:
        "Support is available Monday–Saturday, 10:00 AM – 7:30 PM IST. All support requests must be submitted through the official support portal or support email.",
    },
    {
      title: "24.9 No Refund Policy",
      content:
        "All payments made to Patwatoli are non-refundable, including cases of cancellation, dissatisfaction, or downtime caused by third-party or client-side issues.",
    },
    {
      title: "24.10 Fees & Payment",
      content:
        "Clients must pay the service fees as specified in their billing invoice, plan, and subscription period.",
    },
    {
      title: "24.11 Term, Renewal & Termination",
      content:
        "Services automatically renew unless either party provides 30 days written notice. Upon termination, clients will have 2–3 days to export their data.",
    },
    {
      title: "24.12 Governing Law & Jurisdiction",
      content:
        "These service-specific terms are governed by the laws of India, and disputes fall under the courts of New Delhi.",
    },
  ];

  return (
    <>
    <LandingNavbar />
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-[#f4faf6] to-white px-4 pt-8 pb-12">

      {/* Decorative Background Elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[#087849]/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#087849]/10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#087849]/5 blur-3xl"></div>
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
            <Scale className="h-4 w-4 text-[#087849]" />
            <span className="text-sm font-medium text-[#087849]">
              Legal Agreement
            </span>
          </div>

          <h1 className="mb-4 text-4xl font-bold md:text-6xl">
            <span className="text-[#087849]">
              Terms of Service
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-xl text-zinc-600">
            Please read this agreement carefully, as it contains important
            information regarding your legal rights and remedies.
          </p>

          <div className="mt-4 flex flex-col items-center justify-center gap-4 text-sm text-zinc-500 sm:flex-row">
            
            <span className="hidden sm:block">•</span>
            <span>www.patwatoliai.com</span>
            <span className="hidden sm:block">•</span>
            <span>Effective: July 11, 2026</span>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="h-1 w-24 rounded-full bg-[#087849]"></div>
          </div>
        </motion.div>

        {/* Main Terms Sections */}
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
                delay: index * 0.03,
              }}
              className="group rounded-2xl border border-zinc-200/70 bg-white/90 p-6 shadow-lg shadow-zinc-500/5 backdrop-blur-sm transition-all duration-300 hover:border-[#087849]/40 hover:shadow-xl hover:shadow-[#087849]/10"
            >
              <div className="flex items-start gap-4">

                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#087849]/10 transition-transform duration-300 group-hover:scale-110">
                    <section.icon className="h-5 w-5 text-[#087849]" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-zinc-900">
                    {section.title}
                  </h3>

                  <p className="whitespace-pre-line leading-relaxed text-zinc-600">
                    {section.content}
                  </p>
                </div>

              </div>
            </motion.div>
          ))}

          {/* Service-Specific Terms - Patwatoli Accounting ERP */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.4 }}
            className="mt-12 rounded-2xl border border-[#087849]/20 bg-[#087849]/5 p-6 shadow-lg shadow-[#087849]/5"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#087849]/10">
                <Server className="h-6 w-6 text-[#087849]" />
              </div>

              <h2 className="text-2xl font-bold text-zinc-900">
                24. Service-Specific Terms – Patwatoli Accounting ERP on Cloud
              </h2>
            </div>

            <div className="space-y-4">
              {erpSections.map((section, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                  }}
                  className="rounded-xl border border-[#087849]/10 bg-white/80 p-4 backdrop-blur-sm transition-all duration-300 hover:border-[#087849]/40 hover:shadow-md hover:shadow-[#087849]/5"
                >
                  <h4 className="mb-1 font-semibold text-zinc-800">
                    {section.title}
                  </h4>

                  <p className="text-sm leading-relaxed text-zinc-600">
                    {section.content}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            variants={fadeInUp}
            transition={{
              duration: 0.4,
              delay: 0.5,
            }}
            className="mt-12 rounded-2xl border border-[#087849]/20 bg-[#087849]/5 p-8 text-center"
          >
         

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-500">
              <span>www.patwatoliai.com</span>
              <span>•</span>
              <span>Last updated: July 11, 2026</span>
            </div>

            <div className="mt-4 border-t border-[#087849]/15 pt-4">
              <p className="text-xs text-zinc-400">
                © 2026 Patwatoli. All rights reserved.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
    <LandingFooter />
    </>
  );
}
