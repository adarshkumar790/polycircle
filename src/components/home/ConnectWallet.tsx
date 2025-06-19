import React from "react";
import Image from "next/image";

const features = [
  {
    icon: "/logo/fund.svg",
    title: "100% FUND DISTRIBUTION",
    description: "Funds are distributed instantly. Users can withdraw anytime.",
  },
  {
    icon: "/logo/safes.svg",
    title: "SAFE & SECURE PLATFORM",
    description: "This program runs securely on a public blockchain.",
  },
  {
    icon: "/logo/lowest.svg",
    title: "Activate with $50",
    description: "Starting with $50 to accelerate your income.",
  },
];

const ConnectWalletSection: React.FC = () => {
  return (
    <section className="bg-black text-white px-4 py-10 overflow-hidden" id="about">
      <div className="max-w-5xl mx-auto flex flex-wrap justify-center sm:justify-between gap-4">
        {/* Feature Cards */}
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white text-black rounded-lg shadow-md shadow-purple-800 px-4 py-6 w-full sm:w-[200px] flex flex-col items-center text-center z-10"
          >
            <Image src={feature.icon} alt={feature.title} width={48} height={48} />
            <h3 className="font-bold text-sm mt-3">{feature.title}</h3>
            <p className="text-xs mt-1">{feature.description}</p>
          </div>
        ))}

        {/* Connect Wallet Box (Desktop) */}
        <div className="hidden sm:flex bg-[#1a032d] text-white rounded-lg shadow-md shadow-purple-800 px-4 py-6 w-full sm:w-[200px] -ml-6 flex-col items-center justify-center text-center z-0">
            <a href="/registration" className="w-full">
            <button className="bg-white text-purple-700 hover:bg-purple-700 hover:text-white transition px-4 py-2 text-sm rounded-lg font-semibold shadow w-full">
              Connect Wallet
            </button>
            </a>
        </div>

        {/* Mobile Version */}
        <div className="sm:hidden w-full">
          <div className="bg-[#1a032d] rounded-lg shadow-md shadow-purple-800 px-4 py-6 mt-4 flex flex-col items-center text-center">
            <button className="bg-white text-purple-700 hover:bg-purple-700 hover:text-white transition px-4 py-2 text-sm rounded-lg font-semibold shadow">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConnectWalletSection;
