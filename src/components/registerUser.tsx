import { ethers, Signer } from "ethers";
import T_USDT_ABI from "@/ABI/ERC20-ABI.json";
import POLYCIRCLE_ABI from "@/ABI/polycircle-ABI.json";
import { Contract } from "ethers";
import { formatUnits } from "ethers";

const T_USDT_ADDRESS = "0xa709b84e21bdd371d7bdadF3F61ee36128693450";
// const POLYCIRCLE_ADDRESS = "0xD0882421fE955323f709ceef998F8BF43e845a61";
// const POLYCIRCLE_ADDRESS = "0x956C9fed19be60cDB5E805298049686486879616"; 
// const POLYCIRCLE_ADDRESS = "0x9c78386Ea1f2Fd4D37D8cfe927C6B7c67E7fcf67";
// const POLYCIRCLE_ADDRESS = "0x7f096fA1B44bdfFb1Ca9Cc8b8B2788845a7292c6"
// const POLYCIRCLE_ADDRESS = "0xe07787a202b46c13EBb6a25a8fA05862449F6Ca2";
// const POLYCIRCLE_ADDRESS = "0x98fBf2626E0647c02eC63D8a63F140D357a305EA";
// const POLYCIRCLE_ADDRESS = "0x98fBf2626E0647c02eC63D8a63F140D357a305EA"
// const POLYCIRCLE_ADDRESS = "0x22A2AD4d7af66923502c9B2B01d22b5984Aa00e7"
// const POLYCIRCLE_ADDRESS = "0xCBA4f36fCe5703234136637e95559cD620b26384";
// const POLYCIRCLE_ADDRESS = "0x4Cf09CFb88e2d0687f79b99C74c277b1c9C671E9";
// const POLYCIRCLE_ADDRESS = "0x3032E3B268607abf12BF41260c5C76293cf3823f";
// const POLYCIRCLE_ADDRESS = "0xC5d4B2c109804C7BfF6dB53A3879C0B04159C4e3"
// const POLYCIRCLE_ADDRESS = "0xE8F86eAE014e044F666294F3c838160B2A31a818"
// const POLYCIRCLE_ADDRESS = "0xD78D3c57d47a70F13a084DBaf0B8047D304f2A45"
const POLYCIRCLE_ADDRESS = "0x04B8e9bA8597e1eD44e49B163226b07564F3c05b"

//for registration, we need to approve the USDT contract to spend our USDT tokens
// and then call the register function on the PolyCircle contract with the referrer ID
export async function registerUser({
  referrer,
  signer,
}: {
  referrer: number;
  signer: Signer;
}): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("Getting user address...");
    const userAddress = await signer.getAddress();
    console.log(`User address: ${userAddress}`);

    console.log("Connecting to USDT contract...");
    const tUsdtContract = new ethers.Contract(T_USDT_ADDRESS, T_USDT_ABI, signer);
    console.log("USDT contract connected.");

    console.log("Connecting to PolyCircle contract...");
    const polycircleContract = new ethers.Contract(POLYCIRCLE_ADDRESS, POLYCIRCLE_ABI, signer);
    console.log("PolyCircle contract connected.");

    console.log("Checking USDT allowance...");
    const allowance = await tUsdtContract.allowance(userAddress, POLYCIRCLE_ADDRESS);
    console.log(`Current allowance: ${allowance.toString()}`);

    const amountToApprove = ethers.parseUnits("50", 6); // 50 USDT with 6 decimals
    console.log(`Required allowance (50 USDT): ${amountToApprove.toString()}`);

    if (allowance < amountToApprove) {
      console.log("Insufficient allowance, sending approve transaction...");
      const approveTx = await tUsdtContract.approve(POLYCIRCLE_ADDRESS, amountToApprove);
      console.log(`Approval tx sent: ${approveTx.hash}`);

      console.log("Waiting for approval confirmation...");
      await approveTx.wait();
      console.log("Approval confirmed.");
    } else {
      console.log("Sufficient allowance, skipping approval.");
    }

    console.log(`Sending register transaction with referrer ID: ${referrer}...`);
    const registerTx = await polycircleContract.register(referrer);
    console.log(`Register tx sent: ${registerTx.hash}`);

    console.log("Waiting for registration confirmation...");
    await registerTx.wait();
    console.log(`Registration successful with referrer ID: ${referrer}`);

    return { success: true };
  } catch (error: any) {
    console.error("registerUser error:", error);
    return {
      success: false,
      error: error.reason || error.message || "Unknown error",
    };
  }
}

