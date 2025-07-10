"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { useTotalStore } from "@/components/ui/store";
import { getUserFullTree } from "@/components/registerUser";
import { useRegister } from "@/components/usehooks/usehook";
import DynamicTable from "@/components/Table";
import { Reward, RewardDistributed } from "@/GraphQuery/query";

export default function DashboardTablePage() {
  const { type } = useParams();
  const { signer } = useRegister();
  const userId = useSelector((state: RootState) => state.user.userId);
  const circleData = useSelector((state: RootState) => state.user.circleData);
  console.log("circleData", circleData);
  const setTotalForType = useTotalStore((state) => state.setTotalForType);

  const receiverUserId = String(userId);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [entriesCount, setEntriesCount] = useState(5);
  const [rewards, setRewards] = useState<RewardDistributed[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  useEffect(() => {
    if (!userId || !circleData) return;

    const loadRewards = async () => {
      let data: Reward[] = [];
      let total = 0;

      if (type === "referral") {
        data = circleData.levels?.[1] || [];
        total = data.length * 11;
      } else if (type === "referral-business") {
        data = circleData.levels?.[1] || [];
        total = data.length * 50;
      } else if (type === "upline-income") {
        data = circleData.uplineRewards || [];
        total = Number(circleData.uplineRewards || 0);
      } else if (type === "super-upline-income") {
        data = circleData.superUplineRewards || [];
        total = Number(circleData.superUplineRewards || 0);
      } else if (type === "total-team") {
        const visited = new Set<number>();
        const levelUserMap = new Map<number, number[]>();

        const buildTree = async (id: number, level: number = 1): Promise<void> => {
          if (visited.has(id)) return;
          visited.add(id);

          if (!levelUserMap.has(level)) levelUserMap.set(level, []);
          levelUserMap.get(level)?.push(id);

          const result = await getUserFullTree(signer as any, id);
          if (result.leftId) await buildTree(result.leftId, level + 1);
          if (result.rightId) await buildTree(result.rightId, level + 1);
        };

        await buildTree(userId as any);

        const idsAtLevel = levelUserMap.get(selectedLevel) || [];
        const allRewards = circleData.allRewards || [];
        data = Array.isArray(allRewards)
          ? allRewards.filter(
            (reward: RewardDistributed) => idsAtLevel.includes(Number(reward.fromUserId))
          )
          : [];

        total = data.reduce((sum, r) => sum + Number(r.amount), 0);
      }

      setRewards(data as any);
      setTotalAmount(total);
      setTotalForType(type as string, total);
    };

    loadRewards();
  }, [type, userId, selectedLevel, circleData, signer]);

  const getTableColumns = () => {
    return [
      { label: "User Id", accessor: "userId" },
      ...(type === "referral" || type === "referral-business"
        ? [{ label: "Sponsor ID", accessor: "referralId" }]
        : []),
      { label: "Join Date & Time", accessor: "joinDateTime" },
      { label: "Amount", accessor: "amount" },
      { label: "Transaction Hash", accessor: "txn" },
      {label: "TopUp Amount", accessor: "isLock"}
    ];
  };

   console.log("isLocked", rewards)
  const formattedData = rewards.map((reward) => ({
    userId: reward.fromUserId,
    ...(type === "referral" || type === "referral-business"
      ? { referralId: reward.receiverUserId }
      : {}),
    blockTimestamp: reward.blockTimestamp,
    joinDateTime: new Date(Number(reward.blockTimestamp) * 1000).toLocaleString(),
    amount:
      type === "referral"
        ? "$11"
        : type === "referral-business"
          ? "$50"
          : type === "upline-income" || type === "super-upline-income"
            ? "$10"
            : `$${reward.amount}`,
    txn: {
      label: `${reward.transactionHash.slice(0, 8)}...${reward.transactionHash.slice(-8)}`,
      href: `https://testnet.bscscan.com/tx/${reward.transactionHash}`,
    },
      isLock: reward.isLock?"Locked":""
  }));

  const tableConfigs: Record<string, { title: string; circle: string }> = {
    referral: { title: "Sponsor Reward", circle: "" },
    "referral-business": { title: "Sponsorer Business", circle: "" },
    "upline-income": { title: "Upline Reward", circle: "" },
    "super-upline-income": { title: "Super Upline Reward", circle: "" },
    "total-team": { title: "Total Team", circle: "" },
  };

  const config = tableConfigs[type as string];
  if (!config) {
    return (
      <div className="text-white p-4">
        Invalid table type: <strong>{type}</strong>
      </div>
    );
  }

  const showLevelSelector = [
    "total-team",
    "direct-income",
    "team-business",
    "level-income",
    "total-income",
  ].includes(type as string);

  const showEntriesSelector = [
    "referral",
    "total-team",
    "upline-income",
    "team-business",
    "direct-income",
    "referral-business",
    "super-upline-income",
    "level-income",
    "total-income",
  ].includes(type as string);

  return (
    <div className="bg-black min-h-screen flex justify-center">
      
      <div className="w-full max-w-6xl md:p-4 p-1">
        <DynamicTable
          title={config.title}
          circle={config.circle}
          columns={getTableColumns()}
          data={[...formattedData.sort((a, b) => Number(b.blockTimestamp) - Number(a.blockTimestamp))].slice(0, entriesCount)}
          showLevelSelector={showLevelSelector}
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          showEntriesSelector={showEntriesSelector}
          entriesCount={entriesCount}
          onEntriesChange={setEntriesCount}
          isCurrentCircle={type === "current-circle"}
          //@ts-ignore
        totalAmount={totalAmount}
        />
      </div>
    </div>
  );
}
