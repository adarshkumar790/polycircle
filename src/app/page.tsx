import AdvantagesPolycircle from "@/components/home/Advantage";
import AuditedSection from "@/components/home/Audited";
import WhyChoosePolycircle from "@/components/home/Choose";
import ConnectWalletSection from "@/components/home/ConnectWallet";
import FAQSection from "@/components/home/Faq";
import PolycircleOpportunity from "@/components/home/Oppurtinity";
import Header from "@/components/Navbar/Header";
import Image from "next/image";
import React from "react";

const HeroSection: React.FC = () => {
  return (
    <div className="bg-black min-h-screen overflow-hidden">
      
      <div className="relative w-full h-[90vh] ">
        
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/logo/polycircle.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        
        <div className="absolute inset-0 bg-black/50 z-10" />

        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black/90 to-transparent z-20" />

        <div className="relative z-30 flex flex-col items-center justify-center h-full text-center text-white px-4 md:px-8">
          <Header />
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 leading-tight">
            Welcome to <span className="text-purple-600">POLY CIRCLE</span>
          </h1>
          <p className="text-base sm:text-lg md:text-2xl mb-6 max-w-2xl">
            Safe, Secure, and Unlimited Earning Opportunities!
          </p>
            <a
            href="https://polygon.technology/"
            target="_blank"
            rel="noopener noreferrer"
            >
            <button className="bg-white hover:bg-purple-700 text-purple-900 hover:text-white font-semibold px-6 py-3 rounded-full shadow-lg text-sm sm:text-sm flex items-center gap-1  transition-all duration-300">
              <Image
              src="/logo/polygon.png"
              alt="Polygon Logo"
              width={30}
              height={30}
              />
              POWERED BY POLYGON BLOCKCHAIN
            </button>
            </a>
        </div>
      </div>
      <ConnectWalletSection/>
      <WhyChoosePolycircle/>
      <AdvantagesPolycircle/>
      <PolycircleOpportunity/>
      <AuditedSection/>
      <FAQSection/>
    </div>
  );
};

export default HeroSection;