export async function checkRegistrationStatus(signer: Signer): Promise<{
  exists: boolean;
  userId: number;
  error?: string;
}> {
  try {
    const userAddress = await signer.getAddress();
    const contract = new ethers.Contract(POLYCIRCLE_ADDRESS, POLYCIRCLE_ABI, signer);
    console.log("Getting userId for address:", userAddress);
    const [exists, userId] = await contract.getUserExistsAndId(userAddress);
    console.log("User exists:", exists, "User ID:", userId);
    return {
      exists,
      userId: Number(userId),
    };
  } catch (error: any) {
    return {
      exists: false,
      userId: 0,
      error: error.reason || error.message || "Unknown error",
    };
  }
}

export async function getUserDetails(
  signer: ethers.Signer,
  userId: number
): Promise<{
  id: number;
  referrerId: number;
  parentId: number;
  leftId: number;
  rightId: number;
  exists: boolean;
  totalEarnings: string;
  userAddress: string;
  error?: string;
}> {
  try {
    const contract = new ethers.Contract(POLYCIRCLE_ADDRESS, POLYCIRCLE_ABI, signer);

    console.log("Calling getUserDetails with userId:", userId);

    const details = await contract.getUserDetails(userId);

    console.log("Received user details:", details);

    return {
      id: Number(details.id),
      referrerId: Number(details.referrerId),
      parentId: Number(details.parentId),
      leftId: Number(details.leftId),
      rightId: Number(details.rightId),
      exists: details.exists,
      totalEarnings: details.totalEarnings.toString(),
      userAddress: details.userAddress,
    };
  } catch (error: any) {
    console.error("getUserDetails error:", error);
    return {
      id: 0,
      referrerId: 0,
      parentId: 0,
      leftId: 0,
      rightId: 0,
      exists: false,
      totalEarnings: "0",
      userAddress: "",
      error: error.reason || error.message || "Unknown error",
    };
  }
}

//getUserFullTree retrieves the full tree structure for a user
export async function getUserFullTree(
  signer: ethers.Signer,
  userId: number
): Promise<{
  userId: number;
  leftId: number;
  rightId: number;
  leftLeftId: number;
  leftRightId: number;
  rightLeftId: number;
  rightRightId: number;
  error?: string;
}> {
  try {
    const contract = new ethers.Contract(POLYCIRCLE_ADDRESS, POLYCIRCLE_ABI, signer);

    const result = await contract.getUserFullTree(userId);
    console.log("getUserFullTree result:", result);

    return {
      userId: Number(result.userId),
      leftId: Number(result.leftId),
      rightId: Number(result.rightId),
      leftLeftId: Number(result.leftLeftId),
      leftRightId: Number(result.leftRightId),
      rightLeftId: Number(result.rightLeftId),
      rightRightId: Number(result.rightRightId),
    };
  } catch (error: any) {
    console.error("getUserFullTree error:", error);
    return {
      userId: 0,
      leftId: 0,
      rightId: 0,
      leftLeftId: 0,
      leftRightId: 0,
      rightLeftId: 0,
      rightRightId: 0,
      error: error.reason || error.message || "Unknown error",
    };
  }
}

export async function getDirectReferrals(
  signer: ethers.Signer,
  userId: number
): Promise<{ referrals: number[]; error?: string }> {
  try {
    const contract = new ethers.Contract(POLYCIRCLE_ADDRESS, POLYCIRCLE_ABI, signer);

    console.log("Calling getDirectReferrals with userId:", userId);
    const referrals: bigint[] = await contract.getDirectReferrals(userId);
    const referralIds = referrals.map((id) => Number(id));
    console.log("Direct Referrals:", referralIds);

    return {
      referrals: referralIds,
    };
  } catch (error: any) {
    console.error("getDirectReferrals error:", error);
    return {
      referrals: [],
      error: error.reason || error.message || "Unknown error",
    };
  }
}

// getChildIds retrieves the child IDs for a given user ID
export async function getChildId(
  signer: ethers.Signer | null | undefined,
  userId: number
): Promise<{ childIds: number[]; error?: string }> {
  try {
    if (!signer) {
      throw new Error("No signer provided.");
    }

    const provider = signer.provider;

    if (!provider) {
      throw new Error("Signer is not connected to a provider.");
    }

    const contract = new ethers.Contract(POLYCIRCLE_ADDRESS, POLYCIRCLE_ABI, provider);

    console.log("Calling getChildIds with userId:", userId);
    const childIdBigInts: bigint[] = await contract.getChildIds(userId);
    const childIds = childIdBigInts.map((id) => Number(id));
    console.log("Child IDs:", childIds);

    return {
      childIds,
    };
  } catch (error: any) {
    console.error("getChildIds error:", error);
    return {
      childIds: [],
      error: error.reason || error.message || "Unknown error",
    };
  }
}



