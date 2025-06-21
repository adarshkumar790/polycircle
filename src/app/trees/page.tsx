// TreeFilteredRewardHistory.tsx
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
import Trees, { ExtendedNodeDatum } from "@/components/TreeStructure/Tree";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";

export default function TreeFilteredRewardHistory() {
  const { signer } = useRegister();
  const userId = useSelector((state: RootState) => state.user.userId);

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
        //@ts-ignore
        setActiveId(parsed.length > 0 ? parsed[parsed.length - 1] : userId);
      } catch {
        setError("Failed to fetch rebirth child IDs.");
      }
    };
    fetchChildRebirths();
  }, [userId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!signer) return;

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

      const { rewards, error: rewardError } = await getRewardHistoryByUserId(signer, activeId);
      if (rewardError) {
        setError(rewardError);
        return;
      }

      const filtered = (rewards || []).filter((r) => ids.includes(Number(r.fromId)));

      const latestByFromId = new Map<string, RewardRecord>();
      for (const reward of filtered) {
        const existing = latestByFromId.get(reward.fromId);
        if (!existing || Number(reward.timestamp) > Number(existing.timestamp)) {
          latestByFromId.set(reward.fromId, reward);
        }
      }

      const rewardsList = Array.from(latestByFromId.values());
      setRewards(rewardsList);

      const formattedMap = new Map<string, string>();
      await Promise.all(
        rewardsList.map(async (r) => {
          try {
            const { formattedId } = await getFormattedId(signer, Number(r.fromId));
            formattedMap.set(r.fromId, formattedId);
          } catch {
            formattedMap.set(r.fromId, r.fromId);
          }
        })
      );
      setFormattedFromIds(formattedMap);

      const toNode = (id: number): ExtendedNodeDatum => {
        const reward = rewardsList.find((r) => Number(r.fromId) === id);
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
            rewardType: rewardsList.find((r) => Number(r.fromId) === tree.leftId)?.rewardType || "",
            children: [toNode(tree.leftLeftId), toNode(tree.leftRightId)],
          },
          {
            name: tree.rightId.toString(),
            //@ts-ignore
            rewardType: rewardsList.find((r) => Number(r.fromId) === tree.rightId)?.rewardType || "",
            children: [toNode(tree.rightLeftId), toNode(tree.rightRightId)],
          },
        ],
      };

      setTreeJson(jsonTree);
    };

    fetchData();
  }, [signer, activeId]);

  const RewardTable = ({ rewards }: { rewards: RewardRecord[] }) => {
  const getRowColor = (type: string) => {
    switch (type) {
      case "DIRECT":
        return "bg-yellow-200 text-black";
      case "UPLINE":
        return "bg-blue-200 text-black";
      case "SUPER_UPLINE":
        return "bg-purple-200 text-black";
      case "SUPER_UPLINE_REBIRTH":
      case "UPLINE_REBIRTH":
        return "bg-green-200 text-black";
      default:
        return "bg-gray-100 text-black";
    }
  };

  return (
    <div className="overflow-x-auto mt-6">
      <table className="w-full text-sm text-left rounded-lg overflow-hidden min-w-[700px]">
        <thead className="bg-purple-900 text-black">
          <tr>
            <th className="px-4 py-2 border border-purple-300">Sr No</th>
            <th className="px-4 py-2 border border-purple-300">From ID</th>
            <th className="px-4 py-2 border border-purple-300">Amount</th>
            <th className="px-4 py-2 border border-purple-300">Reward Type</th>
            <th className="px-4 py-2 border border-purple-300">Level</th>
            <th className="px-4 py-2 border border-purple-300">Date</th>
          </tr>
        </thead>
        <tbody>
          {rewards.map((r, i) => (
            <tr key={i} className={getRowColor(r.rewardType)}>
              <td className="px-4 py-2">{i + 1}</td>
              <td className="px-4 py-2">{formattedFromIds.get(r.fromId) || r.fromId}</td>
              <td className="px-4 py-2">10$</td>
              <td className="px-4 py-2">{r.rewardType}</td>
              <td className="px-4 py-2">{r.level}</td>
              <td className="px-4 py-2">{new Date(Number(r.timestamp) * 1000).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

  return (
    <div className="bg-gray-900 text-white p-6 rounded-md shadow-md max-w-6xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-teal-300">
        Reward History Viewer
      </h2>
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
            className={`px-4 py-2 rounded ${id === activeId ? "bg-teal-600" : "bg-gray-700"}`}
          >
            {`${userId}/${i + 1}`}
          </button>
        ))}
      </div>

      <div className="h-[600px] w-full mb-4">
        {treeJson ? <Trees data={treeJson} /> : <div className="text-center text-yellow-300">Loading tree...</div>}
      </div>

      {error ? (
        <div className="text-red-500 p-4 text-center">Error: {error}</div>
      ) : rewards.length === 0 ? (
        <div className="text-yellow-400 text-center">No reward records found.</div>
      ) : (
        <RewardTable rewards={rewards} />
      )}
    </div>
  );
}
