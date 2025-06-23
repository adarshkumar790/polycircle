import React from "react";
import Image from "next/image";

const features = [
  {
    icon: '/logo/profiles.svg',
    title: "Global Business Opportunity",
    description:
      "POLYCIRCLE is a 100% digital platform. You can join, refer, and earn from anywhere in the world—no physical products, no shipping, just pure digital business from your smartphone.",
  },
  {
    icon: '/logo/easygrowth.svg',
    title: "Instant Payout & Transparent System",
    description:
      "Experience instant payouts with every earning directly credited to your wallet through a fully automated, transparent, and decentralized system where every referral and board movement is trackable—no delays, no manipulation, no middleman.",
  },
  {
    icon: '/logo/ultimate.svg',
    title: "Lifetime Access & Influencer Friendly",
    description:
      "Activate once with $50 for lifetime validity—no renewals or fees—perfect for influencers and affiliates to earn big with the viral 2x2 board system.",
  },
  {
    icon: '/logo/secure.svg',
    title: "Scalable Growth with Expert Support",
    description:
      "Unlock exponential income by adding just 2 direct members, triggering team expansion into hundreds—plus benefit from regular Zoom sessions, training, and a supportive community to accelerate your success.",
  },
];

const WhyChoosePolycircle: React.FC = () => {
  return (
    <section className="bg-black text-white py-16 px-4" id="features">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Why You Should Choose <span className="text-purple-500">PolyCircle</span>
        </h2>
        <p className="text-sm md:text-base text-gray-300 max-w-3xl mx-auto mb-10">
          PolyCircle is the international community of the global decentralized ecosystem and the first-ever audited and trusted smart contract marketing matrix of the Polygon network. It operates via a self-executing algorithm that automatically distributes rewards between community members under a matrix marketing plan. Its code is publicly available, and all transactions are transparently recorded on polygonscan.com.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-[#2b103f] text-white rounded-lg p-6 flex gap-4 shadow-md border-b-3 border-b-white/40"
          >
            {/* Icon Container matches height of text content */}
            <div className="h-full flex items-start pt-1">
              <Image
                src={feature.icon}
                alt={feature.title}
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-semibold">{feature.title}</h3>
              <p className="text-sm md:text-lg text-gray-300 mt-1">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChoosePolycircle;
