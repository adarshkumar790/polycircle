"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import CurrentCircleIcon from "@/components/Icon/CurrentCircle";
import ReferralIcon from "@/components/Icon/ReferralIcon";
import TeamIcon from "@/components/Icon/Team";
import ReferalBusnessIcon from "@/components/Icon/ReferalBusiness";
import TeamBusinessIcon from "@/components/Icon/TeamBusiness";
import DirectIncomeIcon from "@/components/Icon/DirectIncome";
import UpplineIncomeIcon from "@/components/Icon/UpplineIncome";
import SupperUpplineIcon from "@/components/Icon/SupperUppline";
import LevelIncomeIcon from "@/components/Icon/LevelIncome";
import TeamIncomeIcon from "@/components/Icon/TeamIncome";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";

import {
  getDirectReferrals,
  getUserDetails,
  getUserFullTree,
} from "@/components/registerUser";
import { useRegister } from "@/components/usehooks/usehook";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { Logout } from "@/components/Navbar/Logout";
import {
  // DirectAmount,
  fetchAllChildRebirths,
  fetchAllRewardsAndTeamCount,
  fetchLevelRewards,
  // superUplineToalAmount,
  // uplineToalAmount,
  getTotalReward,
  DashboardRewards
} from "@/GraphQuery/query";
import Image from "next/image";
import { setCircleData } from "@/Redux/store/userSlice";

