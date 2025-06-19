import React from "react";
import Image from "next/image";
import ReferallIcon from "../Icon/Referall";
import UplineSuperIcon from "../Icon/UplineSuper";
import LevelIncomesIcon from "../Icon/LevelIncomes";

const rewards = [
  { label: "Sponsor Reward", percentage: "22%", icon: <ReferallIcon /> },
  { label: "Upline Reward", percentage: "22%", icon: <UplineSuperIcon /> },
  { label: "Super Upline Reward", percentage: "22%", icon: <UplineSuperIcon /> },
  { label: "Level Reward", percentage: "22%", icon: <LevelIncomesIcon /> },
  { label: "Re-Birth", percentage: "12%", icon: <LevelIncomesIcon /> },
];

const PolycircleOpportunity: React.FC = () => {
  return (
    <section className="bg-black text-white px-4 py-16" id="opportunity">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold">
            <span className="text-purple-500">PolyCircle</span> Opportunity
          </h2>
          <p className="text-sm md:text-base text-gray-300 max-w-3xl mx-auto mt-2">
            POLY CIRCLE presents a revolutionary earning ecosystem, crafted to empower
            individuals worldwide with 4 attracted dynamic earning opportunities. Each
            opportunity is strategically engineered to drive exponential growth, inspire
            active participation, and deliver reliable, long-term earnings in the digital
            era.
          </p>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left Image */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <Image
              src="/image/oppurtnity.svg"
              alt="Polycircle Illustration"
              width={500}
              height={500}
              className="object-contain rounded-xl"
            />
          </div>

          
          <div className="w-full lg:w-1/2 space-y-5">
            {rewards.map((reward, index) => (
              <div
                key={index}
                className="flex items-center bg-[#1f1f1f] rounded-lg p-4 shadow-md"
              >
                <div className="w-10 h-10 mr-4 flex items-center justify-center">
                  {reward.icon}
                </div>
                <div className="flex justify-between w-full">
                  <span className="text-base md:text-lg font-medium">
                    {reward.label}
                  </span>
                  {/* <span className="text-purple-400 font-bold">
                    {reward.percentage}
                  </span> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PolycircleOpportunity;
