import Image from "next/image";
import React from "react";

const AuditedSection: React.FC = () => {
  return (
    <section className="bg-black text-white py-12 px-2 md:px-12" id="audit">
      <div className="max-w-6xl mx-auto  rounded-lg md:p-8 p-0 relative">
        <h2 className="text-center text-2xl md:text-3xl font-semibold">
          <span className="text-purple-500">Audited</span>{" "}
          <span>Smart Contract</span>
        </h2>
        <p className="text-center text-sm md:text-base text-gray-400 mt-2">
          This smart contract has undergone a comprehensive security audit to
          ensure its integrity and reliability.
          <br />
          All critical vulnerabilities have been addressed, ensuring safe and
          transparent on-chain operations.
        </p>

        <div className="mt-8 space-y-6">
            <div className="flex items-start gap-1 md:gap-2">
            <Image src="/logo/audited.svg" alt="audited" width={30} height={30}/>
            <p>
              <span className="font-semibold">CERTIK – Audited</span> | 100%
              decentralised | Renounced source code | real-time community
              distribution | guaranteed returns
            </p>
            </div>

          <div className="flex items-start gap-1 md:gap-2">
            <Image src="/logo/audited.svg" alt="audited" width={30} height={30}/>
            <p>
              Step into the future of decentralised finance with{" "}
              <span className="text-purple-500 font-semibold">POLY CIRCLE</span>
            </p>
          </div>

          <div className="flex items-start gap-1 md:gap-2">
          <Image src="/logo/audited.svg" alt="audited" width={30} height={30}/>
            <p>
              The world’s most advanced, powerful and income generating smart
              contract. Certainly backed up by CERTIK audit. It delivers
              unmatched trust, transparency and performance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuditedSection;
