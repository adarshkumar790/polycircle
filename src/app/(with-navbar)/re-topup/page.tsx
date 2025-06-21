"use client";

import { useEffect, useState } from "react";
import {
  getTotalEarningWithChildren,
  getLockTopUp,
  getAddressById,
} from "@/components/registerUser";
import { useRegister } from "@/components/usehooks/usehook";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { DashboardRewards, getTotalReward } from "@/GraphQuery/query";
import { setCircleData } from "@/Redux/store/userSlice";
import Link from "next/link";

// Dynamically generate cycles based on total amount
function generateCycles(maxAmount: number) {
  const generated = [];
  let mainStart = 0;

  while (true) {
    const mainEnd = mainStart + 200;
    const miniEnd = mainEnd + 50;

    generated.push({ mainStart, mainEnd, miniEnd });

    if (miniEnd > maxAmount) break;
    mainStart = miniEnd;
  }

  return generated;
}

export default function ProgressPage() {
  const [amount, setAmount] = useState<number>(0);
  const [locked, setLocked] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [userAddress, setUserAddress] = useState<string | undefined>();
  const circleData = useSelector((state: RootState) => state.user.circleData);
  const [dashboardMainData, setDashboardData] = useState<DashboardRewards>();
  const dispatch = useDispatch<any>();
  const { signer } = useRegister();
  const userId = useSelector((state: RootState) => state.user.userId);

  useEffect(() => {
    const fetchData = async () => {
      if (!signer || !userId) return;

      setLoading(true);
      try {
        const { userAddress, error: addressError } = await getAddressById(
          signer,
          userId as any
        );
        if (addressError) {
          console.error("Address fetch error:", addressError);
          return;
        }
        setUserAddress(userAddress as any);

        const [earningRes, lockedRes] = await Promise.all([
          getTotalEarningWithChildren(signer, userAddress as any),
          getLockTopUp(signer, userAddress),
        ]);

        const numericAmount = parseFloat(earningRes.totalEarning || "0");
        const lockedAmount = parseFloat(lockedRes.lockedAmount || "0");

        const adjustedAmount = Math.round(numericAmount);

        setAmount(numericAmount);
        setLocked(Number(lockedAmount.toFixed(6)));
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [signer, userId]);

  const getLevelRewards = async (userId: string) => {
    const data = await getTotalReward([userId]);
    dispatch(setCircleData(data));
    setDashboardData(data);
  };

  useEffect(() => {
    if (!userId) return;
    getLevelRewards(userId);
  }, [userId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white px-4 sm:px-6 md:px-10 py-10">
      <div className="w-full max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Back Button on Left */}
          <div className="flex-1 text-left">
            <Link
              href="/dashboards"
              className=" text-xl font-bold text-white transition"
            >
              Back
            </Link>
          </div>

          {/* Title in Center */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center flex-1">
            Topup Progress
          </h2>

          {/* User Info on Right */}
          <div className="flex-1 text-right text-sm sm:text-base text-purple-300 font-semibold">
            <p>
              <span className="text-white">User ID:</span> {userId}
            </p>
            <p className="break-words">
              <span className="text-white">Wallet Address:</span>{" "}
              {userAddress}
            </p>
            <p>
              <span className="text-white">Total Reward: </span>$
              {dashboardMainData?.grandTotalAmount.toFixed(2) || 0}
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center text-gray-400 animate-pulse">
            Loading progress...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {generateCycles(amount).map((cycle, index) => {
              const { mainStart, mainEnd, miniEnd } = cycle;

              const mainTotal = mainEnd - mainStart;
              const mainCurrent = Math.max(
                0,
                Math.min(amount - mainStart, mainTotal)
              );
              const mainPercent = (mainCurrent / mainTotal) * 100;

              const miniTotal = miniEnd - mainEnd;
              const miniCurrent = Math.max(
                0,
                Math.min(amount - mainEnd, miniTotal)
              );
              const miniPercent = (miniCurrent / miniTotal) * 100;

              return (
                <div
                  key={index}
                  className="bg-zinc-800 p-4 sm:p-6 rounded-2xl shadow-md border border-zinc-700 space-y-4"
                >
                  <h3 className="text-lg sm:text-xl font-semibold text-center text-gray-100">
                    TopUp {index + 1}
                  </h3>

                  {/* Main Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-1 text-xs sm:text-sm">
                      <span className="text-purple-400 font-medium">
                        Earning Bar ({mainStart} → {mainEnd})
                      </span>
                    </div>
                    <div className="w-full h-3 sm:h-4 bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 transition-all duration-700"
                        style={{ width: `${mainPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-right text-gray-400 mt-1">
                      {mainCurrent.toFixed(2)} / {mainTotal} USDT (
                      {mainPercent.toFixed(1)}%)
                    </p>
                  </div>

                  {/* Mini Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-1 text-xs sm:text-sm">
                      <span className="text-yellow-400 font-medium">
                        Locking Bar ({mainEnd} → {miniEnd})
                      </span>
                    </div>
                    <div className="w-full h-2.5 sm:h-3 bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all duration-700"
                        style={{ width: `${miniPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-right text-gray-400 mt-1">
                      {miniCurrent.toFixed(2)} / {miniTotal} USDT (
                      {miniPercent.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Locked Top-up Display */}
        {!loading && (
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">Locked Top-up</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-300">
              {locked?.toFixed(2) ?? "0.00"} USDT
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
