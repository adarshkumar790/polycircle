"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { getFormattedId, getUserDetailsById } from "@/components/registerUser";
import { useRegister } from "@/components/usehooks/usehook";
import { getTotalReward, type DashboardRewards, type RewardDistributed } from "@/GraphQuery/query";
import { setCircleData } from "@/Redux/store/userSlice";
import Link from "next/link";

type LevelData = {
  [level: number]: RewardDistributed[];
};

const LEVEL_REWARD_AMOUNTS: Record<number, number> = {
  1: 11,
  2: 2.5,
  3: 1,
  4: 1,
  5: 0.5,
  6: 0.5,
  7: 0.5,
  8: 1,
  9: 1,
  10: 2.5,
};

export default function RewardsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedLevel = parseInt(searchParams.get("level") || "1");
   const [dashboardMainData, setDashboardData] = useState<DashboardRewards>();

  const circleData = useSelector((state: RootState) => state.user.circleData);
  const { signer } = useRegister();
  const userId = useSelector((state: RootState) => state.user.userId);
  const dispatch = useDispatch<any>();

  const [tab, setTab] = useState<"generation" | "upline" | "superUpline">("generation");
  const [levelData, setLevelData] = useState<LevelData>({});
  const [formattedIds, setFormattedIds] = useState<Record<string, string>>({});
  const [referrerIds, setReferrerIds] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [entriesToShow, setEntriesToShow] = useState<number | "5">("5");

  const rewards = levelData[selectedLevel] || [];
  const displayedRewards = entriesToShow === "5" ? rewards : rewards.slice(0, entriesToShow);

  const rewardPerEntry =
    tab === "generation" ? LEVEL_REWARD_AMOUNTS[selectedLevel] || 1 : 10;

  const totalAmount = displayedRewards.length * rewardPerEntry;

  const allRewards = Object.values(levelData).flat();

  const totalGlobalAmount =
    tab === "generation"
      ? Object.entries(levelData).reduce(
          (sum, [levelStr, rewards]) =>
            sum + (LEVEL_REWARD_AMOUNTS[+levelStr] || 1) * rewards.length,
          1
        )
      : allRewards.length * 10;

  useEffect(() => {
    if (!signer || !circleData) return;

    setLoading(true);

    const selectedLevels =
      tab === "generation"
         //@ts-ignore
        ? (circleData.levels as LevelData)
        : tab === "upline"
        ? { 1: circleData.uplineRewards || [] }
        : { 1: circleData.superUplineRewards || [] };

    setLevelData(selectedLevels);

    const uniqueFromIds = Array.from(
      new Set(Object.values(selectedLevels).flat().map((r) => r.fromUserId))
    );

    const fetchDetails = async () => {
      const formattedMap: Record<string, string> = {};
      const referrerMap: Record<string, string> = {};

      await Promise.all(
        uniqueFromIds.map(async (id) => {
          try {
            const userId = parseInt(id);
            const [{ formattedId }, { user }] = await Promise.all([
              getFormattedId(signer, userId),
              getUserDetailsById(signer, userId),
            ]);

            formattedMap[id] = formattedId || id;

            if (user?.referrerId) {
              const { formattedId: refFormatted } = await getFormattedId(
                signer,
                parseInt(user.referrerId)
              );
              referrerMap[id] = refFormatted || user.referrerId;
            }
          } catch {
            formattedMap[id] = id;
            referrerMap[id] = "-";
          }
        })
      );

      setFormattedIds(formattedMap);
      setReferrerIds(referrerMap);
      setLoading(false);
    };

    fetchDetails();
  }, [circleData, tab, signer]);

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.replace(`?level=${e.target.value}`);
  };

  const handleEntriesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setEntriesToShow(val === "5" ? "5" : parseInt(val));
  };

   const getLevelRewards = async (userId: string) => {
      const data = await getTotalReward([userId]);
      dispatch(setCircleData(data));
      setDashboardData(data);
      //  console.log("getLevelRewards", data);
    }
    useEffect(() => {
      if (!userId) return;
      getLevelRewards(userId)
      // fetchLevelRewards([userId])
      //   .then((levels) => {
      //     const allRewards = Object.values(levels).flat();
      //     const uniqueUserIds = new Set(allRewards.map((r) => r.fromId));
      //     setGlobalAmount(allRewards.length * 50);
      //     setTotalTeamAmount(allRewards.length * 50);
      //     setTeamCount(uniqueUserIds.size);
      //   })
      //   .catch(console.error);
  
    }, [userId]);
  

  return (
    <div className="p-2 max-w-6xl mx-auto font-sans bg-black text-white">
  {/* Header */}
  <div className="relative flex items-center justify-between mt-4">
    <Link href="/dashboards">
      <button className="text-white bg-purple-800 hover:bg-purple-700 px-4 py-2 rounded font-medium text-sm md:text-base">
        Back
      </button>
    </Link>
    <h1 className="absolute left-1/2 -translate-x-1/2 text-lg sm:text-xl md:text-3xl font-bold text-center">
      Total Reward
    </h1>
    <div className="w-[80px] md:w-[120px]" />
  </div>

  {/* Tabs */}
  <div className="flex flex-wrap justify-center gap-3 mt-4">
    {["generation", "upline", "superUpline"].map((type) => (
      <button
        key={type}
        onClick={() => setTab(type as any)}
        className={`px-4 py-1 rounded text-sm sm:text-base ${
          tab === type ? "bg-yellow-500" : "bg-gray-700"
        }`}
      >
        {type === "generation"
          ? "Generation"
          : type === "upline"
          ? "Upline"
          : "Super Upline"}
      </button>
    ))}
  </div>

  {/* Controls & Summary */}
  <div className="bg-purple-900 rounded-t-md px-4 py-4 mt-4">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {tab === "generation" && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Select</label>
          <select
            value={selectedLevel}
            onChange={handleLevelChange}
            className="text-white px-2 py-1 rounded border border-white bg-purple-800 text-sm"
          >
            {Object.keys(levelData)
              .filter((lvl) => parseInt(lvl) > 0)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map((lvl) => (
                <option key={lvl} value={lvl}>
                  Level {lvl}
                </option>
              ))}
          </select>
        </div>
      )}

      <div className="hidden sm:flex flex-1 justify-center text-sm text-center">
        <span>
          <strong>
            {tab === "generation" ? `Level ${selectedLevel}` : tab}:
          </strong>{" "}
          {displayedRewards.length} entries | ${totalAmount.toFixed(2)}
        </span>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <label className="text-sm font-medium">Show:</label>
        <select
          value={entriesToShow}
          onChange={handleEntriesChange}
          className="bg-purple-800 border border-white text-white px-2 py-1 rounded text-sm"
        >
          <option value="all">All</option>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="25">25</option>
        </select>
      </div>
    </div>

    {/* Mobile Summary */}
    <div className="mt-3 text-sm text-center sm:hidden">
      <strong>{tab === "generation" ? `Level ${selectedLevel}` : tab}:</strong>{" "}
      {displayedRewards.length} entries | ${totalAmount.toFixed(2)}
    </div>

    {/* Totals */}
    <div className="mt-1 text-xs text-center text-gray-300 sm:text-left">
      <strong>Total ({tab}):</strong> {allRewards.length} entries | ${totalGlobalAmount.toFixed(2)}
    </div>

    {tab === "generation" && (
      <div className="text-sm text-center sm:text-left mt-1 text-green-400">
        <strong>Generation Total:</strong> ${totalGlobalAmount.toFixed(2)}
      </div>
    )}
    {tab === "upline" && (
      <div className="text-sm text-center sm:text-left mt-1 text-green-400">
        <strong>Upline Total:</strong> ${(circleData?.uplineRewards?.length || 0) * 10}
      </div>
    )}
    {tab === "superUpline" && (
      <div className="text-sm text-center sm:text-left mt-1 text-green-400">
        <strong>Super Upline Total:</strong> ${(circleData?.superUplineRewards?.length || 0) * 10}
      </div>
    )}

    <div className="text-sm text-center sm:text-left mt-2 text-cyan-300">
      <strong>Grand Total:</strong> ${dashboardMainData?.grandTotalAmount.toString()}
    </div>
  </div>

  {/* Table */}
  <div className="overflow-auto bg-[#220128] rounded-b-xl scrollbar-hide w-full mt-1">
    <table className="w-full text-xs sm:text-sm border-collapse min-w-[900px]">
      <thead className="bg-[#220128] text-left">
        <tr>
          <th className="sticky left-0 z-30 bg-[#220128] px-2 py-2 w-[60px] min-w-[60px] ">
            Sr. No
          </th>
          <th className="px-2 py-2 min-w-[140px]">User Id</th>
          <th className="px-2 py-2 min-w-[140px]">Referral Id</th>
          <th className="px-2 py-2 min-w-[180px]">Join Date & Time</th>
          <th className="px-2 py-2 text-center min-w-[100px]">Amount</th>
          <th className="px-2 py-2 min-w-[200px]">Transaction Hash</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={6} className="text-center py-4 text-gray-300">
              Loading...
            </td>
          </tr>
        ) : displayedRewards.length === 0 ? (
          <tr>
            <td colSpan={6} className="text-center py-4 text-gray-300">
              No rewards found.
            </td>
          </tr>
        ) : (
          displayedRewards.map((r, i) => (
            <tr key={i} className="border-t border-purple-700">
              <td className="sticky left-0 z-20 bg-[#220128] px-2 py-2 w-[60px] min-w-[60px]">
                {i + 1}
              </td>
              <td className="px-2 py-2 text-yellow-300 break-words">
                {formattedIds?.[r.fromUserId] || r.fromUserId}
              </td>
              <td className="px-2 py-2 break-words">{referrerIds?.[r.fromUserId] ?? "-"}</td>
              <td className="px-2 py-2">
                {format(new Date(+r.blockTimestamp * 1000), "Pp")}
              </td>
              <td className="px-2 py-2 text-center">${rewardPerEntry}</td>
              <td className="px-2 py-2 break-all">
                <a
                  href={`https://polygonscan.com/tx/${r.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  {r.transactionHash.slice(0, 6)}...{r.transactionHash.slice(-6)}
                </a>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>


  );
}
