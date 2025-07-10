"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import OpenMenuIcon from "../Icon/OpenMenu";
import DashboardIcon from "../Icon/Dashboard";
import ProfileIcon from "../Icon/Profile";
import MyTeamIcon from "../Icon/MyTeam";
import IncomeIcon from "../Icon/IncomeIcon";
import SignoutIcon from "../Icon/Signout";
import TermIcon from "../Icon/Term";
import ReferallIcon from "../Icon/Referall";
import LevelIncomesIcon from "../Icon/LevelIncomes";
import UplineSuperIcon from "../Icon/UplineSuper";
import LevelTimeIcon from "../Icon/LevelTime";
import { Logout } from "./Logout";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { useUserIdCounter } from "./useUserCounter";


const CloseMenu: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="text-purple-400 focus:outline-none self-end mb-4"
    title="Close Menu"
  >
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
);

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [myTeamOpen, setMyTeamOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const logout = Logout();
  // const circleData = useSelector((state: RootState) => state.user.circleData);

  const userId = useSelector((state: RootState) => state.user.userId);


  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const toggleMyTeam = () => setMyTeamOpen((prev) => !prev);
  const toggleIncome = () => setIncomeOpen((prev) => !prev);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
        setMyTeamOpen(false);
        setIncomeOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const { count, loading, error } = useUserIdCounter();
  console.log("counter", count)


  return (
    <nav className="w-full bg-black relative z-50">
      <header className="flex justify-between items-center border-b border-purple-800 w-full pr-4 pl-2 md:pl-4 py-0">
        <div>
          <a href="/">
            <Image
              src="/polycircle.svg"
              alt="polycircle"
              width={180}
              height={180}
              priority
            />
          </a>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-row sm:flex-row items-center justify-center gap-1 sm:gap-6 md:gap-8 text-center">
             <div className="text-white text-xs sm:text-base font-medium">
                Users: <span className="font-semibold text-purple-300">{count}</span>
             </div> 

            <div className="px-2 py-2 rounded-full bg-purple-900 text-white text-xs sm:text-sm font-semibold shadow-md border border-gray-300 flex items-center gap-1">
              <span>User Id:</span>
              <span className="text-purple-400">{userId || ""}</span>
            </div>
          </div>


          <button
            className="text-purple-400 focus:outline-none"
            onClick={toggleMenu}
            title={menuOpen ? "Close Menu" : "Open Menu"}
          >
            <OpenMenuIcon />
          </button>

        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40">
          {/* Overlay background (clickable) */}
          <div className="absolute inset-0 bg-opacity-80" />

          {/* Sidebar */}
          <div
            ref={sidebarRef}
            className="absolute top-0 right-0 h-full w-60 bg-purple-900 border-l border-purple-800 shadow-lg flex flex-col p-6 space-y-10 md:space-y-6 overflow-y-auto"
          >

            <CloseMenu onClick={toggleMenu} />
            <a
              href="/dashboards"
              className="flex items-center space-x-2 text-white hover:text-purple-400 transition"
            >
              <DashboardIcon />
              <span className="font-semibold">Dashboard</span>
            </a>

            {/* <a
              href="/profile"
              className="flex items-center space-x-2 text-white hover:text-purple-400 transition"
            >
              <ProfileIcon />
              <span className="font-semibold">Profile</span>
            </a> */}
            <div>
              <button
                onClick={toggleMyTeam}
                className="flex items-center justify-between w-full text-white hover:text-purple-400 transition"
              >
                <div className="flex items-center space-x-2">
                  <MyTeamIcon />
                  <span className="font-semibold">My Team</span>
                </div>
                <span>{myTeamOpen ? "▲" : "▼"}</span>
              </button>
              {myTeamOpen && (
                <div className="ml-4 mt-2 space-y-3">
                  <a
                    href="/dashboard/referral-business"
                    className="flex items-center text-sm font-semibold text-white hover:text-purple-300 space-x-2"
                  >
                    <Image src="/logo/sponsor.svg" alt="sponsor" width={20} height={20} />
                    Sponsorer Business
                  </a>
                  <a
                    href="/team-bussiness"
                    className="flex items-center text-sm text-white font-semibold hover:text-purple-300"
                  >
                    <LevelTimeIcon />
                    Team Business
                  </a>
                </div>
              )}
            </div>

            <div>
              <button
                onClick={toggleIncome}
                className="flex items-center justify-between w-full text-white hover:text-purple-400 transition"
              >
                <div className="flex items-center space-x-2">
                  <IncomeIcon />
                  <span className="font-semibold">Reward</span>
                </div>
                <span>{incomeOpen ? "▲" : "▼"}</span>
              </button>
              {incomeOpen && (
                <div className="ml-4 mt-2 space-y-2">
                  {[
                    // {
                    //   href: "/dashboard/referral",
                    //   text: "Sponsor Reward",
                    //   // icon: <ReferallIcon />,
                    // },
                    {
                      href: "/generation-reward",
                      text: "Generation Reward",
                      icon: <LevelIncomesIcon />,
                    },
                    {
                      href: "/dashboard/upline-income",
                      text: "Upline Reward",
                      icon: <UplineSuperIcon />,
                    },
                    {
                      href: "/dashboard/super-upline-income",
                      text: "Super Upline Reward",
                      icon: <UplineSuperIcon />,
                    },
                  ].map(({ text, icon, href }) => (
                    <a
                      key={text}
                      href={href}
                      className="flex items-center gap-2 text-sm font-semibold text-white hover:text-purple-300"
                    >
                      {icon}
                      {text}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* <a
              href="#"
              className="flex items-center space-x-2 text-white hover:text-purple-400 transition"
            >
              <RegistrationIcon />
              <span className="font-semibold">New Registration</span>
            </a> */}

            <a
              href="/terms"
              className="flex items-center space-x-2 text-white hover:text-purple-400 transition"
            >
              <TermIcon />
              <span className="font-semibold">Terms & Conditions</span>
            </a>

            {/* <a
              href="#"
              className="flex items-center space-x-2 text-white hover:text-purple-400 transition"
            > */}

            <button onClick={logout} className="flex items-center gap-3 text-white hover:text-purple-400 transition">
              <SignoutIcon />
              <span className="font-semibold">Sign Out</span>
            </button>
            {/* </a> */}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
