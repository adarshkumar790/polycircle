"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { getFormattedId, getUserDetails } from "@/components/registerUser";
import { useRegister } from "@/components/usehooks/usehook";
import type { RewardDistributed } from "@/GraphQuery/query";
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

  const circleData = useSelector((state: RootState) => state.user.circleData);
  const { signer } = useRegister();

  const [levelData, setLevelData] = useState<LevelData>({});
  const [formattedIds, setFormattedIds] = useState<Record<string, string>>({});
  const [referrerIds, setReferrerIds] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [entriesToShow, setEntriesToShow] = useState<number | "5">("5");
  const [searchText, setSearchText] = useState("");

  const rewards = levelData[selectedLevel] || [];

  const filteredRewards = rewards.filter((r) => {
    const formattedId = formattedIds[r.fromUserId] || r.fromUserId;
    const refId = referrerIds[r.fromUserId] || "";
    const tx = r.transactionHash || "";
    const query = searchText.toLowerCase();
    return (
      formattedId.toLowerCase().includes(query) ||
      refId.toLowerCase().includes(query) ||
      tx.toLowerCase().includes(query)
    );
  });

  const displayedRewards =
    entriesToShow === "5" ? filteredRewards : filteredRewards.slice(0, entriesToShow);

  const rewardPerEntry = LEVEL_REWARD_AMOUNTS[selectedLevel] || 0;
  const totalAmount = displayedRewards.length * rewardPerEntry;

  const allRewards = Object.values(levelData).flat();
  const totalGlobalAmount = Object.entries(levelData).reduce(
    (sum, [levelStr, rewards]) =>
      sum + (LEVEL_REWARD_AMOUNTS[+levelStr] || 1) * rewards.length,
    0
  );

  useEffect(() => {
    const prepareData = async () => {
      if (!signer || !circleData?.levelData) return;

      setLoading(true);
      const levels: LevelData = {};
      for (const levelEntry of circleData.levelData) {
        const level = parseInt(levelEntry.level);
        if (!levels[level]) levels[level] = [];
        //@ts-ignore
        levels[level] = levels[level].concat(levelEntry.levelData || []);
      }
      setLevelData(levels);

      const uniquefromUserIds = Array.from(
        new Set(Object.values(levels).flat().map((r) => r.fromUserId))
      );

      const formattedMap: Record<string, string> = {};
      const referrerMap: Record<string, string> = {};

      await Promise.all(
        uniquefromUserIds.map(async (id) => {
          try {
            const userId = parseInt(id);
            const [formattedUser, userDetails] = await Promise.all([
              getFormattedId(signer, userId),
              getUserDetails(signer, userId),
            ]);

            formattedMap[id] = formattedUser.formattedId || id;

            if (userDetails.referrerId && userDetails.referrerId > 0) {
              const refFormatted = await getFormattedId(signer, userDetails.referrerId);
              referrerMap[id] = refFormatted.formattedId || String(userDetails.referrerId);
            } else {
              referrerMap[id] = "-";
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

    prepareData();
  }, [circleData?.levelData, signer]);

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.replace(`?level=${e.target.value}`);
  };

  const handleEntriesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setEntriesToShow(val === "5" ? "5" : parseInt(val));
  };

  return (
    <div className="px-2 py-4 max-w-7xl mx-auto font-sans bg-black text-white">
      <div className="flex items-center justify-between mt-4">
        <Link
          href="/dashboards"
          className="flex-shrink-0 flex items-center text-white hover:text-purple-300 font-bold text-xl"
        >
          Back
        </Link>
        <h1 className="text-xl md:text-3xl font-bold text-center flex-1">
          Generation Reward
        </h1>
        <div className="w-[80px] md:w-[120px]" />
      </div>

      <div className="bg-purple-900 rounded-t-md px-4 py-4 mt-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">Level</label>
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

          <div className="w-full lg:w-[280px] text-center">
            <input
              type="text"
              placeholder="Search by User ID, Sponsor ID, or Tx Hash"
              className="w-full bg-purple-800 border border-white text-white px-3 py-1.5 rounded text-sm placeholder-gray-300"
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">Show</label>
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

        <div className="mt-3 text-sm text-center">
          <strong>Level {selectedLevel}:</strong>{" "}
          {displayedRewards.length} entries | ${totalAmount.toFixed(2)}
        </div>

        <div className="mt-1 text-xs text-center text-gray-300">
          <strong>Total (All Levels):</strong>{" "}
          {allRewards.length} entries | ${totalGlobalAmount.toFixed(2)}
        </div>
      </div>

      <div className="overflow-x-auto bg-[#220128] rounded-b-xl scrollbar-hide w-full">
        <table className="w-full text-sm border-collapse min-w-[900px]">
          <thead className="bg-[#220128] text-left">
            <tr>
              <th className="sticky left-0 z-30 bg-[#220128] px-2 py-2 w-[40px] min-w-[80px]">
                Sr. No
              </th>
              <th className="px-2 py-2 w-[150px] min-w-[150px]">User Id</th>
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
                  No rewards found at this level.
                </td>
              </tr>
            ) : (
              displayedRewards
                .sort((a, b) => Number(b.blockTimestamp) - Number(a.blockTimestamp))
                .map((r, i) => (
                  <tr key={i} className="border-t border-purple-700">
                    <td className="sticky left-0 z-20 bg-[#220128] px-2 py-2 w-[80px] min-w-[80px]">
                      {i + 1}
                    </td>
                    <td className="px-2 py-2 text-yellow-300 w-[150px] min-w-[150px] break-words">
                      {formattedIds[r.fromUserId] || r.fromUserId}
                    </td>
                    <td className="px-2 py-2 break-words min-w-[140px]">
                      {referrerIds[r.fromUserId] || "-"}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap min-w-[180px]">
                      {format(new Date(+r.blockTimestamp * 1000), "Pp")}
                    </td>
                    <td className="px-2 py-2 text-center min-w-[100px]">
                      ${rewardPerEntry}
                    </td>
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
