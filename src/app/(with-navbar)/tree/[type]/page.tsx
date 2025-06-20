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
  // FromUserIdANDReceiverIdFetchTXNQuery,
} from "@/GraphQuery/query";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";

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
    const circleData1 = useSelector((state: RootState) => state.user.circleData);
    
  

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

  console.log("circle Data", circleData1);

  const fetchTreeAndTransactions = async (id: number) => {
    const result = await getUserFullTree(signer as any, id);
    console.log("fulltree", result)
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

      return transactions.map((txn) => {
        const txnHash = txn.transactionHash;
            console.log("txnHash", txn)
        return {
          userId: String(fromId),
          "date&time": txn.blockTimestamp
            ? new Date(Number(txn.blockTimestamp) * 1000).toLocaleString()
            : "N/A",
          amount: "$10.00", // custom static amount
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
    fetchTreeAndTransactions(userId as any);
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

  return (
    <div className="p-3 max-w-6xl mx-auto bg-black">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        Organization Tree
      </h1>

      {navigationStack.length > 1 && (
        <div className="flex justify-center mb-4">
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded text-white"
          >
            Prev
          </button>
        </div>
      )}

  <div className="flex gap-2 flex-wrap justify-center mb-6">
  {/* Show root userId as clickable "Current" label */}
  {navigationStack.length > 0 && (
    <button
      onClick={() => handleChildClick(navigationStack[0])}
      className={`px-4 py-2 rounded text-white transition ${
        selectedChildId === navigationStack[0]
          ? "bg-green-700"
          : "bg-blue-600 hover:bg-blue-800"
      }`}
    >
      {navigationStack[0]} {/* or label it as "Current" if you want */}
    </button>
  )}

  {/* Show childIds as clickable buttons */}
  {childIds.map((id, index) => (
    <button
      key={id}
      onClick={() => handleChildClick(id)}
      className={`px-4 py-2 rounded text-white transition ${
        selectedChildId === id
          ? "bg-green-700"
          : "bg-blue-600 hover:bg-blue-800"
      }`}
    >
      {`${navigationStack[0]}/${index + 1}`}
    </button>
  ))}
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
{/* 
      <div className="mt-6 p-4 bg-gray-900 rounded-lg text-white text-sm w-full">
        <h2 className="font-semibold mb-2">Name</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          <li className="flex items-center">
            <span className="inline-block w-8 h-8 rounded-full bg-white border border-gray-400 mr-2"></span>
            Self ID
          </li>
          <li className="flex items-center">
            <span className="inline-block w-8 h-8 rounded-full bg-red-500 mr-2"></span>
            Vacant
          </li>
          <li className="flex items-center">
            <span className="inline-block w-8 h-8 rounded-full bg-yellow-400 mr-2"></span>
            Upline Id
          </li>
          <li className="flex items-center">
            <span className="inline-block w-8 h-8 rounded-full bg-green-500 mr-2"></span>
            Other ID
          </li>
          <li className="flex items-center">
            <span className="inline-block w-8 h-8 rounded-full bg-blue-500 mr-2"></span>
            Super-Upline ID
          </li>
        </ul>
      </div> */}

      <div className="w-full mb-8">
    <DynamicTable
  title={config.title}
  circle={`Circle: ${navigationStack[0]}${selectedChildId ? `/${childIds.indexOf(selectedChildId) + 1}` : ""}`}
  columns={config.columns}
  data={circleData.slice(0, entriesCount)}
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
