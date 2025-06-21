"use client";

import DynamicTable from "@/components/Table";
import Trees, { ExtendedNodeDatum } from "@/components/TreeStructure/Tree";
import { getUserFullTree } from "@/components/registerUser";
import { useRegister } from "@/components/usehooks/usehook";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchAllChildRebirths,
  FromUserIdANDReceiverIdFetchTXNQuery,
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
  const [childIds, setChildIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [navigationStack, setNavigationStack] = useState<string[]>([]);

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

    const receiverIdStr = String(result.userId);
    const txnPromises = fromUserIds.map(async (fromId) => {
      const transactions = await FromUserIdANDReceiverIdFetchTXNQuery(
        receiverIdStr,
        String(fromId)
      );
      return transactions
        .sort((a, b) => Number(b.blockTimestamp) - Number(a.blockTimestamp))
        .map((txn) => {
          const txnHash = txn.transactionHash;
          return {
            userId: String(fromId),
            "date&time": txn.blockTimestamp
              ? new Date(Number(txn.blockTimestamp) * 1000).toLocaleString()
              : "N/A",
            amount: "$10.00",
            blockTimestamp: txn.blockTimestamp,
            txn: {
              label: txnHash
                ? `${txnHash.slice(0, 6)}...${txnHash.slice(-6)}`
                : "N/A",
              href: txnHash
                ? `https://testnet.bscscan.com/tx/${txnHash}`
                : "#",
              hash: txnHash,
            },
          };
        });
    });

    const txnResults = await Promise.all(txnPromises);
    const flattened = txnResults.flat();

    const uniqueMap = new Map<string, any>();
    for (const row of flattened) {
      const hash = row.txn.hash;
      if (!uniqueMap.has(hash)) {
        const { hash: _, ...cleanRow } = row.txn;
        uniqueMap.set(hash, { ...row, txn: cleanRow });
      }
    }

    setCircleData(Array.from(uniqueMap.values()));
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
        setChildIds(ids);
      } catch (err) {
        setError("Failed to fetch child IDs");
      } finally {
        setLoading(false);
      }
    };

    fetchChildRebirths();
  }, [userId]);

  const handleChildClick = async (id: string) => {
    setSelectedChildId(id);
    setNavigationStack((prev) => [...prev, id]);
    await fetchTreeAndTransactions(Number(id));
  };

  const handleGoBack = async () => {
    const newStack = [...navigationStack];
    newStack.pop();
    const prevId = newStack[newStack.length - 1];
    setNavigationStack(newStack);
    setSelectedChildId(prevId);
    await fetchTreeAndTransactions(Number(prevId));
  };

  if (!config) {
    return <div className="text-red-500 p-4">Invalid table type: {type}</div>;
  }

  const getCircleLabel = () => {
    if (selectedChildId) {
      const index = childIds.indexOf(selectedChildId);
      if (index !== -1 && index === childIds.length - 1) {
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
          className={`px-4 py-2 rounded text-white transition ${
            selectedChildId === null || selectedChildId === navigationStack[0]
              ? "bg-green-700"
              : "bg-blue-600 hover:bg-blue-800"
          }`}
        >
          {navigationStack[0]}
        </button>

        {/* Child buttons */}
        {childIds.map((id, index) => {
  const isLast = index === childIds.length - 1;
  const isSelected = selectedChildId === id;
  const label = isLast
    ? `Current (${navigationStack[0]}/${index + 1})`
    : `${navigationStack[0]}/${index + 1}`;
  return (
    <button
      key={id}
      onClick={() => handleChildClick(id)}
      className={`px-4 py-2 rounded text-white transition ${
        isSelected ? "bg-green-700" : "bg-blue-600 hover:bg-blue-800"
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
      <Link href="/trees">Tree</Link>

      <div className="w-full mb-8">
        <DynamicTable
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
        />
      </div>
    </div>
  );
}
