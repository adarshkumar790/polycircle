"use client";

import Image from "next/image";

const termsData = {
  title: "Terms & Conditions",
  subtitle: "POLYCIRCLE Registered Members",
  icon: "/logo/terms.svg",
  intro:
    "These Terms & Conditions govern your use of the POLYCIRCLE platform and participation in the 2×2 Board Plan. By registering and activating your ID, you agree to abide by the following rules and policies:",
  sections: [
    {
      heading: "1. Membership Eligibility",
      points: [
        "You must be at least 18 years old to join.",
        "You must provide accurate and complete information at the time of registration.",
        "Only one account per wallet is allowed.",
      ],
    },
    {
      heading: "2. Activation",
      points: [
        "A one-time payment of $50 is required to activate your ID.",
        "Activation fee is non-refundable under any circumstances.",
        "You must activate your account immediately on registration, failing which your ID may be deactivated or deleted.",
      ],
    },
    {
      heading: "3. Earnings & Payouts",
      points: [
        "All earnings (Referral, Upline, Level Income, Re-Birth, Top-Up rewards) depend on your and your team's performance.",
        "POLYCIRCLE does not guarantee fixed or passive income.",
        "Withdrawals can be made as per the plan calculations and applicable charges.",
      ],
    },
    {
      heading: "4. Referral System",
      points: [
        "You are allowed and encouraged to refer unlimited members using your referral link.",
        "Fake or duplicate accounts are strictly prohibited and may lead to suspension of your original account.",
        "Each member is responsible for managing and supporting their referred users.",
      ],
    },
    {
      heading: "5. Anti-Fraud & Ethics",
      points: [
        "No spamming, misleading promotions, or misrepresentation of the plan is allowed.",
        "Members involved in unethical practices (e.g., fake IDs, bots, cheating re-births, etc.) will be permanently banned without payout.",
        "You may not present POLYCIRCLE as an investment or trading platform.",
      ],
    },
    {
      heading: "6. Re-Birth Mechanism",
      points: [
        "Re-birth (auto-recycle) is an automatic feature once your POLYCIRCLE Level 1 and Level 2 boards are completed.",
        "You will continue to earn income through re-births without any additional payments.",
      ],
    },
    {
      heading: "7. Account Suspension or Termination",
      points: [
        "Accounts found in violation of any terms may be suspended or permanently terminated.",
        "In such cases, POLYCIRCLE holds the right to withhold any unpaid earnings.",
      ],
    },
    {
      heading: "8. Taxation & Legal Responsibility",
      points: [
        "Members are responsible for reporting and paying applicable taxes on their earnings.",
        "POLYCIRCLE will not be responsible for any local tax liabilities.",
      ],
    },
    {
      heading: "9. Changes to the Plan",
      points: [
        "POLYCIRCLE reserves the right to update the compensation plan, features, terms, or platform policies at any time with or without notice.",
        "Continued use of the platform after such changes implies acceptance of the updated terms.",
      ],
    },
    {
      heading: "10. Limitation of Liability",
      points: [
        "POLYCIRCLE is a digital marketing platform and does not offer financial investment advice.",
        "POLYCIRCLE is not liable for any loss or damages resulting from user negligence, technical failures, or third-party services.",
      ],
    },
    {
      heading: "11. Support & Dispute Resolution",
      points: [
        "For any queries, contact your sponsor or reach out to official support via email or WhatsApp.",
        "Disputes will be resolved internally in a fair and transparent manner.",
      ],
    },
  ],
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black bg-[url('/hex-pattern.png')] bg-cover bg-center text-white px-4 py-12 flex items-center justify-center">
      <div className="max-w-5xl mx-auto w-full">
        {/* Title Section */}
        <div className="flex items-center gap-4 mb-12">
          <div
            className="flex-grow h-px mt-4"
            style={{
              background:
                "linear-gradient(to right, rgb(55, 2, 63), rgb(86, 8, 98), hsl(306, 88.5%, 37.5%))",
            }}
          ></div>

          <div className="flex flex-col items-center text-center px-4">
            <div className="text-3xl sm:text-4xl mb-1">
              <Image
                src={termsData.icon}
                width={40}
                height={40}
                alt="Terms Icon"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold leading-tight">
              {termsData.title}
            </h1>
            <p className="text-slate-100 text-xs sm:text-sm mt-1">
              {termsData.subtitle}
            </p>
          </div>

          <div
            className="flex-grow h-px mt-4"
            style={{
              background:
                "linear-gradient(to right, #9608AD, rgb(121, 2, 139), #000000)",
            }}
          ></div>
        </div>

        {/* Introduction & Sections */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-gray-200">
          <p>{termsData.intro}</p>

          {termsData.sections.map((section, index) => (
            <div key={index}>
              <h2 className="text-purple-400 font-semibold text-lg mb-2">
                {section.heading}
              </h2>
              <ul className="list-disc list-inside space-y-1">
                {section.points.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          ))}

        </div>
        <div className="flex items-center gap-4 mb-6 mt-6">
          <div
            className="flex-grow h-px mt-4"
            style={{
              background:
            "linear-gradient(to right, rgb(55, 2, 63), rgb(86, 8, 98), hsl(306, 88.5%, 37.5%))",
            }}
          ></div>

          <div className="flex flex-col items-center text-center px-2">
            <h2 className="text-xl sm:text-2xl font-bold leading-tight mt-4">
              Final Note
            </h2>
          </div>

          <div
            className="flex-grow h-px mt-4"
            style={{
              background:
            "linear-gradient(to right, #9608AD, rgb(121, 2, 139), #000000)",
            }}
          ></div>
          
        </div>
         <p className="text-slate-100 text-xs sm:text-sm mt-1">
              By joining and activating your ID on POLYCIRCLE, you agree to follow all policies and promote the plan ethically. POLYCIRCLE aims to empower individuals with a transparent, team-based income opportunity. Misuse of the system will lead to loss of access and benefits
            </p>
      </div>
    </div>
  );
}
