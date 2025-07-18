import { ethers, Signer, toBigInt } from "ethers";
import T_USDT_ABI from "@/ABI/ERC20-ABI.json";
import POLYCIRCLE_ABI from "@/ABI/polycircle-ABI.json";
import { Contract } from "ethers";
import { formatUnits } from "ethers";

const T_USDT_ADDRESS = "0xa709b84e21bdd371d7bdadF3F61ee36128693450";

// const POLYCIRCLE_ADDRESS = "0xC5d4B2c109804C7BfF6dB53A3879C0B04159C4e3"
// const POLYCIRCLE_ADDRESS = "0xE8F86eAE014e044F666294F3c838160B2A31a818"
// const POLYCIRCLE_ADDRESS = "0xD78D3c57d47a70F13a084DBaf0B8047D304f2A45"
// const POLYCIRCLE_ADDRESS = "0x5EB74AB18170F17e1f230df9B243d36652605CF6"
// const POLYCIRCLE_ADDRESS = "0x980772c3EcA05d7D5D94D39e7c90383A4998c963";
// const POLYCIRCLE_ADDRESS = "0xEdA1C181B8A88e5bFeEAffeeb91446e08acbe4E0";
// const POLYCIRCLE_ADDRESS = "0xC901A6f3600e260ef80e5a7D50e2A08A86274ed6";
// const POLYCIRCLE_ADDRESS = "0x19Af3Fb1526C33cbc1C18081e86F2F7f79b4AfFd";
// const POLYCIRCLE_ADDRESS = "0xF0Caab4Edde89d9CECB13bD8B83748844D6F912B";
// const POLYCIRCLE_ADDRESS = "0x054762Bd334248dD11bc302F2cFB0f353a0249F0";
// const POLYCIRCLE_ADDRESS = "0x280Cd3aE2D98d86FAb90638CF439d9892C342BEc"
// const POLYCIRCLE_ADDRESS = "0x280Cd3aE2D98d86FAb90638CF439d9892C342BEc";
// const POLYCIRCLE_ADDRESS = "0x2a177e3Cf86Bd313d46808dE68554Ac2A3FeEFaF";
// const POLYCIRCLE_ADDRESS = "0x371074f33275DBA9Dd11b45994E7Ed78442bb30F";
// const POLYCIRCLE_ADDRESS = "0x428BA15E4FBa617210f727Df04002478539069d8";
// const POLYCIRCLE_ADDRESS = "0x83c603e7b7bE0B40AcB8E1Cae7B0c19ABF916D06";
// const POLYCIRCLE_ADDRESS = "0x8615240C370dBDd657711B35cfCBc48BdD955F1b";
// const POLYCIRCLE_ADDRESS = "0x1Ed249d2959c6c2b96FFBEcD7Ab74Cbfe83170D2";
// const POLYCIRCLE_ADDRESS = "0x7b98c0323553db6EF9402AD30672bF387B7Ea7FF";
// const POLYCIRCLE_ADDRESS = "0xCBec72ebDA3f57601C35Dd663F220ee79e0a799A";
// const POLYCIRCLE_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
// const POLYCIRCLE_ADDRESS = "0xD21455CCbb1550f284d3bA999993B1eaA3Bb3371";
// const POLYCIRCLE_ADDRESS = "0x6F8c38cf27567ab55d1924F2766182CbF7B67237";
// const POLYCIRCLE_ADDRESS = "0x01cf58e264d7578D4C67022c58A24CbC4C4a304E";
// const POLYCIRCLE_ADDRESS = "0x88F4B0Afb4f3a1eF351F144665dd5437AC02F13a";
// const POLYCIRCLE_ADDRESS = "0x7339F709c5294D483cf806402a740e77a2087cf6";
// const POLYCIRCLE_ADDRESS = "0x72a292D79c706299daaDC14F1F605298523Ce382";
const POLYCIRCLE_ADDRESS = "0x0209727cd80dB13723773ACA6cD1905FCDFDC035";



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

    const details = await contract.getUserDetailsByUserId(userId);

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

    const result = await contract?.getUserFullTree(userId);
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

