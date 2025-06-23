import React from "react";
import Image from "next/image";

const advantages = [
  {
    icon: "/image/payement.svg",
    title: "Low Entry, High Earning Income",
    description: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Start your journey with just $50 and unlock the opportunity to earn up to ₹2 crore or more through our dynamic board system.</li>
        <li>A small step today can build a wealthier tomorrow.</li>
        <li>
          Earn through five powerful income types:
          
            <li>Referral Income: Earn $11 every time your direct referrals join or rebirth.</li>
            <li>Upline Income: $10 from new IDs placed on your Level 1.</li>
            <li>Super Upline Income: $10 from new IDs placed on Level 2, even by your team.</li>
            <li>Rebirth Income: Your ID re-enters the system automatically, generating repeated income without reinvestment.</li>
      
        </li>
      </ul>
    )
  },
  {
    icon: "/image/Immutability.svg",
    title: "Auto Rebirth for Passive Growth",
    description: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Once your board completes, your ID is automatically reborn into a fresh board. This ensures you continue to earn passively without buying new positions.</li>
      </ul>
    )
  },
  {
    icon: "/image/Nonhierarchically.svg",
    title: "Earn Without Referring (Non-working Income)",
    description: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Even if you don’t refer anyone, you can still earn from upline and team placements through our structured spillover and team growth system.</li>
      </ul>
    )
  },
  {
    icon: "/image/Transparency.svg",
    title: "Unlimited Sponsorship = Unlimited Earnings",
    description: (
      <ul className="list-disc pl-5 space-y-1">
        <li>There’s no limit to how many people you can refer. More referrals mean faster board completions and multiplied earnings.</li>
      </ul>
    )
  },
  {
    icon: "/image/Transactional.svg",
    title: "Quick Returns on Investment",
    description: (
      <ul className="list-disc pl-5 space-y-1">
        <li>With just 2 direct referrals, you can earn back your $50 and start generating profits with your first rebirth.</li>
      </ul>
    )
  },
  {
    icon: "/image/Transactional.svg",
    title: "Simple System, Easy to Duplicate",
    description: (
      <ul className="list-disc pl-5 space-y-1">
        <li>The 2x2 matrix model is easy to understand and explain—ideal for fast duplication and team growth in your network.</li>
      </ul>
    )
  },
  {
    icon: "/image/Transactional.svg",
    title: "Perfect for Everyone",
    description: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Whether you're a student, working professional, homemaker, or entrepreneur — POLYCIRCLE offers an equal opportunity for all to build a strong income stream online.</li>
      </ul>
    )
  }
];

const AdvantagesPolycircle: React.FC = () => {
  return (
    <section className="bg-black text-white px-6 py-12">
      {/* Header */}
      <div className="text-center mx-auto mb-12 max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Advantages of <span className="text-purple-500">PolyCircle</span>
        </h2>
        <p className="text-sm md:text-base text-gray-300">
          At POLYCIRCLE, we believe in creating a smart, simple, and sustainable income opportunity for everyone. Here's why thousands are choosing the POLYCIRCLE 2x2 Board Plan.
        </p>
      </div>

      {/* 3 Columns */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1 - First 2 Advantages */}
        <div className="flex flex-col gap-6">
          {advantages.slice(0, 3).map((item, index) => (
            <div
              key={index}
              className="bg-[#1f1f1f] rounded-lg p-2 shadow-md flex gap-4"
            >
              <div className="w-16 h-16 flex-shrink-0">
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={60}
                  height={60}
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                <div className="text-sm text-gray-400">{item.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Column 2 - Remaining 5 Advantages */}
        <div className="flex flex-col gap-6">
          {advantages.slice(3, 7).map((item, index) => (
            <div
              key={index}
              className="bg-[#1f1f1f] rounded-lg p-5 shadow-md flex gap-4"
            >
              <div className="w-16 h-16 flex-shrink-0">
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={60}
                  height={60}
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                <div className="text-sm text-gray-400">{item.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Column 3 - Right Side Image */}
        <div className="flex justify-center items-start">
          <Image
            src="/image/rightimage.svg"
            alt="Polycircle Illustration"
            width={500}
            height={700}
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default AdvantagesPolycircle;