export async function getFormattedId(
  signer: ethers.Signer,
  userId: number
): Promise<{ formattedId: string; error?: string }> {
  try {
    const contract = new ethers.Contract(POLYCIRCLE_ADDRESS, POLYCIRCLE_ABI, signer);
    const formattedId: string = await contract.getFormattedId(userId);
    return { formattedId };
  } catch (error: any) {
    return {
      formattedId: "",
      error: error.reason || error.message || "Failed to fetch formatted ID.",
    };
  }
}

export async function getTotalEarningWithChildren(
  signer: any,
  userAddress: number
): Promise<{ totalEarning: string; error?: string }> {
  try {
    const contract = new Contract(POLYCIRCLE_ADDRESS, POLYCIRCLE_ABI, signer);
    const earning = await contract.getTotalGrossEarning(userAddress);
    const totalEarning = formatUnits(earning, 6);
    return { totalEarning };
  } catch (error: any) {
    return {
      totalEarning: "",
      error: error.reason || error.message || "Failed to fetch total earning with children.",
    };
  }
}

export async function getLockTopUp(
  signer: any,
  userAddress: string
): Promise<{ lockedAmount: string; error?: string }> {
  try {
    const contract = new Contract(POLYCIRCLE_ADDRESS, POLYCIRCLE_ABI, signer);
    const amount = await contract.getLockedAmount(userAddress);
    const lockedAmount = formatUnits(amount, 6);
    return { lockedAmount };
  } catch (error: any) {
    return {
      lockedAmount: "",
      error: error.reason || error.message || "Failed to fetch lock top-up amount.",
    };
  }
}

export async function getAddressById(
  signer: any,
  userId: number
): Promise<{ userAddress: string; error?: string }> {
  try {
    const contract = new Contract(POLYCIRCLE_ADDRESS, POLYCIRCLE_ABI, signer);
    const userAddress: string = await contract.getAddressById(userId);
    return { userAddress };
  } catch (error: any) {
    return {
      userAddress: "",
      error: error.reason || error.message || "Failed to fetch user address by ID.",
    };
  }
}

export type UserStruct = {
  id: string;
  referrerId: string;
  leftId: string;
  rightId: string;
  parentId: string;
  exists: boolean;
  totalEarnings: string;
  userAddress: string;
  mainId: string;
  netTotalEarning: string;
  grossEarning: string;
  netLockedAmount: string;
  grossLockedAmount: string;
};

export async function getUserDetailsById(
  signer: any,
  userId: number
): Promise<{ user: UserStruct | null; error?: string }> {
  try {
    const contract = new Contract(POLYCIRCLE_ADDRESS, POLYCIRCLE_ABI, signer);
    const result = await contract.users(userId);

    const user: UserStruct = {
      id: result.id.toString(),
      referrerId: result.referrerId.toString(),
      leftId: result.leftId.toString(),
      rightId: result.rightId.toString(),
      parentId: result.parentId.toString(),
      exists: result.exists,
      totalEarnings: result.totalEarnings.toString(),
      userAddress: result.userAddress,
      mainId: result.mainId.toString(),
      netTotalEarning: result.netTotalEarning.toString(),
      grossEarning: result.grossEarning.toString(),
      netLockedAmount: result.netLockedAmount.toString(),
      grossLockedAmount: result.grossLockedAmount.toString(),
    };

    return { user };
  } catch (error: any) {
    return {
      user: null,
      error: error.reason || error.message || "Failed to fetch user details.",
    };
  }
}


export type RewardRecord = {
  timestamp: string;
  amount: string;
  rewardType: string;
  fromId: string;
  level: string;
};

export async function getRewardHistoryByUserId(
  signer: any,
  userId: number
): Promise<{ rewards: RewardRecord[] | null; error?: string }> {
  try {
    const contract = new Contract(POLYCIRCLE_ADDRESS, POLYCIRCLE_ABI, signer);
    const rewardHistory = await contract.getRewardHistory(userId);

    const rewards: RewardRecord[] = rewardHistory.map((reward: any) => ({
      timestamp: reward.timestamp.toString(),
      amount: reward.amount.toString(),
      rewardType: reward.rewardType,
      fromId: reward.fromId.toString(),
      level: reward.level.toString(),
    }));

    return { rewards };
  } catch (error: any) {
    return {
      rewards: null,
      error: error.reason || error.message || "Failed to fetch reward history.",
    };
  }
}