// getchildUserIds retrieves the child IDs for a given user ID
export async function getchildUserId(
  signer: ethers.Signer | null | undefined,
  userId: number
): Promise<{ childUserIds: number[]; error?: string }> {
  try {
    if (!signer) {
      throw new Error("No signer provided.");
    }

    const provider = signer.provider;

    if (!provider) {
      throw new Error("Signer is not connected to a provider.");
    }

    const contract = new ethers.Contract(POLYCIRCLE_ADDRESS, POLYCIRCLE_ABI, provider);

    console.log("Calling getchildUserIds with userId:", userId);
    const childUserIdBigInts: bigint[] = await contract.getchildUserIds(userId);
    const childUserIds = childUserIdBigInts.map((id) => Number(id));
    console.log("Child IDs:", childUserIds);

    return {
      childUserIds,
    };
  } catch (error: any) {
    console.error("getchildUserIds error:", error);
    return {
      childUserIds: [],
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

// export async function getFormattedId(
//   signer: any, 
//   userId: number
// ): Promise<{ formattedId: string; error?: string }> {
//   try {
//     const contract = new Contract(POLYCIRCLE_ADDRESS, POLYCIRCLE_ABI, signer);

//     const bnUserId = toBigInt(userId);

//     // Get internal ID
//     const internalId = await contract.userIdToId(bnUserId);

//     // Get user details
//     const user = await contract.users(internalId);

//     if (!user.exists) {
//       throw new Error("User not found");
//     }

//     if (user.mainId === 0) {
//       return { formattedId: bnUserId.toString() };
//     }

//     const mainUser = await contract.users(user.mainId);
//     const childIds: bigint[] = mainUser.childIds;

//     for (let i = 0; i < childIds.length; i++) {
//       if (childIds[i] === internalId) {
//         const formatted = `${mainUser.userId.toString()}/${i + 1}`;
//         return { formattedId: formatted };
//       }
//     }

//     throw new Error("Child ID not found in parent's childIds array");
//   } catch (error: any) {
//     console.error("Error in getFormattedId:", error.message);
//     return {
//       formattedId: "",
//       error: error.reason || error.message || "Failed to fetch formatted ID.",
//     };
//   }
// }

export async function getTotalEarningWithChildren(
  signer: any,
  userAddress: number
): Promise<{ totalEarning: string; error?: string }> {
  try {
    const contract = new Contract(POLYCIRCLE_ADDRESS, POLYCIRCLE_ABI, signer);
    const earning = await contract.getTotalGrossEarning(userAddress);
    console.log("Total earning with children:", earning.toString());
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
    const userAddress: string = await contract.getAddressByUserId(userId);
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
  mainUserId: string;
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
      mainUserId: result.mainUserId.toString(),
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
  fromUserId: string;
  level: string;
  transactionHash:string;
  refrellId:string
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
      fromUserId: reward.fromUserId.toString(),
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

export async function getPendingRebirths(
  signer: any
): Promise<{ rebirths: string[] | null; error?: string }> {
  try {
    const contract = new Contract(POLYCIRCLE_ADDRESS, POLYCIRCLE_ABI, signer);
    const rebirths: bigint[] = await contract.getPendingRebirths();
 
   
    const formatted = rebirths.map((r) => r.toString());

    return { rebirths: formatted };
  } catch (error: any) {
    return {
      rebirths: null,
      error: error.reason || error.message || 'Failed to fetch pending rebirths.',
    };
  }
}

export async function getUserIdCounter(
  signer: any
): Promise<{ count: string | null; error?: string }> {
  try {
    const contract = new Contract(POLYCIRCLE_ADDRESS, POLYCIRCLE_ABI, signer);
    const counter: bigint = await contract._userIdCounter();
    
    return { count: counter.toString() };
  } catch (error: any) {
    return {
      count: null,
      error: error.reason || error.message || 'Failed to fetch user ID counter.',
    };
  }
}