const PolycircleDashboard = () => {
  const [superUplineAmount, setSuperUplineAmount] = useState("0");
  const [uplineAmount, setUplineAmount] = useState("0");
  const [directAmount, setDirectAmount] = useState("0");

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const router = useRouter();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const logout = Logout();

  const handleCopy = () => {
    if (linkRef.current) {
      navigator.clipboard
        .writeText(linkRef.current.href)
        .then(() => toast.success("Referral link copied!"))
        .catch(() => toast.error("Failed to copy link."));
    }
  };

  const { signer } = useRegister();
  const userId = useSelector((state: RootState) => state.user.userId);
  const dispatch = useDispatch<any>();
   const circleData = useSelector((state: RootState) => state.user.circleData);
   console.log("child", circleData?.childrebirths)

  const [userDetails, setUserDetails] = useState<any>(null);
  const [dashboardMainData, setDashboardData] = useState<DashboardRewards>();
  const [loading, setLoading] = useState(true);
  const [treeData, setTreeData] = useState<any>(null);
  const [referrals, setReferrals] = useState<number[]>([]);
  const [referralsLoading, setReferralsLoading] = useState(true);
  const [directCount, setDirectCount] = useState(0);
  const [childUserIds, setchildUserIds] = useState<string[]>([]);
  const [globalAmount, setGlobalAmount] = useState<number>(0);
  const [teamCount, setTeamCount] = useState<number>(0);
  const [totalTeamAmount, setTotalTeamAmount] = useState<number>(0);
  const [data, setData] = useState({
    totalReward: 0,
    totalTeam: 0,
    totalGenerationReward: 0,
  });

const referralId =
  Array.isArray(circleData?.childrebirths) && circleData.childrebirths.length > 0
    ? circleData.childrebirths[0].mainUserId
    : userId;

    const userID =
  Array.isArray(circleData?.childrebirths) && circleData.childrebirths.length > 0
    ? circleData.childrebirths[0].mainUserId
    : userId;




  

  const getLevelRewards = async (userId: string) => {
    const data = await getTotalReward([userId]);
    dispatch(setCircleData(data));
    setDashboardData(data);
    //  console.log("getLevelRewards", data);
  }
  useEffect(() => {
    if (!userId) return;
    getLevelRewards(userId)
   
  }, [userId]);

  const totalRefrell = (dashboardMainData?.referalTeam ?? 0) * 50 
  const generationAmount = (dashboardMainData?.grandTotalAmount ?? 0) - ((dashboardMainData?.uplineAmount ?? 0) + (dashboardMainData?.superUplineAmount ?? 0));
  const refrelldata = (circleData?.levels?.[1]?.length ?? 0);
    const refrellAmount = (circleData?.levels?.[1]?.length ?? 0) * 50;



  const dashboardData = [
    { title: "Current Circle", icon: <CurrentCircleIcon />, value: "", link: "/tree/current-circle" },
    { title: "Sponsor Team", icon: <ReferralIcon />, value: `${refrelldata || 0}`, link: "/dashboard/referral" },
    { title: "Total Team", icon: <TeamIcon />, value: `${dashboardMainData?.teamCount.toString() || 0}`, link: "/total-team" },
    { title: "Sponsorer  Business", icon: <ReferalBusnessIcon />, value: `$${refrellAmount.toFixed(2)}`, link: "/dashboard/referral-business" },
    { title: "Team Business", icon: <TeamBusinessIcon />, value: `$${dashboardMainData?.teamAmount.toFixed(2) || 0}`, link: "/team-bussiness" },
    { title: "Upline Reward", icon: <Image src="/logo/upline.svg" alt="upline reward" width={100} height={100} />, value: `$${dashboardMainData?.uplineAmount.toFixed(2) || 0}`, link: "/dashboard/upline-income" },
    { title: "Super Upline Reward", icon: <Image src="/logo/super-upline.svg" alt="upline reward" width={150} height={150} />, value: `$${dashboardMainData?.superUplineAmount.toFixed(2) || 0}`, link: "/dashboard/super-upline-income" },
    { title: "Generation Reward", icon: <SupperUpplineIcon />, value: `$${generationAmount.toFixed(2) || 0}`, link: "/generation-reward" },
    { title: "Total Reward", icon: <TeamIncomeIcon />, value: `$${dashboardMainData?.grandTotalAmount.toFixed(2) || 0}`, link: "/total-reward" },
    { title: "TOP-UP", icon: <DirectIncomeIcon />, value: "-", link: "/re-topup" },
  ];

  return (
    <div className="min-h-screen bg-black text-white w-full">
      <div className="text-sm flex flex-col md:flex-row flex-wrap items-center justify-between gap-2 px-4 py-4 md:px-10">
       

<div className="flex items-center gap-2 flex-wrap">
  <span className="font-bold md:text-xl">Referral Link -</span>

  <Link
    ref={linkRef}
    href={`https://polycircle.io/registration?referralId=${referralId}`}
    className="text-purple-400 break-all text-xs md:text-xl"
  >
    https://polycircle.io/registration?referralId={referralId}
  </Link>

  {/* Copy Button */}
  <button className="text-purple-400" title="Copy" onClick={handleCopy}>
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16h8M8 12h8m-6-4h6m2-2a2 2 0 012 2v8a2 2 0 01-2 2H8l-4 4V6a2 2 0 012-2h12z" />
    </svg>
  </button>

  {/* WhatsApp Share Button */}
  <a
    href={`https://wa.me/?text=https://polycircle.io/registration?referralId=${referralId}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-green-500"
    title="Share on WhatsApp"
  >
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.52 3.48a12.12 12.12 0 00-17.12 0A11.93 11.93 0 002 12.01a11.78 11.78 0 001.64 6.07L2 22l4.06-1.56a11.95 11.95 0 0015.26-4.42 11.92 11.92 0 00-1.55-12.54zM12 20a8 8 0 01-4.3-1.23l-.31-.19-2.55.98.97-2.49-.2-.32a8 8 0 011.26-10.17 8.12 8.12 0 0111.38.3 8 8 0 01-.3 11.38A7.91 7.91 0 0112 20zm4.43-5.63c-.24-.12-1.42-.7-1.64-.78s-.38-.12-.53.12-.61.77-.75.94-.28.17-.52.06a6.6 6.6 0 01-1.93-1.18 7.2 7.2 0 01-1.33-1.65c-.14-.24 0-.37.1-.49s.24-.28.36-.43a1.63 1.63 0 00.24-.41.45.45 0 000-.43c-.07-.12-.52-1.26-.72-1.73s-.38-.38-.52-.39h-.43a.83.83 0 00-.6.28 2.51 2.51 0 00-.79 1.86 4.39 4.39 0 00.92 2.3 10.14 10.14 0 003.13 2.89 10.7 10.7 0 003.23 1.18c.45.07.86.07 1.18.04a2.17 2.17 0 001.44-1 1.8 1.8 0 00.13-1c-.06-.09-.22-.14-.46-.25z" />
    </svg>
  </a>
</div>


      <div className="text-sm mt-4 flex flex-row gap-4">
  {/* Left Column: User ID & Status */}
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2">
      <span className="text-white font-semibold">User Id:</span>
      <span className="text-purple-500 font-bold">{userID}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-white font-semibold">Status:</span>
      <span className="text-green-500 font-bold">Active</span>
    </div>
  </div>

  {/* Right Column: Team Size & Team Business */}
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2">
      <span className="text-white font-semibold">Team Size:</span>
      <span className="text-purple-500 font-bold">
        {dashboardMainData?.teamCount.toString() || 0}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-white font-semibold">Team Business:</span>
      <span className="text-purple-500 font-bold">
        ${dashboardMainData?.teamAmount.toFixed(2) || 0}
      </span>
    </div>
  </div>
</div>


      </div>

      <div className="flex justify-center">
        <div className="max-w-4xl w-full px-4 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {dashboardData.map((item, index) => (
              <div key={index} onClick={() => router.push(item.link)} className="cursor-pointer flex flex-col items-center text-center space-y-2">
                <Card>
                  <CardContent>
                    <div className="text-xl md:text-3xl w-24 h-24 md:w-24 md:h-24 flex items-center justify-center">
                      {item.icon}
                    </div>
                  </CardContent>
                </Card>
                <div className="text-sm text-gray-100 md:font-bold font-semibold">{item.title}</div>
                <div className="text-sm font-bold text-purple-400">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolycircleDashboard;