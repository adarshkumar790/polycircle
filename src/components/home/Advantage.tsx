import React from "react";
import Image from "next/image";

const advantages = [
  {
    icon: "/image/payement.svg",
    title: "Low Entry, High Earning Potential",
    description:
      "Start your journey with just $50 and unlock the opportunity to earn up to ₹2 crore or more through our dynamic board system. A small step today can build a wealthier tomorrow."
  },
      {
    icon: "/image/Immutability.svg",
    title: "Multiple Streams of Income",
    description: "Earn through five powerful income types: Referral Income: Earn $11 every time your direct referrals join or rebirth. Upline Income: $10 from new IDs placed on your Level 1. Super Upline Income: $10 from new IDs placed on Level 2, even by your team. Rebirth Income: Your ID re-enters the system automatically, generating repeated income without reinvestment.Level Income: Get paid for new joinings and rebirths up to 10 levels deep."  
    },
  {
    icon: "/image/Transparency.svg",
    title: "Transparency and Anonymity",
    description:
      "Verifiable proof of the project’s performance statistics as well as its partner’s transaction history are publicly available on the Polygon Smart Chain."
  },

  {
    icon: "/image/Nonhierarchically.svg",
    title: "Nonhierarchically Organized",
    description:
      "A decentralized matrix project designed to stimulate relocation to the crypto ecosystem by offering newcomers a seamless introductory experience.",
  },
  {
    icon: "/image/Transactional.svg",
    title: "Transactional Surety",
    description:
      "Network nodes irrevocably record and ubiquitously store the transactional history of all POLY CIRCLE network partners on the Polygon Smart Chain.",
  },
];

const AdvantagesPolycircle: React.FC = () => {
  return (
    <section className="bg-black text-white px-4 py-16">
      {/* Centered Header Section */}
      <div className="text-center mx-auto mb-12 max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Advantages of <span className="text-purple-500">PolyCircle</span>
        </h2>
        <p className="text-sm md:text-base text-gray-300">
          At POLYCIRCLE, we believe in creating a smart, simple, and sustainable income opportunity for everyone. Here's why thousands are choosing the POLYCIRCLE 2x2 Board Plan.
        </p>
      </div>

      {/* Content Grid */}
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">
        {/* Left - Cards */}
        <div className="lg:w-3/4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {advantages.map((item, index) => (
              <div
                key={index}
                className="bg-[#1f1f1f] rounded-lg p-5 shadow-md flex gap-4 items-start"
              >
                <div>
                  <div className="w-16 h-16 flex-shrink-0">
                    <Image
                      src={item.icon}
                      alt={item.title}
                      width={60}
                      height={60}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <h3 className="text-base font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right - Image */}
        <div className="lg:w-1/4 flex justify-center items-center">
          <Image
            src="/image/rightimage.svg"
            alt="Polycircle Illustration"
            width={600}
            height={800}
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default AdvantagesPolycircle;
