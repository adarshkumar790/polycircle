"use client";

import { useEffect, useState } from "react";
import { getUserFullTree } from "@/components/registerUser";
import { useRegister } from "@/components/usehooks/usehook";

// Define the return type of getUserFullTree
type UserTree = {
  userId: number;
  leftId: number;
  rightId: number;
  leftLeftId: number;
  leftRightId: number;
  rightLeftId: number;
  rightRightId: number;
  error?: string;
};

export default function UserTreeDisplay() {
  const { signer } = useRegister(); // Wallet signer
  const userId = 1; // Static user ID

  const [treeData, setTreeData] = useState<UserTree | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTree = async () => {
      if (!signer) return;

      const result = await getUserFullTree(signer, userId);

      if (result.error) {
        setError(result.error);
        setTreeData(null);
      } else {
        setTreeData(result);
        setError(null);
      }
    };

    fetchTree();
  }, [signer, userId]);

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!treeData) {
    return <div className="text-white p-4">Loading tree data...</div>;
  }

  return (
    <div className="bg-gray-900 text-white p-6 rounded-md shadow-md max-w-2xl mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4 text-center">User Binary Tree</h2>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <strong>Root User ID:</strong> {treeData.userId}
        </div>
        <div className="ml-4">
          <strong>Left ID:</strong> {treeData.leftId} <br />
          <strong>Right ID:</strong> {treeData.rightId}
        </div>
        <div className="ml-8">
          <strong>Left → Left ID:</strong> {treeData.leftLeftId} <br />
          <strong>Left → Right ID:</strong> {treeData.leftRightId}
        </div>
        <div className="ml-8">
          <strong>Right → Left ID:</strong> {treeData.rightLeftId} <br />
          <strong>Right → Right ID:</strong> {treeData.rightRightId}
        </div>
      </div>
    </div>
  );
}
