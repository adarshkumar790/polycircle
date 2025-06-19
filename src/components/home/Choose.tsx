import React from "react";
import Image from "next/image";

const features = [
  {
    icon: '/logo/profiles.svg',
    title: "PROFILE ASSURANCE",
    description:
      "Your investments are strategically designed to generate consistent returns with our innovative economic model.",
  },
  {
    icon: '/logo/easygrowth.svg',
    title: "EASY GROWTH",
    description:
      "A seamless and automated process ensures that your funds grow effortlessly through smart contracts and decentralized finance (DeFi) mechanisms.",
  },
  {
    icon: '/logo/ultimate.svg',
    title: "UNLIMITED INCOME",
    description:
      "With no earning caps, your potential scales as your participation increases, leveraging referral bonuses, team growth, and arbitrage opportunities.",
  },
  {
    icon: '/logo/secure.svg',
    title: "SAFE & SECURE",
    description:
      "Built on blockchain technology, INOUT guarantees transparency, security, and trust, ensuring your funds remain protected at all times.",
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
          A decentralized, transparent, and secure platform offering sustainable profits,
          unlimited earnings, and real-world utility through blockchain-powered arbitrage.
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
                width={180}
                height={180}
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg md:text-2xl font-semibold">{feature.title}</h3>
              <p className="text-sm md:text-lg text-gray-300 mt-1">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChoosePolycircle;
