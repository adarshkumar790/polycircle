"use client";

import { useEffect, useState } from "react";
import { getUserFullTree } from "@/components/registerUser";
import { useRegister } from "@/components/usehooks/usehook";
import { FromUserIdANDReceiverIdFetchTXNQuery } from "@/GraphQuery/query";

interface TreeNode {
  userId: number;
  children: TreeNode[];
}

interface TxnData {
  userId: number;
  dateTime: string;
  amount: string;
  txn: string;
  hash: string;
}

export default function TreeLevelViewer() {
  const { signer } = useRegister();
  const [userId] = useState(1);
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [levelInput, setLevelInput] = useState("");
  const [levels, setLevels] = useState<Record<number, number[]>>({});
  const [txnDataByUserId, setTxnDataByUserId] = useState<Record<number, TxnData[]>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!signer) return;

    const fetchTree = async () => {
      try {
        const visited = new Set<number>();
        const rootTree = await buildTree(userId, visited);
        setTree(rootTree);

        const levelMap: Record<number, Set<number>> = {};
        collectLevels(rootTree, 1, levelMap);
        const finalLevels: Record<number, number[]> = {};
        for (const level in levelMap) {
          finalLevels[+level] = Array.from(levelMap[+level]);
        }
        setLevels(finalLevels);

        await fetchAllTxnDetails(finalLevels);
      } catch (err) {
        setError("Error fetching tree or transaction data");
      }
    };

    fetchTree();
  }, [signer, userId]);

  const buildTree = async (id: number, visited: Set<number>): Promise<TreeNode> => {
    if (visited.has(id)) {
      return { userId: id, children: [] };
    }

    visited.add(id);

    const result = await getUserFullTree(signer as any, id);

    const leftId = result.leftId !== 0 ? result.leftId : null;
    const rightId = result.rightId !== 0 ? result.rightId : null;

    const children: TreeNode[] = [];
    if (leftId) children.push(await buildTree(leftId, visited));
    if (rightId) children.push(await buildTree(rightId, visited));

    return {
      userId: result.userId,
      children,
    };
  };

  const collectLevels = (
    node: TreeNode,
    currentLevel: number,
    levelMap: Record<number, Set<number>>
  ) => {
    if (!levelMap[currentLevel]) {
      levelMap[currentLevel] = new Set();
    }

    if (!levelMap[currentLevel].has(node.userId)) {
      levelMap[currentLevel].add(node.userId);
    }

    for (const child of node.children) {
      collectLevels(child, currentLevel + 1, levelMap);
    }
  };

  const fetchAllTxnDetails = async (levelMap: Record<number, number[]>) => {
    const allUserIds = Array.from(new Set(Object.values(levelMap).flat()));
    const txnMap: Record<number, TxnData[]> = {};

    for (const fromId of allUserIds) {
      try {
        const transactions = await FromUserIdANDReceiverIdFetchTXNQuery(
          String(userId),
          String(fromId)
        );

        txnMap[fromId] = transactions.map((txn: any) => ({
          userId: fromId,
          dateTime: txn.blockTimestamp
            ? new Date(Number(txn.blockTimestamp) * 1000).toLocaleString()
            : "N/A",
          amount:
            txn.amount !== undefined && txn.amount !== null
              ? (
                  parseFloat(txn.amount) / 1_000_000 + 10
                ).toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })
              : "N/A",
          txn: txn.transactionHash
            ? `${txn.transactionHash.slice(0, 6)}...${txn.transactionHash.slice(-6)}`
            : "N/A",
          hash: txn.transactionHash,
        }));
      } catch (e) {
        txnMap[fromId] = [];
      }
    }

    setTxnDataByUserId(txnMap);
  };

  const selectedLevel = parseInt(levelInput);
  const selectedUserIds =
    !isNaN(selectedLevel) && selectedLevel >= 1 ? levels[selectedLevel] || [] : [];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Tree Level Viewer</h1>

      <div className="mb-6 flex items-center gap-4">
        <input
          type="number"
          value={levelInput}
          onChange={(e) => setLevelInput(e.target.value)}
          placeholder="Enter level (e.g., 2)"
          className="border px-4 py-2 rounded w-1/2"
        />
      </div>

      {error && <div className="text-red-500">{error}</div>}

      {selectedUserIds.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2 text-blue-600">
            User IDs at Level {levelInput}:
          </h2>
          <ul className="list-disc pl-6">
            {selectedUserIds.map((id) => (
              <li key={id} className="mb-4">
                <strong>User ID:</strong> {id}
                <ul className="ml-6 text-sm text-gray-800">
                  {(txnDataByUserId[id] || []).map((txn, idx) => (
                    <li key={idx}>
                      {txn.dateTime} | {txn.amount} |{" "}
                      <a
                        href={`https://testnet.bscscan.com/tx/${txn.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {txn.txn}
                      </a>
                    </li>
                  ))}
                  {txnDataByUserId[id]?.length === 0 && (
                    <li className="text-gray-500">No transactions found.</li>
                  )}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4 text-green-700">All Levels Overview</h2>
        {Object.keys(levels).length === 0 ? (
          <p className="text-gray-500">Loading levels...</p>
        ) : (
          Object.entries(levels).map(([level, ids]) => (
            <div key={level} className="mb-6">
              <h3 className="text-md font-semibold text-purple-700 mb-1">
                Level {level}:
              </h3>
              <ul className="list-disc pl-6 text-gray-800">
                {ids.map((id) => (
                  <li key={id}>
                    <strong>User ID:</strong> {id}
                    <ul className="ml-6 text-sm text-gray-600">
                      {(txnDataByUserId[id] || []).map((txn, idx) => (
                        <li key={idx}>
                          {txn.dateTime} | {txn.amount} |{" "}
                          <a
                            href={`https://testnet.bscscan.com/tx/${txn.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {txn.txn}
                          </a>
                        </li>
                      ))}
                      {txnDataByUserId[id]?.length === 0 && (
                        <li className="text-gray-400">No transactions</li>
                      )}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
