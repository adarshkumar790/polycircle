"use client";

import DynamicTable from "@/components/Table";
import Trees, { ExtendedNodeDatum } from "@/components/TreeStructure/Tree";
import { getUserFullTree } from "@/components/registerUser";
import { useRegister } from "@/components/usehooks/usehook";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchAllChildRebirths,
} from "@/GraphQuery/query";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import Link from "next/link";

const sharedTotalTeam = [
  { label: "User ID", accessor: "userId" },
  { label: "Date & Time", accessor: "date&time" },
  { label: "Amount", accessor: "amount" },
  { label: "Txn", accessor: "txn" },
];

const tableConfigs: Record<
  string,
  { title: string; columns: any[]; data: any[]; circle: string }
> = {
  "current-circle": {
    title: "Current Circle",
    circle: "",
    columns: sharedTotalTeam,
    data: [],
  },
};

export default function OrgTreePage() {
  const { type } = useParams();
  const { signer } = useRegister();
  const userId = useSelector((state: RootState) => state.user.userId);
  const config = tableConfigs[type as string];
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [entriesCount, setEntriesCount] = useState(10);
  const [treeData, setTreeData] = useState<ExtendedNodeDatum | null>(null);
  const [circleData, setCircleData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [childUserIds, setchildUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedchildUserId, setSelectedchildUserId] = useState<string | null>(null);
  const [navigationStack, setNavigationStack] = useState<string[]>([]);
  const _circleData = useSelector((state: RootState) => state.user.circleData);

  const fetchTreeAndTransactions = async (id: number) => {
    const result = await getUserFullTree(signer as any, id);
    if (result.error) {
      setError(result.error);
      setTreeData(null);
      setCircleData([]);
      return;
    }

    const allIds = [
      result.userId,
      result.leftId,
      result.rightId,
      result.leftLeftId,
      result.leftRightId,
      result.rightLeftId,
      result.rightRightId,
    ].filter((id) => id !== 0);



    const fromUserIds = Array.from(
      new Set(allIds.filter((id) => id !== result.userId))
    );

    const newTree: ExtendedNodeDatum = {
      name: String(result.userId),
      children: [
        {
          name: String(result.leftId),
          children: [
            { name: String(result.leftLeftId) },
            { name: String(result.leftRightId) },
          ],
        },
        {
          name: String(result.rightId),
          children: [
            { name: String(result.rightLeftId) },
            { name: String(result.rightRightId) },
          ],
        },
      ],
    };

    setTreeData(newTree);

    const receiverUserIdStr = String(result.userId);
console.log("_circleData", _circleData);
    const levelRewards = _circleData?.levelData.flatMap((x) => x.levelData) || [];
    const uplineRewards = _circleData?.uplineRewards || [];
    const superUplineRewards = _circleData?.superUplineRewards || [];

    const allRewards = [...levelRewards, ...uplineRewards, ...superUplineRewards];

    console.log("All Rewards:", allIds,allRewards,_circleData);

    const txnPromises = allIds.filter(x=>x!==Number(result.userId)).map(x => {
      console.log(x)
      const data = allRewards.find((y: any) => y.fromUserId.toString() === x.toString());
      if(!data) return;
      return {
        userId: data.fromUserId,
        "date&time": data.blockTimestamp
          ? new Date(Number(data.blockTimestamp) * 1000).toLocaleString()
          : "N/A",
        amount: "$10.00",
        blockTimestamp: data.blockTimestamp,
        rewardType: data.rewardType,
        txn: {
          label: data.transactionHash
            ? `${data.transactionHash.slice(0, 6)}...${data.transactionHash.slice(-6)}`
            : "N/A",
          href: data.transactionHash
            ? `https://testnet.bscscan.com/tx/${data.transactionHash}`
            : "#",
          hash: data.transactionHash,
        },
      };
    })

    const txnResults = await Promise.all(txnPromises);
    console.log(txnResults)
    setCircleData(txnResults);
  };

  useEffect(() => {
    if (!signer || type !== "current-circle") return;
    setNavigationStack([String(userId)]);
    fetchTreeAndTransactions(Number(userId));
  }, [signer, type]);

  useEffect(() => {
    if (!userId) return;

    const fetchChildRebirths = async () => {
      setLoading(true);
      try {
        const ids = await fetchAllChildRebirths(String(userId));
        setchildUserIds(ids);
      } catch (err) {
        setError("Failed to fetch child IDs");
      } finally {
        setLoading(false);
      }
    };

    fetchChildRebirths();
  }, [userId]);

  const handleChildClick = async (id: string) => {
    setSelectedchildUserId(id);
    setNavigationStack((prev) => [...prev, id]);
    await fetchTreeAndTransactions(Number(id));
  };

  const handleGoBack = async () => {
    const newStack = [...navigationStack];
    newStack.pop();
    const prevId = newStack[newStack.length - 1];
    setNavigationStack(newStack);
    setSelectedchildUserId(prevId);
    await fetchTreeAndTransactions(Number(prevId));
  };

  if (!config) {
    return <div className="text-red-500 p-4">Invalid table type: {type}</div>;
  }

  const getCircleLabel = () => {
    if (selectedchildUserId) {
      const index = childUserIds.indexOf(selectedchildUserId);
      if (index !== -1 && index === childUserIds.length - 1) {
        return "Current";
      }
      return `${navigationStack[0]}/${index + 1}`;
    }
    return `${navigationStack[0]}`;
  };

  return (
    <div className="p-3 max-w-6xl mx-auto bg-black">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        Organization Tree
      </h1>

      {navigationStack.length > 1 && (
        <div className="flex justify-center mb-4">
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 font-semibold rounded text-white"
          >
            Prev
          </button>
        </div>
      )}

      <div className="flex gap-2 flex-wrap justify-center mb-6">
        {/* Root userId button */}
        <button
          onClick={() => handleChildClick(navigationStack[0])}
          className={`px-4 py-2 rounded text-white transition ${selectedchildUserId === null || selectedchildUserId === navigationStack[0]
            ? "bg-green-700"
            : "bg-blue-600 hover:bg-blue-800"
            }`}
        >
          {navigationStack[0]}
        </button>

        {/* Child buttons */}
        {childUserIds.map((id, index) => {
          const isLast = index === childUserIds.length - 1;
          const isSelected = selectedchildUserId === id;
          const label = isLast
            ? `Current (${navigationStack[0]}/${index + 1})`
            : `${navigationStack[0]}/${index + 1}`;
          return (
            <button
              key={id}
              onClick={() => handleChildClick(id)}
              className={`px-4 py-2 rounded text-white transition ${isSelected ? "bg-green-700" : "bg-blue-600 hover:bg-blue-800"
                }`}
            >
              {label}
            </button>
          );
        })}

      </div>

      <div className="p-2 rounded shadow w-full h-[500px] bg-gray-900 overflow-auto mb-8">
        {error ? (
          <div className="text-red-400 text-center">{error}</div>
        ) : treeData ? (
          <Trees data={treeData} />
        ) : (
          <div className="text-white text-center">Loading tree...</div>
        )}
      </div>
       <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          <li className="flex items-center">
            <span className="inline-block w-8 h-8 rounded-full bg-white border border-gray-400 mr-2"></span>
            Self
          </li>
          {/* <li className="flex items-center">
            <span className="inline-block w-8 h-8 rounded-full bg-purple-400 border border-gray-400 mr-2"></span>
            Direct
          </li> */}
          
          <li className="flex items-center">
            <span className="inline-block w-8 h-8 rounded-full bg-[#f87171] mr-2"></span>
            Empty Circle
          </li>
         
          <li className="flex items-center">
            <span className="inline-block w-8 h-8 rounded-full bg-green-500 mr-2"></span>
            Rebirth
          </li>
          <li className="flex items-center">
            <span className="inline-block w-8 h-8 rounded-full bg-yellow-400 mr-2"></span>
            Upline
          </li>
           <li className="flex items-center">
            <span className="inline-block w-8 h-8 rounded-full bg-blue-500 mr-2"></span>
            Super Upline
          </li>
        </ul>

      <div className="w-full mb-8 mt-4">
       {circleData && circleData.length &&  <DynamicTable
          title={config.title}
          circle={getCircleLabel()}
          columns={config.columns}
          data={[...circleData].sort(
            (a, b) => Number(b.blockTimestamp) - Number(a.blockTimestamp)
          ).slice(0, entriesCount)}
          showLevelSelector={false}
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          showEntriesSelector={false}
          entriesCount={entriesCount}
          onEntriesChange={setEntriesCount}
          isCurrentCircle={true}
        />}
      </div>
    </div>
  );
}
