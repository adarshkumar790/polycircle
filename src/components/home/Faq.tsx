"use client";
import Image from "next/image";
import React, { useState } from "react";

const faqs = [
  {
    question: "WHAT IS POLYCIRCLE?",
    answer:
      "PolyCircle is the international community of the global decentralized ecosystem and the first-ever audited and trusted smart contract marketing matrix of the Polygon network. It operates via a self-executing algorithm that automatically distributes rewards between community members under a matrix marketing plan. Its code is publicly available, and all transactions are transparently recorded on polygonscan.com.",
  },
  {
    question: "WHO MANAGES THE PLATFORM?",
    answer:
      "The platform consists of self-executing smart contracts, which means no one can alter or interfere with the transaction process.",
  },
  {
    question: "WHO CREATED POLYCIRCLE?",
    answer:
      "PolyCircle was initiated by a group of crypto enthusiasts. They hold no special privileges. Now, it is a decentralized peer-to-peer community owned by its members.",
  },
  {
    question: "WHAT IS AN AUDITED SMART CONTRACT? WHAT ARE ITS ADVANTAGES?",
    answer:
      "Audited smart contracts undergo thorough checks for vulnerabilities and ensure proper functionality before deployment. Since smart contracts are immutable, audits provide a crucial safeguard. On Polygon, a Layer-2 Ethereum solution, audits are essential due to the high utility of dApps.",
  },
  {
    question: "WHAT IS DECENTRALISATION?",
    answer:
      "It refers to the distribution of authority among all participants instead of centralized control. Decisions are made by consensus, enabling fair and transparent governance.",
  },
  {
    question: "HOW DO I JOIN THE COMMUNITY?",
    answer:
      "Install a cryptocurrency wallet (such as MetaMask or TrustWallet) and the Telegram messenger on your device (PC, tablet, or smartphone).",
  },
  {
    question: "WHICH WALLET SHOULD I USE?",
    answer:
      "PolyCircle supports all major wallets. TrustWallet and MetaMask are the most recommended for their ease of use and reliability.",
  },
  {
    question: "WHERE CAN I GET MORE INFORMATION ABOUT POLYCIRCLE?",
    answer: (
      <>
        Join verified PolyCircle Telegram channels to connect with other members and ask questions. Join the chat at{" "}
        <a
          href="https://t.me/PolyCircle"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline hover:text-purple-600"
        >
          t.me/PolyCircle
        </a>
        .
      </>
    ),
  },
  {
    question: "HOW TO BUY / SELL USDT IF I HAVE NEVER DEALT WITH CRYPTOCURRENCY?",
    answer:
      "Use trusted exchanger aggregators to buy/sell cryptocurrency with fiat currency. These platforms are designed for beginners and typically take less than 5 minutes to use.",
  },
  {
    question: "HOW CAN I REGISTER ON THE POLYCIRCLE PLATFORM?",
    answer:
      "To register, send $50 USDT (POL) to the smart contract. Ensure you have enough to also cover the Polygon network gas fee (~0.022 POL).",
  },
  {
    question: "CAN I REGISTER ON THE WEBSITE WITHOUT A PARTNER LINK?",
    answer:
      "Yes. You will be placed in the system’s 1st ID team if no referral link is used.",
  },
  {
    question: "WHAT WILL HAPPEN TO MY ACCOUNT IF I TAKE A BREAK FROM WORKING WITH THE POLYCIRCLE COMMUNITY?",
    answer:
      "Your account cannot be deleted and remains on the Polygon blockchain. You’ll continue receiving income from all levels except the last active one.",
  },
  {
    question: "I HAVE ACTIVATED THE PLATFORM, WHAT SHOULD I DO NEXT?",
    answer:
      "1. Connect with your inviter or other experienced participants.\n\n2. Begin inviting new partners to the network to grow your team.",
  },
  {
    question: "HOW CAN I REACH MY GOALS WITH POLYCIRCLE?",
    answer:
      "You achieve goals by building a partner network. Invite others through your link. Their first transaction is directed to your wallet. The platform utilizes two marketing plans to support community growth.",
  },
  {
    question: "IS PASSIVE INCOME POSSIBLE?",
    answer:
      "Yes. Passive income is possible through Re-Birth, spillovers from upline and downline, and overall network activity. Consistent effort is required initially to maximize future returns.",
  },
  {
    question: "HOW CAN I ATTRACT PEOPLE EFFECTIVELY? WHAT SHOULD I DO IF I CAN’T ATTRACT ANYONE?",
    answer:
      "Don’t pressure anyone. Many seek online income opportunities. Use social media, automated sales funnels, and community tools. Join webinars, ask questions, and improve your skills.",
  },
  {
    question: "DO I NEED TO WITHDRAW MONEY FROM POLYCIRCLE?",
    answer:
      "No. The platform does not hold your funds. All income is transferred instantly to your personal wallet via the smart contract. Only you control your funds.",
  },
  {
    question: "IS RE-BIRTH HAVE A VALIDITY PERIOD?",
    answer:
      "No, No such validity for Re-Birth. POLY CIRCLE ecosystem is built on a powerful 2x2 placement model that forms the structural backbone. Each participant introduces two members on the first level, which then expands into two additional members each on the second level. It creating a compact yet highly effective 2x2 matrix. This dynamic structure enables fair distribution, seamless spillover opportunities and optimal team expansion across all reward system.\n\nCompleting this circle a Re-Birth ID follows a Universal Matrix Structure(Top to Bottom & Left to Right), which further enhances the ecosystem by contributing to the Sponsor, Upline, Super Upline and Upper level rewards. Together, these interconnected elements ensure inclusive earning potential and long-term financial stability for participants worldwide.",
  },
  {
    question: "CAN I LOSE PARTNER WHOM I HAVE PERSONALLY INVITED?",
    answer:
      "No. Personally invited partners remain linked to you. Even if their Re-Birth IDs shift within the matrix, their rewards are still directed to your wallet.",
  },
  {
    question: "HOW DOES THIS DIFFER FROM A PYRAMID SCHEME?",
    answer:
      "PolyCircle is not a pyramid scheme. It is a smart contract-based, decentralized crowdfunding platform. Success depends on personal effort. There is no central authority or promise of unrealistic returns.",
  },
  {
    question: "WHAT ARE THE RISKS?",
    answer:
      "There are no platform-related risks. The smart contract is transparent and immutable. All transactions go directly to your wallet without third-party control. Inviting even one active person can recover your cost.",
  },
];

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-black text-white  md:px-12 pb-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-center text-3xl font-semibold">
          Frequently Asked <span className="text-purple-500">Questions</span>
        </h2>
        <p className="text-center text-sm md:text-base text-gray-400 mt-2">
          Have Any Doubts? Find Your Answers Below
        </p>

        <div className="mt-8 space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between px-4 py-4 text-left focus:outline-none"
              >
                <div className="flex items-center">
                  <span className="text-purple-500 text-2xl mr-3"><Image src='/logo/Faqs.svg' alt="Faq" width={20} height={20}/></span>
                  <span className="font-medium text-sm">{faq.question}</span>
                </div>
                <span className="text-purple-500 text-3xl">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-12 py-2 text-sm text-gray-300 bg-gray-900">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
