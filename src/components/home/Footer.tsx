import { Instagram } from "lucide-react";
import Image from "next/image";
import { FaFacebookF, FaTelegramPlane, FaYoutube } from "react-icons/fa";
import { IoMdOpen } from "react-icons/io";
import { IoClose } from "react-icons/io5";

export default function Footer() {
  return (
    <footer className="bg-black text-white px-6 py-16">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-10">
        <div className="flex flex-col space-y-3 ">
          <Image
            src="/polycircle.svg"
            alt="PolyCircle Logo"
            width={200}
            height={200}
            className="object-contain"
          />
          <p className="text-sm text-gray-300">
             © 2025. All Rights Reserved
          </p>
          <p className="text-sm text-purple-500">
            Audited Smart Contract Address:{" "}
            <span className="text-white">0x0209727cd80dB13723773ACA6cD1905FCDFDC035</span>
          </p>
        </div>
        <div className="flex flex-col space-y-3 w-full max-w-sm">
          <h3 className="font-semibold text-lg md:mt-4">Subscribe</h3>
          <div className="flex items-center border border-purple-600 rounded px-2 py-0">
            <input
              type="email"
              placeholder="Email"
              className="bg-black  w-full py-2 px-0 outline-none placeholder:text-gray-400"
            />
            <IoMdOpen className="text-purple-500 text-xl cursor-pointer" />
          </div>
        </div>
        <div className="flex flex-col space-y-3 items-start">
          <h3 className="font-semibold text-lg md:mt-4">Stay Connected</h3>
            <div className="flex gap-3 text-white md:text-4xl text-4xl">
            <a
              href="https://www.facebook.com/people/PolyCircle/61576905779456/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <FaFacebookF className="bg-purple-700 p-2 rounded cursor-pointer hover:opacity-80" />
            </a>
            <a
              href="https://x.com/PolyCircleVerse"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <IoClose className="bg-purple-700 p-2 rounded cursor-pointer hover:opacity-80" />
            </a>
            <a
              href="https://youtube.com/@polycircle?si=g3mLY6uDciTiXzgY"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <FaYoutube className="bg-purple-700 p-2 rounded cursor-pointer hover:opacity-80" />
            </a>
            <a
              href="https://t.me/PolyCircle"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
            >
              <FaTelegramPlane className="bg-purple-700 p-2 rounded cursor-pointer hover:opacity-80" />
            </a>
            <a href="https://www.instagram.com/polycircleverse/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            >
              <Instagram size={36} className="bg-purple-700 p-2 rounded cursor-pointer hover:opacity-80"/>
            </a>
            </div>
        </div>
      </div>
    </footer>
  );
}
