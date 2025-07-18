"use client";

import { useEffect, useState } from "react";
import { useRegister } from "@/components/usehooks/usehook";
import {
  getUserFullTree,
  getRewardHistoryByUserId,
  RewardRecord,
  getFormattedId,
} from "@/components/registerUser";
import { fetchAllChildRebirths } from "@/GraphQuery/query";
import Trees, { ExtendedNodeDatum }  from "@/components/Trees"
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import Link from "next/link";

export default function TreeFilteredRewardHistory() {
  const { signer } = useRegister();
  const userId = useSelector((state: RootState) => state.user.userId);
  const circleData = useSelector((state: RootState) => state.user.circleData);

  const [activeId, setActiveId] = useState<number>(userId as any);
  const [childIds, setChildIds] = useState<number[]>([]);
  const [treeJson, setTreeJson] = useState<ExtendedNodeDatum | null>(null);
  const [rewards, setRewards] = useState<RewardRecord[]>([]);
  const [formattedFromIds, setFormattedFromIds] = useState<Map<string, string>>(new Map());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChildRebirths = async () => {
      try {
        const ids = await fetchAllChildRebirths(String(userId));
        const parsed = ids.map((id: string) => Number(id)).filter((id) => !isNaN(id));
        setChildIds(parsed);
        console.log("child", parsed);
        //@ts-ignore
        setActiveId(parsed.length > 0 ? parsed[parsed.length - 1] : userId);
      } catch {
        setError("Failed to fetch rebirth child IDs.");
      }
    };
    fetchChildRebirths();
  }, [userId]);

  useEffect(() => {
    if (!signer || activeId === null || activeId === undefined) return;

    const fetchData = async () => {
      const tree = await getUserFullTree(signer, activeId);
      if (tree.error) {
        setError(tree.error);
        return;
      }

      const ids = [
        tree.userId,
        tree.leftId,
        tree.rightId,
        tree.leftLeftId,
        tree.leftRightId,
        tree.rightLeftId,
        tree.rightRightId,
      ].filter((id) => id && id !== 0);

      const { rewards: rawRewards, error: rewardError } = await getRewardHistoryByUserId(signer, activeId);
      if (rewardError) {
        setError(rewardError);
        return;
      }

      const filtered = (rawRewards || []).filter((r) => ids.includes(Number(r.fromUserId)));

      const latestByFromId = new Map<string, RewardRecord>();
      for (const reward of filtered) {
        const existing = latestByFromId.get(reward.fromUserId);
        if (!existing || Number(reward.timestamp) > Number(existing.timestamp)) {
          latestByFromId.set(reward.fromUserId, reward);
        }
      }

      const rewardsList = Array.from(latestByFromId.values());

      const levelRewards = circleData?.levelData.flatMap((x) => x.levelData) || [];
const uplineRewards = circleData?.uplineRewards || [];
const superUplineRewards = circleData?.superUplineRewards || [];

const allRewards = [...levelRewards, ...uplineRewards, ...superUplineRewards];

const finalData = rewardsList.map((x) => {
  const tx = allRewards.find((z: any) => z.fromUserId === x.fromUserId)?.transactionHash || "";
  return {
    ...x,
    transactionHash: tx,
  };
});

      setRewards(finalData);

      const formattedMap = new Map<string, string>();
      await Promise.all(
        finalData.map(async (r) => {
          try {
            const { formattedId } = await getFormattedId(signer, Number(r.fromUserId));
            formattedMap.set(r.fromUserId, formattedId);
          } catch {
            formattedMap.set(r.fromUserId, r.fromUserId);
          }
        })
      );
      setFormattedFromIds(formattedMap);

      const toNode = (id: number): ExtendedNodeDatum => {
        const reward = finalData.find((r) => Number(r.fromUserId) === id);
        return {
          name: id.toString(),
          //@ts-ignore
          rewardType: reward?.rewardType || "",
        };
      };

      const jsonTree: ExtendedNodeDatum = {
        name: tree.userId.toString(),
        rewardType: "",
        children: [
          {
            name: tree.leftId.toString(),
            //@ts-ignore
            rewardType: finalData.find((r) => Number(r.fromId) === tree.leftId)?.rewardType || "",
            children: [toNode(tree.leftLeftId), toNode(tree.leftRightId)],
          },
          {
            name: tree.rightId.toString(),
            //@ts-ignore
            rewardType: finalData.find((r) => Number(r.fromId) === tree.rightId)?.rewardType || "",
            children: [toNode(tree.rightLeftId), toNode(tree.rightRightId)],
          },
        ],
      };

      setTreeJson(jsonTree);
    };

    fetchData();
  }, [signer, activeId, circleData]);

   const RewardTable = ({ rewards }: { rewards: RewardRecord[] }) => {
    const getRowColor = (type: string) => {
      switch (type) {
        case "DIRECT": return "bg-purple-400 text-black";
        case "UPLINE": return "bg-blue-400 text-black";
        case "SUPER_UPLINE": return "bg-yellow-400 text-black";
        case "UPLINE_REBIRTH":
        case "SUPER_UPLINE_REBIRTH":

        case "DIRECT_REBIRTH": return "bg-green-400 text-black";
        default: return "bg-gray-200 text-black";
      }
    };

    return (
      <div className="overflow-x-auto mt-6 bg-black">
        <table className="min-w-[800px] w-full text-sm text-left rounded-lg">
          <thead className="bg-purple-900 text-white">
            <tr>
              <th className="px-4 py-2 sticky left-0 z-10 bg-purple-900">Sr No</th>
              <th className="px-4 py-2">From ID</th>
              <th className="px-4 py-2">Amount</th>
              {/* <th className="px-4 py-2">Reward Type</th> */}
              {/* <th className="px-4 py-2">Level</th> */}
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Txn Hash</th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((r, i) => (
              <tr key={i} className={`${getRowColor(r.rewardType)} border-b`}>
                <td className="px-4 py-2 sticky left-0 z-10 bg-inherit">{i + 1}</td>
                <td className="px-4 py-2">{formattedFromIds.get(r.fromUserId) || r.fromUserId}</td>
                <td className="px-4 py-2">10$</td>
                {/* <td className="px-4 py-2">{r.rewardType}</td> */}
                {/* <td className="px-4 py-2">{r.level}</td> */}
                <td className="px-4 py-2">{new Date(Number(r.timestamp) * 1000).toLocaleString()}</td>
                <td className="px-2 py-2 break-all min-w-[200px]">
                  {r?.transactionHash ? (
                    <a href={`https://testnet.bscscan.com/tx/${r.transactionHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-900 underline">
                      {r.transactionHash.slice(0, 6)}...{r.transactionHash.slice(-6)}
                    </a>
                  ) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
      <div className="bg-black">
        <div className="flex justify-center mt-8">
          <Link href="/dashboards" className="text-white font-bold">
        Back
          </Link>
        </div>
        <div className="bg-gray-900 text-white p-4 sm:p-6 rounded-md shadow-md max-w-6xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-teal-300">Tree</h2>

      <div className="flex flex-wrap gap-2 justify-center mb-6">
        <button
          onClick={() => setActiveId(userId as any)}
          //@ts-ignore
          className={`px-4 py-2 rounded ${activeId === userId ? "bg-teal-600" : "bg-gray-700"}`}
        >
          {userId}
        </button>
        {childIds.map((id, i) => (
  <button
    key={id}
    onClick={() => setActiveId(id)}
    className={`px-4 py-2 rounded ${
      id === activeId ? "bg-teal-600" : "bg-gray-700"
    }`}
  >
    {i === childIds.length - 1
      ? `Current ${userId}/${i+1}`
      : `${userId}/${i + 1}`}
  </button>
))}

      </div>
        
      <div className="h-[400px] sm:h-[600px] w-full mb-6">
        {treeJson ? <Trees data={treeJson} /> : <div className="text-center text-yellow-300">Loading tree...</div>}
      </div>

      {error ? (
        <div className="text-red-500 p-4 text-center">Error: {error}</div>
      ) : rewards.length === 0 ? (
        <div className="text-yellow-400 text-center">No reward records found.</div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold text-center text-teal-400 mb-2">
            Circle: {activeId === Number(userId) ? `${userId}` : `${userId}/${childIds.indexOf(activeId) + 1}`}
          </h3>
          <div className="mt-6 p-4 bg-gray-900 rounded-lg text-white text-sm w-full">
        <h2 className="font-semibold mb-2">Name</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          <li className="flex items-center">
            <span className="inline-block w-8 h-8 rounded-full bg-white border border-gray-400 mr-2"></span>
            Self
          </li>
          <li className="flex items-center">
            <span className="inline-block w-8 h-8 rounded-full bg-purple-400 border border-gray-400 mr-2"></span>
            Direct
          </li>
          
          <li className="flex items-center">
            <span className="inline-block w-8 h-8 rounded-full bg-[#f87171] mr-2"></span>
            Empty Circle
          </li>
         
          <li className="flex items-center">
            <span className="inline-block w-8 h-8 rounded-full bg-green-500 mr-2"></span>
            Rebirth
          </li>
          <li className="flex items-center">
            <span className="inline-block w-8 h-8 rounded-full bg-blue-500 mr-2"></span>
            Upline
          </li>
           <li className="flex items-center">
            <span className="inline-block w-8 h-8 rounded-full bg-yellow-400 mr-2"></span>
            Super Upline
          </li>
        </ul>
      </div>
          <RewardTable rewards={rewards} />
        </div>
      )}
    </div>
    </div>
  );
}
