'use client';
import React, { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import OpenMenuIcon from "../Icon/OpenMenu";

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="absolute top-0 left-0 w-full z-30 px-6 py-4 flex items-center justify-between bg-transparent">
      {/* Logo */}
      <div className="flex items-center text-white font-bold text-xl">
        <Image src="/polycircle.svg" alt="Poly Circle Logo" width={160} height={40} priority />
      </div>

      {/* Desktop Menu and Wallet Button */}
      <div className="hidden md:flex items-center space-x-6 ml-auto">
        <ul className="flex space-x-4 text-white font-bold md:text-sm text-xl">
          <li><a href="#home" className="hover:text-purple-400 transition">Home</a></li>
          <li><a href="#about" className="hover:text-purple-400 transition">About Plan</a></li>
          <li><a href="#features" className="hover:text-purple-400 transition">Our Features</a></li>
          <li><a href="#opportunity" className="hover:text-purple-400 transition">Opportunity</a></li>
          <li><a href="#audit" className="hover:text-purple-400 transition">Audited Smart</a></li>
        </ul>
        <a href="/registration">
          <button className="bg-white text-purple-700 hover:bg-purple-700 hover:text-white transition px-4 py-2 text-sm rounded-lg font-semibold shadow">
            Connect
          </button>
        </a>
      </div>

      {/* Mobile Hamburger Icon */}
      <div className="md:hidden z-40 flex items-center space-x-2">
      <a href="/registration">
  <button className="bg-purple-900 text-white hover:bg-purple-700 hover:text-white transition px-4 py-2 text-xs rounded-lg font-semibold shadow animate-blink">
    Connect Wallet
  </button>
</a>

        <button onClick={toggleMenu} className="text-white focus:outline-none">
          {menuOpen ? <X size={28} /> : <OpenMenuIcon />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-black bg-opacity-90 text-white flex flex-col items-center space-y-6 py-6 text-sm font-medium z-30 md:hidden transition-all duration-300">
          <a href="#home" onClick={toggleMenu} className="hover:text-purple-400">Home</a>
          <a href="#about" onClick={toggleMenu} className="hover:text-purple-400">About Plan</a>
          <a href="#features" onClick={toggleMenu} className="hover:text-purple-400">Our Features</a>
          <a href="#opportunity" onClick={toggleMenu} className="hover:text-purple-400">Opportunity</a>
          <a href="#audit" onClick={toggleMenu} className="hover:text-purple-400">Audited Smart</a>
          <a href="/registration" onClick={toggleMenu}>
            <button className="bg-purple-900 text-purple-700 hover:bg-purple-700 hover:text-white transition px-4 py-3 text-sm rounded-lg font-semibold shadow">
              Connect Wallet
            </button>
          </a>
        </div>
      )}
    </nav>
  );
};

export default Header;
