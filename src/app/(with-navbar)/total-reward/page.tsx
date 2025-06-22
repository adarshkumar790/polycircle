"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { getFormattedId } from "@/components/registerUser";
import { getUserDetails } from "@/components/registerUser";
import { useRegister } from "@/components/usehooks/usehook";
import {
  getTotalReward,
  type DashboardRewards,
  type RewardDistributed,
} from "@/GraphQuery/query";
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
  const userId = useSelector((state: RootState) => state.user.userId);
  const { signer } = useRegister();
  const dispatch = useDispatch<any>();

  const [tab, setTab] = useState<"generation" | "upline" | "superUpline">("generation");
  const [levelData, setLevelData] = useState<LevelData>({});
  const [formattedIds, setFormattedIds] = useState<Record<string, string>>({});
  const [referrerIds, setReferrerIds] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [entriesToShow, setEntriesToShow] = useState<number | "5">("5");
  const [searchText, setSearchText] = useState("");

  const rewards = levelData[selectedLevel] || [];

  const filteredRewards = rewards.filter((r) => {
    const query = searchText.toLowerCase();
    return (
      (formattedIds?.[r.fromUserId] || r.fromUserId)?.toLowerCase().includes(query) ||
      (referrerIds?.[r.fromUserId] || "")?.toLowerCase().includes(query) ||
      r.transactionHash?.toLowerCase().includes(query)
    );
  });

  const displayedRewards =
    entriesToShow === "5" ? filteredRewards : filteredRewards.slice(0, entriesToShow);

  const rewardPerEntry =
    tab === "generation" ? LEVEL_REWARD_AMOUNTS[selectedLevel] || 1 : 10;

  const totalAmount = displayedRewards.length * rewardPerEntry;
  const allRewards = Object.values(levelData).flat();
  const generationAmount =
    (dashboardMainData?.grandTotalAmount ?? 0) -
    ((dashboardMainData?.uplineAmount ?? 0) + (dashboardMainData?.superUplineAmount ?? 0));

  const getLevelRewards = async (userId: string) => {
    const data = await getTotalReward([userId]);
    dispatch(setCircleData(data));
    setDashboardData(data);
  };

  useEffect(() => {
    if (!userId) return;
    getLevelRewards(userId);
  }, [userId]);

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
            const userIdNum = parseInt(id);

            const user = await getUserDetails(signer, userIdNum);
            const { formattedId } = await getFormattedId(signer, userIdNum);
            formattedMap[id] = formattedId || id;

            if (user?.referrerId && Number(user.referrerId) !== 0) {
              const { formattedId: refFormattedId } = await getFormattedId(signer, user.referrerId);
              referrerMap[id] = refFormattedId || String(user.referrerId);
            } else {
              referrerMap[id] = "-";
            }
          } catch (err) {
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


  return (
    <div className="p-2 max-w-6xl mx-auto font-sans bg-black text-white">
      <div className="relative flex items-center justify-between mt-4">
        <Link
          href="/dashboards"
          className="flex-shrink-0 flex items-center text-white hover:text-purple-300 font-bold text-xl"
        >
          Back
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

      {/* Controls */}
      <div className="bg-purple-900 rounded-t-md px-4 py-4 mt-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {tab === "generation" && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Level</label>
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

          <div className="w-full lg:w-[300px]">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by User ID, Sponsor ID, or Tx Hash"
              className="w-full bg-purple-800 border border-white text-white px-3 py-1.5 rounded text-sm placeholder-gray-300"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Show</label>
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

        <div className="mt-3 text-sm text-center sm:text-left">
          <strong>
            {tab === "generation" ? `Level ${selectedLevel}` : tab}:
          </strong>{" "}
          {displayedRewards.length} entries | ${totalAmount.toFixed(2)}
        </div>

        <div className="text-xs text-center text-gray-300 sm:text-left mt-1">
          <strong>Total ({tab}):</strong> {allRewards.length} entries | $
          {generationAmount.toFixed(2)}
        </div>

        <div className="text-sm text-center sm:text-left mt-1 text-cyan-300">
          <strong>Grand Total:</strong> ${dashboardMainData?.grandTotalAmount?.toString()}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto bg-[#220128] rounded-b-xl scrollbar-hide w-full mt-1">
        <table className="w-full text-xs sm:text-sm border-collapse min-w-[900px]">
          <thead className="bg-[#220128] text-left">
            <tr>
              <th className="sticky left-0 z-30 bg-[#220128] px-2 py-2 w-[60px] min-w-[60px]">
                Sr. No
              </th>
              <th className="px-2 py-2 min-w-[140px]">User Id</th>
              <th className="px-2 py-2 min-w-[140px]">Sponsor ID</th>
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
              displayedRewards
                .sort((a, b) => Number(b.blockTimestamp) - Number(a.blockTimestamp))
                .map((r, i) => (
                  <tr key={i} className="border-t border-purple-700">
                    <td className="sticky left-0 z-20 bg-[#220128] px-2 py-2 w-[80px] min-w-[80px]">{i + 1}</td>
                    <td className="px-2 py-2 text-yellow-300 w-[150px] min-w-[150px] break-words">
                      {formattedIds[r.fromUserId] || r.fromUserId}
                    </td>
                    <td className="px-2 py-2 break-words min-w-[140px]">
                      {referrerIds[r.fromUserId] || "-"}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap min-w-[180px]">
                      {format(new Date(+r.blockTimestamp * 1000), "Pp")}
                    </td>
                    <td className="px-2 py-2 text-center min-w-[100px]">${rewardPerEntry}</td>
                    <td className="px-2 py-2 break-all min-w-[200px]">
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
