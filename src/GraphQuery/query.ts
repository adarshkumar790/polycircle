import axios from 'axios';

const GRAPH_API_URL = "https://api.studio.thegraph.com/query/112968/polycricle/version/latest";

const ENDPOINTS = [
  "https://api.studio.thegraph.com/query/112968/polycricle/version/latest",
];


export async function fetchFromGraph(query: string, variables?: any): Promise<any> {
  for (let i = 0; i < ENDPOINTS.length; i++) {
    try {
      const response = await fetch(ENDPOINTS[i], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });
      if (!response.ok) throw new Error(`Graph endpoint failed: ${response.status}`);
      const result = await response.json();

      // GraphQL error but endpoint is valid
      if (result.errors) {
        throw new Error(`GraphQL error: ${JSON.stringify(result.errors)}`);
      }

      return result.data;
    } catch (err) {
      console.warn(`Endpoint ${ENDPOINTS[i]} failed. Trying next...`, err);
    }
  }

  throw new Error("All GraphQL endpoints failed");
}



// const REWARD_DISTRIBUTED_QUERY = `
//   query MyQuery($receiverUserId: String!) {
//     rewardDistributeds(
//       orderBy: fromUserId
//       where: { receiverUserId: $receiverUserId, rewardType_in: ["DIRECT", "DIRECT_REBIRTH"] }
//     ) {
//       blockTimestamp
//       receiverUserId
//       rewardType
//       transactionHash
//       fromUserId
//       amount
//       grossAmount
//     }
//   }
// `;

// const UPLINE_REWARD_DISTRIBUTED_QUERY = `
//   query MyQuery($receiverUserId: String!) {
//     rewardDistributeds(
//       where: { 
//         receiverUserId: $receiverUserId, 
//         rewardType_in: ["UPLINE", "UPLINE_REBIRTH"]
//       }
//       orderBy: fromUserId
//       orderDirection: asc
//     ) {
//       blockTimestamp
//       receiverUserId
//       rewardType
//       transactionHash
//       fromUserId
//       amount
//       grossAmount
//     }
//   }
// `;

// const SUPER_UPLINE_REWARD_DISTRIBUTED_QUERY = `
//   query MyQuery($receiverUserId: String!) {
//     rewardDistributeds(
//       where: { 
//         receiverUserId: $receiverUserId, 
//         rewardType_in: ["SUPER_UPLINE", "SUPER_UPLINE_REBIRTH"] 
//       }
//       orderBy: fromUserId
//       orderDirection: asc
//     ) {
//       blockTimestamp
//       receiverUserId
//       rewardType
//       transactionHash
//       fromUserId
//       amount
//       grossAmount
//     }
//   }
// `;

export const SUPER_UPLINE_TotalAmount_QUERY = `
  query SuperUplineQuery($receiverUserId: [String!]) {
    rewardDistributeds(
      orderBy: fromUserId
      where: { 
        receiverUserId_in: $receiverUserId, 
        rewardType_in: ["SUPER_UPLINE", "SUPER_UPLINE_REBIRTH"] 
      }
    ) {
      amount
      grossAmount
    }
  }
`;

export const UPLINE_TotalAmount_QUERY = `
  query UplineQuery($receiverUserId: [String!]) {
    rewardDistributeds(
      orderBy: fromUserId
      where: { 
        receiverUserId_in: $receiverUserId, 
        rewardType_in: ["UPLINE", "UPLINE_REBIRTH"]
      }
    ) {
      amount
      grossAmount
    }
  }
`;


// const DirectAmount_QUERY = `
//   query MyQuery($receiverUserId: String!) {
//     rewardDistributeds(
//       orderBy: fromUserId
//             where: { receiverUserId: $receiverUserId, rewardType_in: ["DIRECT", "DIRECT_REBIRTH"] }

//     ) {
//       amount
//       grossAmount
//     }
//   }
// `;

const FROM_USERID_AND_RECEIVER_ID_FETCHTXN_QUERY = `
  query MyQuery($receiverUserId: String!, $fromuserId: String!) {
    rewardDistributeds(
      orderBy: fromUserId
      where: { receiverUserId: $receiverUserId, fromUserId: $fromuserId }
    ) {
      amount
      grossAmount
      transactionHash
      blockTimestamp
    }
  }
`;

const LATEST_CHILD_REBIRTH = `
  query LatestChildRebirth($mainUserId: String!) {
    rebirths(where: { mainUserId: $mainUserId }, orderBy: blockTimestamp) {
      childUserId
    }
  }
`;

export async function fetchAllRewardsAndTeamCount(): Promise<{
  totalReward: number;
  totalTeam: number;
  totalGenerationReward: number;
}> {
  const query = `
    query {
      rewardDistributeds(
        where: {
          rewardType_in: ["DIRECT", "DIRECT_REBIRTH"] 
        }
      ) {
        id
        fromUserId
      }
    }
  `;

  const res = await fetch(GRAPH_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  const { data } = await res.json();
  const rewards = data?.rewardDistributeds || [];
  const uniqueFromUsers = new Set(rewards.map((r: any) => r.fromUserId));
  const totalTeam = uniqueFromUsers.size;

  const totalReward = rewards.length * 50;
  const totalGenerationReward = rewards.length * 50;

  return { totalReward, totalTeam, totalGenerationReward };
}

export interface RewardDistributed {
  blockTimestamp: string;
  receiverUserId: string;
  rewardType: string;
  transactionHash: string;
  fromUserId: string;
  amount?: string;
  grossAmount?: string;
  childUserId?: string;
  isLocked?: string;
  isLock?:boolean;
}

interface GraphResponse {
  data: {
    rewardDistributeds: RewardDistributed[];
  };
}

// export const fetchRewardDistributeds = async (receiverUserId: string): Promise<RewardDistributed[]> => {
//   try {
//     const response = await axios.post<GraphResponse>(GRAPH_API_URL, {
//       query: REWARD_DISTRIBUTED_QUERY,
//       variables: { receiverUserId },
//     });
//     return response.data.data.rewardDistributeds;
//   } catch (error) {
//     console.error('Error fetching DIRECT rewards:', error);
//     return [];
//   }
// };

// export const uplineRewardDistributeds = async (receiverUserId: string): Promise<RewardDistributed[]> => {
//   try {
//     const response = await axios.post<GraphResponse>(GRAPH_API_URL, {
//       query: UPLINE_REWARD_DISTRIBUTED_QUERY,
//       variables: { receiverUserId },
//     });
//     return response.data.data.rewardDistributeds;
//   } catch (error) {
//     console.error('Error fetching UPLINE rewards:', error);
//     return [];
//   }
// };

// export const superUplineRewardDistributeds = async (receiverUserId: string): Promise<RewardDistributed[]> => {
//   try {
//     const response = await axios.post<GraphResponse>(GRAPH_API_URL, {
//       query: SUPER_UPLINE_REWARD_DISTRIBUTED_QUERY,
//       variables: { receiverUserId },
//     });
//     return response.data.data.rewardDistributeds;
//   } catch (error) {
//     console.error('Error fetching SUPER UPLINE rewards:', error);
//     return [];
//   }
// };

// export const superUplineToalAmount = async (
//   receiverUserIds: string | string[]
// ): Promise<RewardDistributed[]> => {
//   try {
//     const response = await axios.post<GraphResponse>(GRAPH_API_URL, {
//       query: SUPER_UPLINE_TotalAmount_QUERY,
//       variables: {
//         receiverUserId: Array.isArray(receiverUserIds) ? receiverUserIds : [receiverUserIds],
//       },
//     });
//     console.log("RESPONSE", response)
//     return response.data.data.rewardDistributeds;
//   } catch (error) {
//     console.error("Error fetching SUPER UPLINE total amount:", error);
//     return [];
//   }
// };

// export const uplineToalAmount = async (
//   receiverUserIds: string | string[]
// ): Promise<RewardDistributed[]> => {
//   try {
//     const response = await axios.post<GraphResponse>(GRAPH_API_URL, {
//       query: UPLINE_TotalAmount_QUERY,
//       variables: {
//         receiverUserId: Array.isArray(receiverUserIds) ? receiverUserIds : [receiverUserIds],
//       },
//     });
//     return response.data.data.rewardDistributeds;
//   } catch (error) {
//     console.error("Error fetching UPLINE total amount:", error);
//     return [];
//   }
// };

// export const DirectAmount = async (receiverUserId: string): Promise<RewardDistributed[]> => {
//   try {
//     const response = await axios.post<GraphResponse>(GRAPH_API_URL, {
//       query: DirectAmount_QUERY,
//       variables: { receiverUserId },
//     });
//     return response.data.data.rewardDistributeds;
//   } catch (error) {
//     console.error('Error fetching DIRECT amount:', error);
//     return [];
//   }
// };

export const FromUserIdANDreceiverUserIdFetchTXNQuery = async (
  receiverUserId: string,
  fromuserId: string
): Promise<RewardDistributed[]> => {
  try {
    const response = await axios.post<GraphResponse>(GRAPH_API_URL, {
      query: FROM_USERID_AND_RECEIVER_ID_FETCHTXN_QUERY,
      variables: { receiverUserId, fromuserId },
    });
    return response.data.data.rewardDistributeds;
  } catch (error) {
    console.error('Error fetching TXN details:', error);
    return [];
  }
 };

interface Rebirth {
  childUserId: string;
}

interface RebirthsGraphResponse {
  data: {
    rebirths: Rebirth[];
  };
}

export const fetchAllChildRebirths = async (mainUserId: string): Promise<string[]> => {
  try {
    const response = await axios.post<RebirthsGraphResponse>(GRAPH_API_URL, {
      query: LATEST_CHILD_REBIRTH,
      variables: { mainUserId },
    });
    // console.log("fetchAllChildRebirths", response)
    const rebirths = response.data.data.rebirths;
    return rebirths.map(rebirth => rebirth.childUserId);
  } catch (error) {
    console.error("Error fetching child rebirths:", error);
    return [];
  }
};

export type Reward = {
  fromUserId: string;
  receiverUserId: string;
  rewardType: string;
  blockTimestamp: string;
  transactionHash: string;
  grossAmount?: string;
  level?: string;
  amount?: number;
  isLock?: boolean;
};

export type LevelData = {
  [level: number]: Reward[];
};

export type LevelDataDetails = {
  level: string;
  levelData: Reward[];
  levelTeamCount: number;
  levelTeamAmount: number;
}


const levelRewards = (_data: any,
  receiverUserIds: string[],
  level: number = 0,
  visited = new Set<string>(),
  levels: LevelData = {}) => {

  if (receiverUserIds.length === 0 || level >= 10) return levels;



  const data = [..._data.filter((x: any) => receiverUserIds.includes(x.receiverUserId.toString()) && ["DIRECT", "DIRECT_REBIRTH"].includes(x.rewardType))];
  // console.log("levelRewards rewardtype", [..._data.filter((x: any) => ["DIRECT", "DIRECT_REBIRTH"].includes(x.rewardType))])
  // //console.log("levelRewards rewardtype", [..._data.filter((x: any) => ["1"].includes(x.receiverUserId.toString()) && x.fromUserId === "3"]))
  // console.log("levelRewards receiverUserId", _data.filter((x: any) => receiverUserIds.includes(x.receiverUserId.toString())))
  // console.log("levelRewards", receiverUserIds, data)
  const rewards = (data || []).map((r: any) => ({
    fromUserId: r.fromUserId,
    receiverUserId: r.receiverUserId,
    rewardType: r.rewardType,
    blockTimestamp: r.blockTimestamp,
    transactionHash: r.transactionHash,
    grossAmount: r.grossAmount,
    isLock: r.isLock
  }));

  levels[level] = rewards;
  const nextreceiverUserIds = rewards.map((r: any) => r.fromUserId.toString());
  nextreceiverUserIds.forEach((id: any) => visited.add(id));
  return levelRewards(data, nextreceiverUserIds, level + 1, visited, levels);

  
}

export async function fetchLevelRewards(
  receiverUserIds: string[],
  level: number = 0,
  visited = new Set<string>(),
  levels: LevelData = {}
): Promise<any> {
  if (receiverUserIds.length === 0 || level >= 10) return levels;
  let mainUserId = receiverUserIds[0];
  // const query = `
  //   query ($receiverUserIds: [String!]) {
  //     rewardDistributeds(
  //       where: {
  //         rewardType_in: ["DIRECT", "DIRECT_REBIRTH"]
  //         receiverUserId_in: $receiverUserIds
  //       }
  //     ) {
  //       fromUserId
  //       receiverUserId
  //       rewardType
  //       blockTimestamp
  //       transactionHash
  //       grossAmount
  //     }
  //   }
  // `;

  // const query = `
  //   query ($receiverUserIds: [String!],$mainUserId: String!) {

  //     rewardDistributeds(
  //       where: {
  //         receiverUserId_in: $receiverUserIds
  //       }
  //     ) {
  //       fromUserId
  //       receiverUserId
  //       rewardType
  //       blockTimestamp
  //       transactionHash
  //       grossAmount
  //     }
  //     rebirths(
  //       where:{
  //         mainUserId: $mainUserId
  //       }
  //     ){
  //         mainUserId,
  //         childUserId
  //     }
  //   }
  // `;

  // const query = `
  //   query ($receiverUserIds: [String!],$mainUserId: String!) {

  //     rewardDistributeds(
  //       where:{
  //         receiverUserId_in: $receiverUserIds
  //       }
  //     ) {
  //       fromUserId
  //       receiverUserId
  //       rewardType
  //       blockTimestamp
  //       transactionHash
  //       grossAmount
  //       level
  //     }
  //     rebirths(
  //       where:{
  //         mainUserId: $mainUserId
  //       }
  //     ){
  //         mainUserId,
  //         childUserId
  //     }
  //   }
  // `;

  const query = `query ($receiverUserIds: [String!], $mainUserId: String!) {
      
    rewardDistributeds(
      where:{
        receiverUserId_in: $receiverUserIds
        
      }
    ) {
      fromUserId
      receiverUserId
      rewardType
      blockTimestamp
      transactionHash
      grossAmount
      level
      isLock
    } 
    upline:rewardDistributeds(
      first:1000
      where:{
        rewardType_in:["UPLINE","UPLINE_REBIRTH"]
      }
    ) {
      fromUserId
      receiverUserId
      rewardType
      blockTimestamp
      transactionHash
      grossAmount
      level
      isLock
    } 
    super_upline:rewardDistributeds(
      first:1000
      where:{
        rewardType_in:["SUPER_UPLINE","SUPER_UPLINE_REBIRTH"]
      }
    ) {
      fromUserId
      receiverUserId
      rewardType
      blockTimestamp
      transactionHash
      grossAmount
      level
      isLock
    } 
    rebirths(
      where:{
        mainUserId: $mainUserId
      }
    ){
        mainUserId,
        childUserId,
    }
     
  }`;

 // console.log("query", query, receiverUserIds, mainUserId)
  const res = await fetch(GRAPH_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { receiverUserIds, mainUserId } }),
  });

  const { data } = await res.json();
  console.log("data islock", data)
  return data;
  // const rewards = (data?.rewardDistributeds || []).map((r: any) => ({
  //   fromUserId: r.fromUserId,
  //   receiverUserId: r.receiverUserId,
  //   rewardType: r.rewardType,
  //   blockTimestamp: r.blockTimestamp,
  //   transactionHash: r.transactionHash,
  //   grossAmount: r.grossAmount,
  // }));

  // levels[level] = rewards;
  // const nextreceiverUserIds = rewards.map((r: any) => r.fromUserId);
  // nextreceiverUserIds.forEach((id: any) => visited.add(id));
  // console.log(nextreceiverUserIds)
  // return fetchLevelRewards(nextreceiverUserIds, level + 1, visited, levels);
}
// Constants

// async function fetchUplineData(rootId: string) {
//   const query = `
//     query ($receiverUserId: String!) {
//       rewardDistributeds(where: { receiverUserId: $receiverUserId, rewardType_in: ["DIRECT", "DIRECT_REBIRTH"] }) {
//         fromUserId
//         receiverUserId
//         rewardType
//         blockTimestamp
//         transactionHash
//         amount
//       }
//     }
//   `;
//   const res = await fetch(GRAPH_API_URL, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ query, variables: { receiverUserId: rootId } }),
//   });
//   const { data } = await res.json();

//   const rewards = (data?.rewardDistributeds || []).map((r: any) => ({
//     fromUserId: r.fromUserId,
//     receiverUserId: r.receiverUserId,
//     rewardType: r.rewardType,
//     blockTimestamp: r.blockTimestamp,
//     transactionHash: r.transactionHash,
//     amount: r.amount || "0",
//   }));

//   return rewards;
// }

// async function fetchSuperUplineData(rootId: string) {
//   const query = `
//     query ($receiverUserId: String!) {
//       rewardDistributeds(where: { receiverUserId: $receiverUserId, rewardType_in: ["DIRECT", "DIRECT_REBIRTH"] }) {
//         fromUserId
//         receiverUserId
//         rewardType
//         blockTimestamp
//         transactionHash
//         amount
//       }
//     }
//   `;
//   const res = await fetch(GRAPH_API_URL, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ query, variables: { receiverUserId: rootId } }),
//   });
//   const { data } = await res.json();
//   const rewards = (data?.rewardDistributeds || []).map((r: any) => ({
//     fromUserId: r.fromUserId,
//     receiverUserId: r.receiverUserId,
//     rewardType: r.rewardType,
//     blockTimestamp: r.blockTimestamp,
//     transactionHash: r.transactionHash,
//     amount: r.amount || "0",
//   }));

//   return rewards;
// }

// export type DashboardRewards = {

//   allRewards: number;
//   teamCount: number;
//   teamAmount: number;
//   globalAmount: number;
//   levelData: any[],
//   uplineRewards: any[],
//   superUplineRewards: any[],
//   levels: LevelData,
//   grandTotalAmount: number;
//   uplineAmount: number;
//   superUplineAmount: number;
// }

const LEVEL_REWARD_AMOUNTS: { [level: number]: number } = {
  0: 11,
  1: 2.5,
  2: 1,
  3: 1,
  4: 0.5,
  5: 0.5,
  6: 0.5,
  7: 1,
  8: 1,
  9: 2.5,
};

const UPLINE_REWARD_AMOUNT = 10;
const SUPER_UPLINE_REWARD_AMOUNT = 10;


// Types
export type DashboardRewards = {
  referalTeam: number;
  allRewards: number;
  teamCount: number;
  teamAmount: number;
  globalAmount: number;
  levelData: LevelDataDetails[];
  uplineRewards: any[];
  superUplineRewards: any[];
  levels: LevelData;
  grandTotalAmount: number;
  uplineAmount: number;
  superUplineAmount: number;
};

// UPLINE QUERY (correct reward types)
async function fetchUplineData(receiverUserId: string) {
  const query = `
    query ($receiverUserId: String!) {
      rewardDistributeds(where: {
        receiverUserId: $receiverUserId,
        rewardType_in: ["UPLINE", "UPLINE_REBIRTH"]
      }) {
        fromUserId
        receiverUserId
        rewardType
        blockTimestamp
        transactionHash
        amount
        isLock
      }
    }
  `;
  const res = await fetch(GRAPH_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { receiverUserId } }),
  });

  const { data } = await res.json();
  return (data?.rewardDistributeds || []).map((r: any) => ({
    fromUserId: r.fromUserId,
    receiverUserId: r.receiverUserId,
    rewardType: r.rewardType,
    blockTimestamp: r.blockTimestamp,
    transactionHash: r.transactionHash,
    amount: r.amount || "0",
    isLock: r.isLock
  }));
}

// SUPER UPLINE QUERY (correct reward types)
async function fetchSuperUplineData(receiverUserId: string) {
  const query = `
    query ($receiverUserId: String!) {
      rewardDistributeds(where: {
        receiverUserId: $receiverUserId,
        rewardType_in: ["SUPER_UPLINE", "SUPER_UPLINE_REBIRTH"]
      }) {
        fromUserId
        receiverUserId
        rewardType
        blockTimestamp
        transactionHash
        amount
        isLock
      }
    }
  `;
  const res = await fetch(GRAPH_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { receiverUserId } }),
  });

  const { data } = await res.json();
  return (data?.rewardDistributeds || []).map((r: any) => ({
    fromUserId: r.fromUserId,
    receiverUserId: r.receiverUserId,
    rewardType: r.rewardType,
    blockTimestamp: r.blockTimestamp,
    transactionHash: r.transactionHash,
    amount: r.amount || "0",
  }));
}

// MAIN FUNCTION
export const _getTotalReward = async (
  receiverUserIds: string[],
  level: number = 0,
  visited = new Set<string>(),
  levels: LevelData = {}
): Promise<DashboardRewards> => {
  const data: DashboardRewards = {
    referalTeam: 0,
    allRewards: 0,
    teamCount: 0,
    teamAmount: 0,
    globalAmount: 0,
    levelData: [],
    uplineRewards: [],
    superUplineRewards: [],
    levels: {},
    grandTotalAmount: 0,
    uplineAmount: 0,
    superUplineAmount: 0,
  };

  // Fetch upline rewards for all childUserIds
  // const uplineResults = await Promise.all(receiverUserIds.map(id => fetchUplineData(id)));
  // const superUplineResults = await Promise.all(receiverUserIds.map(id => fetchSuperUplineData(id)));

  // const uplineRewards = uplineResults.flat();
  // const superUplineRewards = superUplineResults.flat();

  // data.uplineRewards = uplineRewards;
  // data.superUplineRewards = superUplineRewards;
  // const uplineRewards = await fetchUplineData(receiverUserIds[0]);
  // console.log("uplineRewards", uplineRewards)
  // data.uplineRewards = uplineRewards;
  // // const superUplineRewards = await fetchSuperUplineData(receiverUserIds[0]);
  // data.superUplineRewards = uplineRewards;

  const _data = {
    "rewardDistributeds": [
      {
        "fromUserId": "23",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS",
        "blockTimestamp": "1749886066",
        "transactionHash": "0x04709abbe94658225252e4fbd130eb1fe3df2b2eaf6d5b3f995c979e15dfa4b2",
        "grossAmount": "2500000",
        "level": "2"
      },
      {
        "fromUserId": "104",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS_REBIRTH",
        "blockTimestamp": "1749886376",
        "transactionHash": "0x051b8f7ce4d395c41520f2ae3dddd96d4d222dceddadf51e1731830f94dd8bd5",
        "grossAmount": "2500000",
        "level": "2"
      },
      {
        "fromUserId": "26",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS",
        "blockTimestamp": "1749886376",
        "transactionHash": "0x051b8f7ce4d395c41520f2ae3dddd96d4d222dceddadf51e1731830f94dd8bd5",
        "grossAmount": "1000000",
        "level": "4"
      },
      {
        "fromUserId": "2",
        "receiverUserId": "1",
        "rewardType": "DIRECT",
        "blockTimestamp": "1749819359",
        "transactionHash": "0x10b58500f573be7a7c404b5e48f4b3381f058ca9fede7cd92062fb0bfcc2d308",
        "grossAmount": "11000000",
        "level": "0"
      },
      {
        "fromUserId": "2",
        "receiverUserId": "1",
        "rewardType": "UPLINE",
        "blockTimestamp": "1749819359",
        "transactionHash": "0x10b58500f573be7a7c404b5e48f4b3381f058ca9fede7cd92062fb0bfcc2d308",
        "grossAmount": "10000000",
        "level": "0"
      },
      {
        "fromUserId": "7",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS",
        "blockTimestamp": "1749819679",
        "transactionHash": "0x23d1dd7e85d17197c999aafe05320e57c89118a8075ffe3c5b88b960465facf2",
        "grossAmount": "1000000",
        "level": "3"
      },
      {
        "fromUserId": "8",
        "receiverUserId": "1",
        "rewardType": "SUPER_UPLINE",
        "blockTimestamp": "1749819743",
        "transactionHash": "0x2a8286b759f715591e904833c47f719eda591733a8d3e4394bfe97bca14a1713",
        "grossAmount": "10000000",
        "level": "0"
      },
      {
        "fromUserId": "8",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS",
        "blockTimestamp": "1749819743",
        "transactionHash": "0x2a8286b759f715591e904833c47f719eda591733a8d3e4394bfe97bca14a1713",
        "grossAmount": "2500000",
        "level": "2"
      },
      {
        "fromUserId": "13",
        "receiverUserId": "1",
        "rewardType": "DIRECT",
        "blockTimestamp": "1749882608",
        "transactionHash": "0x36d571b3bf1cd8de061d034f4cf594543ab21583c220cfce50c746817bf7a1f0",
        "grossAmount": "11000000",
        "level": "0"
      },
      {
        "fromUserId": "10",
        "receiverUserId": "1",
        "rewardType": "DIRECT",
        "blockTimestamp": "1749882302",
        "transactionHash": "0x3f2f73d601ea6b1b59efb6227c982ef66c033c01f626a9e04bf88a0e3c5fc5e4",
        "grossAmount": "11000000",
        "level": "0"
      },
      {
        "fromUserId": "28",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS",
        "blockTimestamp": "1749886561",
        "transactionHash": "0x405247372f8ed80393ca70791f8c4f37d2fec56fb94c5930ce4ff83a041a6b3a",
        "grossAmount": "1000000",
        "level": "4"
      },
      {
        "fromUserId": "15",
        "receiverUserId": "1",
        "rewardType": "DIRECT",
        "blockTimestamp": "1749882731",
        "transactionHash": "0x43704b19bf616f7712191880bb5a593c2ea3f2435b634af52b9ef34a12908815",
        "grossAmount": "11000000",
        "level": "0"
      },
      {
        "fromUserId": "4",
        "receiverUserId": "1",
        "rewardType": "SUPER_UPLINE",
        "blockTimestamp": "1749819493",
        "transactionHash": "0x47f68afee105659a770ab119d8160b9920a7a25855623b51d67e40eff4e125a9",
        "grossAmount": "10000000",
        "level": "0"
      },
      {
        "fromUserId": "4",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS",
        "blockTimestamp": "1749819493",
        "transactionHash": "0x47f68afee105659a770ab119d8160b9920a7a25855623b51d67e40eff4e125a9",
        "grossAmount": "2500000",
        "level": "2"
      },
      {
        "fromUserId": "31",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS",
        "blockTimestamp": "1749886783",
        "transactionHash": "0x490d7826832ed2424d3b77715456e8c3f83e1f07f7ec9635ed813a1eecc4aa3a",
        "grossAmount": "1000000",
        "level": "4"
      },
      {
        "fromUserId": "16",
        "receiverUserId": "1",
        "rewardType": "DIRECT",
        "blockTimestamp": "1749885533",
        "transactionHash": "0x50bca436c5be26b6f4d80221e32df6153e97dfee0158ce03b1d8cf645562ffc2",
        "grossAmount": "11000000",
        "level": "0"
      },
      {
        "fromUserId": "12",
        "receiverUserId": "1",
        "rewardType": "DIRECT",
        "blockTimestamp": "1749882545",
        "transactionHash": "0x51932624e8bd2e4c28c7c0a0a65a2bb58fb142ace77b8c477336b6425addee0d",
        "grossAmount": "11000000",
        "level": "0"
      },
      {
        "fromUserId": "29",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS",
        "blockTimestamp": "1749886655",
        "transactionHash": "0x69610ab3f240dde9b13db4e7cf86c25e5a73574d3afc76419ace9bc7237e6397",
        "grossAmount": "1000000",
        "level": "4"
      },
      {
        "fromUserId": "102",
        "receiverUserId": "1",
        "rewardType": "DIRECT_REBIRTH",
        "blockTimestamp": "1749885681",
        "transactionHash": "0x72794c8b784e4bdc69e8da1f38cedd6f6b5bb7153bd78fa9409d4708ef69208c",
        "grossAmount": "11000000",
        "level": "0"
      },
      {
        "fromUserId": "18",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS",
        "blockTimestamp": "1749885681",
        "transactionHash": "0x72794c8b784e4bdc69e8da1f38cedd6f6b5bb7153bd78fa9409d4708ef69208c",
        "grossAmount": "2500000",
        "level": "2"
      },
      {
        "fromUserId": "20",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS",
        "blockTimestamp": "1749885814",
        "transactionHash": "0x8a7c101f5d2e11887b8897435aa279898067cddd3756f61fc103698e4fde6068",
        "grossAmount": "2500000",
        "level": "2"
      },
      {
        "fromUserId": "32",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS",
        "blockTimestamp": "1749886858",
        "transactionHash": "0x8d8ef9ceabd96cccd74072c5c34eed0ff0deac8f68eb631d91096c95038441d3",
        "grossAmount": "1000000",
        "level": "4"
      },
      {
        "fromUserId": "3",
        "receiverUserId": "1",
        "rewardType": "DIRECT",
        "blockTimestamp": "1749819458",
        "transactionHash": "0x972ca1fa9cb2c7a162a69046fdba9ff5d79fee576ca8ee23a8baaa7fe5f53bfe",
        "grossAmount": "11000000",
        "level": "0"
      },
      {
        "fromUserId": "3",
        "receiverUserId": "1",
        "rewardType": "UPLINE",
        "blockTimestamp": "1749819458",
        "transactionHash": "0x972ca1fa9cb2c7a162a69046fdba9ff5d79fee576ca8ee23a8baaa7fe5f53bfe",
        "grossAmount": "10000000",
        "level": "0"
      },
      {
        "fromUserId": "17",
        "receiverUserId": "1",
        "rewardType": "DIRECT",
        "blockTimestamp": "1749885597",
        "transactionHash": "0x9a19e90449262be76e1baffa3b5d853baa87c05dd035c08e300d7816143ac674",
        "grossAmount": "11000000",
        "level": "0"
      },
      {
        "fromUserId": "6",
        "receiverUserId": "1",
        "rewardType": "SUPER_UPLINE",
        "blockTimestamp": "1749819607",
        "transactionHash": "0x9b2a927f5bb1e673e7806d253be8be58ce107efacabc60ff1d92de338834f4f3",
        "grossAmount": "10000000",
        "level": "0"
      },
      {
        "fromUserId": "6",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS",
        "blockTimestamp": "1749819607",
        "transactionHash": "0x9b2a927f5bb1e673e7806d253be8be58ce107efacabc60ff1d92de338834f4f3",
        "grossAmount": "2500000",
        "level": "2"
      },
      {
        "fromUserId": "22",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS",
        "blockTimestamp": "1749885993",
        "transactionHash": "0xa4294ce477be22c7ab164738b37479b0ac49c0c04641cef6122bf8500f31ef73",
        "grossAmount": "2500000",
        "level": "2"
      },
      {
        "fromUserId": "11",
        "receiverUserId": "1",
        "rewardType": "DIRECT",
        "blockTimestamp": "1749882407",
        "transactionHash": "0xace19eb9cc8c00eba0229f6e047071e25d79b5429d68af34437779c0e726eadf",
        "grossAmount": "11000000",
        "level": "0"
      },
      {
        "fromUserId": "27",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS",
        "blockTimestamp": "1749886505",
        "transactionHash": "0xb0c88e1a2c1367f1335ceee06e2cdf02a817019e1a19102acd94f5685cada79d",
        "grossAmount": "1000000",
        "level": "4"
      },
      {
        "fromUserId": "33",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS",
        "blockTimestamp": "1749886915",
        "transactionHash": "0xc9383cd167599105244d8fd9d8f882d93d9596f95645591ae556af44df751a0f",
        "grossAmount": "1000000",
        "level": "4"
      },
      {
        "fromUserId": "9",
        "receiverUserId": "1",
        "rewardType": "DIRECT",
        "blockTimestamp": "1749882237",
        "transactionHash": "0xd61f06912823c5b71905ba44c872a1c6a01bc847627f6d449a2c0747fd82f897",
        "grossAmount": "11000000",
        "level": "0"
      },
      {
        "fromUserId": "103",
        "receiverUserId": "1",
        "rewardType": "DIRECT_REBIRTH",
        "blockTimestamp": "1749886122",
        "transactionHash": "0xd962723c9206ca4fa5c241870b2ed747190f01b21154c4603deec5dce485cad9",
        "grossAmount": "11000000",
        "level": "0"
      },
      {
        "fromUserId": "24",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS",
        "blockTimestamp": "1749886122",
        "transactionHash": "0xd962723c9206ca4fa5c241870b2ed747190f01b21154c4603deec5dce485cad9",
        "grossAmount": "2500000",
        "level": "2"
      },
      {
        "fromUserId": "5",
        "receiverUserId": "1",
        "rewardType": "SUPER_UPLINE",
        "blockTimestamp": "1749819542",
        "transactionHash": "0xe107a1905f1dba16aa57ff532552540e95289be25467f0d0bdf5cb649a72d1a0",
        "grossAmount": "10000000",
        "level": "0"
      },
      {
        "fromUserId": "5",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS",
        "blockTimestamp": "1749819542",
        "transactionHash": "0xe107a1905f1dba16aa57ff532552540e95289be25467f0d0bdf5cb649a72d1a0",
        "grossAmount": "2500000",
        "level": "2"
      },
      {
        "fromUserId": "19",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS",
        "blockTimestamp": "1749885755",
        "transactionHash": "0xebfd1a28963c6b17498b2b7ff9131dc309e21bdc8f03a687980d2fd14883ec95",
        "grossAmount": "2500000",
        "level": "2"
      },
      {
        "fromUserId": "21",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS",
        "blockTimestamp": "1749885917",
        "transactionHash": "0xed7d9321ddbeb7a2410983bc9c8010a884c1ceae26ae8a10ae497c679bc4ba87",
        "grossAmount": "2500000",
        "level": "2"
      },
      {
        "fromUserId": "14",
        "receiverUserId": "1",
        "rewardType": "DIRECT",
        "blockTimestamp": "1749882659",
        "transactionHash": "0xee1b09a81aa014bb469b73e40cf6f18c1bb635505bd0d9ae1b6bf1481f8ef419",
        "grossAmount": "11000000",
        "level": "0"
      },
      {
        "fromUserId": "106",
        "receiverUserId": "1",
        "rewardType": "DIRECT_REBIRTH",
        "blockTimestamp": "1749886720",
        "transactionHash": "0xf3b252bed3bd1e899d34bdc0a021b6a42aafa3222bb6ac3b08c72fdd558cab69",
        "grossAmount": "11000000",
        "level": "0"
      },
      {
        "fromUserId": "105",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS_REBIRTH",
        "blockTimestamp": "1749886720",
        "transactionHash": "0xf3b252bed3bd1e899d34bdc0a021b6a42aafa3222bb6ac3b08c72fdd558cab69",
        "grossAmount": "1000000",
        "level": "3"
      },
      {
        "fromUserId": "30",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS",
        "blockTimestamp": "1749886720",
        "transactionHash": "0xf3b252bed3bd1e899d34bdc0a021b6a42aafa3222bb6ac3b08c72fdd558cab69",
        "grossAmount": "1000000",
        "level": "4"
      },
      {
        "fromUserId": "25",
        "receiverUserId": "1",
        "rewardType": "LEVEL_BONUS",
        "blockTimestamp": "1749886286",
        "transactionHash": "0xf3d8795249f53027dd2ae84541ab6a54c1ebd9da2c0523c089dcb7e2f5ec042d",
        "grossAmount": "1000000",
        "level": "4"
      }
    ],
    "rebirths": [
      {
        "mainUserId": "1",
        "childUserId": "100"
      },
      {
        "mainUserId": "1",
        "childUserId": "101"
      }
    ]
  }

  // const _data = await fetchLevelRewards(receiverUserIds, 0);
  console.log("_data", _data);
  console.log(new Set(_data.rewardDistributeds.map((r: any) => r.level)))

  const _levels = [...new Set(_data.rewardDistributeds.map((r: any) => r.level))];
  _levels.map(x => {
    const d: Reward[] = x === "0" ? _data.rewardDistributeds.filter(ld => ld.level === x && ["DIRECT", "DIRECT_REBIRTH"].includes(ld.rewardType)) as any : _data.rewardDistributeds.filter(ld => ld.level === x);
    levels[x] = d
      const refrelldata = d.length;
      console.log(refrelldata)
    const amt: number = d.reduce((sum: number, item: Reward) => {
      return sum + Number(item?.grossAmount) || 0;
    }, 0);

    data.levelData.push({
      level: x,
      levelData: d,
      levelTeamCount: d.length,
      levelTeamAmount: amt / 1000000

    } as LevelDataDetails)

  })
  const _level_rewards = levels;
  // const _level_rewards = levelRewards([..._data.rewardDistributeds], receiverUserIds, level, visited, levels)
  //console.log("OPTIMIZED DATA", _data, _level_rewards);

  const childUserIds = [..._data.rebirths.map((x: any) => x.childUserId)];

  const _uplineData = [..._data.rewardDistributeds.filter((x: any) => [...receiverUserIds, ...childUserIds].includes(x.receiverUserId) && ["UPLINE", "UPLINE_REBIRTH"].includes(x.rewardType))];
  //console.log("OPTIMIZED _uplineData DATA ", _uplineData);
  //  data.uplineRewards = _uplineData as any;
  const _superuplineData = [..._data.rewardDistributeds.filter((x: any) => x.receiverUserId === receiverUserIds[0] && ["SUPER_UPLINE", "SUPER_UPLINE_REBIRTH"].includes(x.rewardType))];
  //console.log("OPTIMIZED _superuplineData DATA ", _superuplineData);
  // data.superUplineRewards = _superuplineData as any;


  // console.log(data_levels);
  data.levels = _level_rewards;

  const allRewards = Object.values(_level_rewards).flat();
  const uniqueUserIds = new Set(_data.rewardDistributeds.map((r: any) => r.fromUserId));
  data.teamCount = allRewards.length;// uniqueUserIds.size;
  data.teamAmount = allRewards.length * 50;
  data.globalAmount = allRewards.length * 50;
  
  

  // Generation Amount
  const totalGenerationAmount = Object.entries(_level_rewards).reduce((sum, [levelStr, rewards]) => {
    const level = parseInt(levelStr);
    const reward = LEVEL_REWARD_AMOUNTS[level] || 0;
    return sum + rewards.length * reward;
  }, 0);

  const totalUplineAmount = _uplineData.length * UPLINE_REWARD_AMOUNT;

  const totalSuperUplineAmount = _superuplineData.length * SUPER_UPLINE_REWARD_AMOUNT;
  data.uplineAmount = totalUplineAmount;
  data.superUplineAmount = totalSuperUplineAmount;
  data.grandTotalAmount = totalGenerationAmount + totalUplineAmount + totalSuperUplineAmount;

  console.log("updated level data ", data);

  return data;
};

export const getTotalReward = async (
  receiverUserIds: string[],
  level: number = 0,
  visited = new Set<string>(),
  levels: LevelData = {}
): Promise<DashboardRewards> => {
  const data: DashboardRewards = {
    referalTeam: 0,
    allRewards: 0,
    teamCount: 0,
    teamAmount: 0,
    globalAmount: 0,
    levelData: [],
    uplineRewards: [],
    superUplineRewards: [],
    levels: {},
    grandTotalAmount: 0,
    uplineAmount: 0,
    superUplineAmount: 0,
  };
  // const _data = {
  //   "rewardDistributeds": [
  //     {
  //       "fromUserId": "23",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS",
  //       "blockTimestamp": "1749886066",
  //       "transactionHash": "0x04709abbe94658225252e4fbd130eb1fe3df2b2eaf6d5b3f995c979e15dfa4b2",
  //       "grossAmount": "2500000",
  //       "level": "2"
  //     },
  //     {
  //       "fromUserId": "104",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS_REBIRTH",
  //       "blockTimestamp": "1749886376",
  //       "transactionHash": "0x051b8f7ce4d395c41520f2ae3dddd96d4d222dceddadf51e1731830f94dd8bd5",
  //       "grossAmount": "2500000",
  //       "level": "2"
  //     },
  //     {
  //       "fromUserId": "26",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS",
  //       "blockTimestamp": "1749886376",
  //       "transactionHash": "0x051b8f7ce4d395c41520f2ae3dddd96d4d222dceddadf51e1731830f94dd8bd5",
  //       "grossAmount": "1000000",
  //       "level": "4"
  //     },
  //     {
  //       "fromUserId": "2",
  //       "receiverUserId": "1",
  //       "rewardType": "DIRECT",
  //       "blockTimestamp": "1749819359",
  //       "transactionHash": "0x10b58500f573be7a7c404b5e48f4b3381f058ca9fede7cd92062fb0bfcc2d308",
  //       "grossAmount": "11000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "2",
  //       "receiverUserId": "1",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749819359",
  //       "transactionHash": "0x10b58500f573be7a7c404b5e48f4b3381f058ca9fede7cd92062fb0bfcc2d308",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "7",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS",
  //       "blockTimestamp": "1749819679",
  //       "transactionHash": "0x23d1dd7e85d17197c999aafe05320e57c89118a8075ffe3c5b88b960465facf2",
  //       "grossAmount": "1000000",
  //       "level": "3"
  //     },
  //     {
  //       "fromUserId": "8",
  //       "receiverUserId": "1",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749819743",
  //       "transactionHash": "0x2a8286b759f715591e904833c47f719eda591733a8d3e4394bfe97bca14a1713",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "8",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS",
  //       "blockTimestamp": "1749819743",
  //       "transactionHash": "0x2a8286b759f715591e904833c47f719eda591733a8d3e4394bfe97bca14a1713",
  //       "grossAmount": "2500000",
  //       "level": "2"
  //     },
  //     {
  //       "fromUserId": "13",
  //       "receiverUserId": "1",
  //       "rewardType": "DIRECT",
  //       "blockTimestamp": "1749882608",
  //       "transactionHash": "0x36d571b3bf1cd8de061d034f4cf594543ab21583c220cfce50c746817bf7a1f0",
  //       "grossAmount": "11000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "13",
  //       "receiverUserId": "100",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749882608",
  //       "transactionHash": "0x36d571b3bf1cd8de061d034f4cf594543ab21583c220cfce50c746817bf7a1f0",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "10",
  //       "receiverUserId": "1",
  //       "rewardType": "DIRECT",
  //       "blockTimestamp": "1749882302",
  //       "transactionHash": "0x3f2f73d601ea6b1b59efb6227c982ef66c033c01f626a9e04bf88a0e3c5fc5e4",
  //       "grossAmount": "11000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "10",
  //       "receiverUserId": "100",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749882302",
  //       "transactionHash": "0x3f2f73d601ea6b1b59efb6227c982ef66c033c01f626a9e04bf88a0e3c5fc5e4",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "28",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS",
  //       "blockTimestamp": "1749886561",
  //       "transactionHash": "0x405247372f8ed80393ca70791f8c4f37d2fec56fb94c5930ce4ff83a041a6b3a",
  //       "grossAmount": "1000000",
  //       "level": "4"
  //     },
  //     {
  //       "fromUserId": "15",
  //       "receiverUserId": "1",
  //       "rewardType": "DIRECT",
  //       "blockTimestamp": "1749882731",
  //       "transactionHash": "0x43704b19bf616f7712191880bb5a593c2ea3f2435b634af52b9ef34a12908815",
  //       "grossAmount": "11000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "15",
  //       "receiverUserId": "101",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749882731",
  //       "transactionHash": "0x43704b19bf616f7712191880bb5a593c2ea3f2435b634af52b9ef34a12908815",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "4",
  //       "receiverUserId": "1",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749819493",
  //       "transactionHash": "0x47f68afee105659a770ab119d8160b9920a7a25855623b51d67e40eff4e125a9",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "4",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS",
  //       "blockTimestamp": "1749819493",
  //       "transactionHash": "0x47f68afee105659a770ab119d8160b9920a7a25855623b51d67e40eff4e125a9",
  //       "grossAmount": "2500000",
  //       "level": "2"
  //     },
  //     {
  //       "fromUserId": "31",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS",
  //       "blockTimestamp": "1749886783",
  //       "transactionHash": "0x490d7826832ed2424d3b77715456e8c3f83e1f07f7ec9635ed813a1eecc4aa3a",
  //       "grossAmount": "1000000",
  //       "level": "4"
  //     },
  //     {
  //       "fromUserId": "16",
  //       "receiverUserId": "1",
  //       "rewardType": "DIRECT",
  //       "blockTimestamp": "1749885533",
  //       "transactionHash": "0x50bca436c5be26b6f4d80221e32df6153e97dfee0158ce03b1d8cf645562ffc2",
  //       "grossAmount": "11000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "16",
  //       "receiverUserId": "101",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749885533",
  //       "transactionHash": "0x50bca436c5be26b6f4d80221e32df6153e97dfee0158ce03b1d8cf645562ffc2",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "12",
  //       "receiverUserId": "1",
  //       "rewardType": "DIRECT",
  //       "blockTimestamp": "1749882545",
  //       "transactionHash": "0x51932624e8bd2e4c28c7c0a0a65a2bb58fb142ace77b8c477336b6425addee0d",
  //       "grossAmount": "11000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "12",
  //       "receiverUserId": "100",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749882545",
  //       "transactionHash": "0x51932624e8bd2e4c28c7c0a0a65a2bb58fb142ace77b8c477336b6425addee0d",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "29",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS",
  //       "blockTimestamp": "1749886655",
  //       "transactionHash": "0x69610ab3f240dde9b13db4e7cf86c25e5a73574d3afc76419ace9bc7237e6397",
  //       "grossAmount": "1000000",
  //       "level": "4"
  //     },
  //     {
  //       "fromUserId": "102",
  //       "receiverUserId": "1",
  //       "rewardType": "DIRECT_REBIRTH",
  //       "blockTimestamp": "1749885681",
  //       "transactionHash": "0x72794c8b784e4bdc69e8da1f38cedd6f6b5bb7153bd78fa9409d4708ef69208c",
  //       "grossAmount": "11000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "18",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS",
  //       "blockTimestamp": "1749885681",
  //       "transactionHash": "0x72794c8b784e4bdc69e8da1f38cedd6f6b5bb7153bd78fa9409d4708ef69208c",
  //       "grossAmount": "2500000",
  //       "level": "2"
  //     },
  //     {
  //       "fromUserId": "20",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS",
  //       "blockTimestamp": "1749885814",
  //       "transactionHash": "0x8a7c101f5d2e11887b8897435aa279898067cddd3756f61fc103698e4fde6068",
  //       "grossAmount": "2500000",
  //       "level": "2"
  //     },
  //     {
  //       "fromUserId": "32",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS",
  //       "blockTimestamp": "1749886858",
  //       "transactionHash": "0x8d8ef9ceabd96cccd74072c5c34eed0ff0deac8f68eb631d91096c95038441d3",
  //       "grossAmount": "1000000",
  //       "level": "4"
  //     },
  //     {
  //       "fromUserId": "3",
  //       "receiverUserId": "1",
  //       "rewardType": "DIRECT",
  //       "blockTimestamp": "1749819458",
  //       "transactionHash": "0x972ca1fa9cb2c7a162a69046fdba9ff5d79fee576ca8ee23a8baaa7fe5f53bfe",
  //       "grossAmount": "11000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "3",
  //       "receiverUserId": "1",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749819458",
  //       "transactionHash": "0x972ca1fa9cb2c7a162a69046fdba9ff5d79fee576ca8ee23a8baaa7fe5f53bfe",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "17",
  //       "receiverUserId": "1",
  //       "rewardType": "DIRECT",
  //       "blockTimestamp": "1749885597",
  //       "transactionHash": "0x9a19e90449262be76e1baffa3b5d853baa87c05dd035c08e300d7816143ac674",
  //       "grossAmount": "11000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "17",
  //       "receiverUserId": "101",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749885597",
  //       "transactionHash": "0x9a19e90449262be76e1baffa3b5d853baa87c05dd035c08e300d7816143ac674",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "6",
  //       "receiverUserId": "1",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749819607",
  //       "transactionHash": "0x9b2a927f5bb1e673e7806d253be8be58ce107efacabc60ff1d92de338834f4f3",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "6",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS",
  //       "blockTimestamp": "1749819607",
  //       "transactionHash": "0x9b2a927f5bb1e673e7806d253be8be58ce107efacabc60ff1d92de338834f4f3",
  //       "grossAmount": "2500000",
  //       "level": "2"
  //     },
  //     {
  //       "fromUserId": "22",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS",
  //       "blockTimestamp": "1749885993",
  //       "transactionHash": "0xa4294ce477be22c7ab164738b37479b0ac49c0c04641cef6122bf8500f31ef73",
  //       "grossAmount": "2500000",
  //       "level": "2"
  //     },
  //     {
  //       "fromUserId": "11",
  //       "receiverUserId": "1",
  //       "rewardType": "DIRECT",
  //       "blockTimestamp": "1749882407",
  //       "transactionHash": "0xace19eb9cc8c00eba0229f6e047071e25d79b5429d68af34437779c0e726eadf",
  //       "grossAmount": "11000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "11",
  //       "receiverUserId": "100",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749882407",
  //       "transactionHash": "0xace19eb9cc8c00eba0229f6e047071e25d79b5429d68af34437779c0e726eadf",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "27",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS",
  //       "blockTimestamp": "1749886505",
  //       "transactionHash": "0xb0c88e1a2c1367f1335ceee06e2cdf02a817019e1a19102acd94f5685cada79d",
  //       "grossAmount": "1000000",
  //       "level": "4"
  //     },
  //     {
  //       "fromUserId": "33",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS",
  //       "blockTimestamp": "1749886915",
  //       "transactionHash": "0xc9383cd167599105244d8fd9d8f882d93d9596f95645591ae556af44df751a0f",
  //       "grossAmount": "1000000",
  //       "level": "4"
  //     },
  //     {
  //       "fromUserId": "9",
  //       "receiverUserId": "1",
  //       "rewardType": "DIRECT",
  //       "blockTimestamp": "1749882237",
  //       "transactionHash": "0xd61f06912823c5b71905ba44c872a1c6a01bc847627f6d449a2c0747fd82f897",
  //       "grossAmount": "11000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "9",
  //       "receiverUserId": "100",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749882237",
  //       "transactionHash": "0xd61f06912823c5b71905ba44c872a1c6a01bc847627f6d449a2c0747fd82f897",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "103",
  //       "receiverUserId": "1",
  //       "rewardType": "DIRECT_REBIRTH",
  //       "blockTimestamp": "1749886122",
  //       "transactionHash": "0xd962723c9206ca4fa5c241870b2ed747190f01b21154c4603deec5dce485cad9",
  //       "grossAmount": "11000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "24",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS",
  //       "blockTimestamp": "1749886122",
  //       "transactionHash": "0xd962723c9206ca4fa5c241870b2ed747190f01b21154c4603deec5dce485cad9",
  //       "grossAmount": "2500000",
  //       "level": "2"
  //     },
  //     {
  //       "fromUserId": "5",
  //       "receiverUserId": "1",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749819542",
  //       "transactionHash": "0xe107a1905f1dba16aa57ff532552540e95289be25467f0d0bdf5cb649a72d1a0",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "5",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS",
  //       "blockTimestamp": "1749819542",
  //       "transactionHash": "0xe107a1905f1dba16aa57ff532552540e95289be25467f0d0bdf5cb649a72d1a0",
  //       "grossAmount": "2500000",
  //       "level": "2"
  //     },
  //     {
  //       "fromUserId": "19",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS",
  //       "blockTimestamp": "1749885755",
  //       "transactionHash": "0xebfd1a28963c6b17498b2b7ff9131dc309e21bdc8f03a687980d2fd14883ec95",
  //       "grossAmount": "2500000",
  //       "level": "2"
  //     },
  //     {
  //       "fromUserId": "21",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS",
  //       "blockTimestamp": "1749885917",
  //       "transactionHash": "0xed7d9321ddbeb7a2410983bc9c8010a884c1ceae26ae8a10ae497c679bc4ba87",
  //       "grossAmount": "2500000",
  //       "level": "2"
  //     },
  //     {
  //       "fromUserId": "14",
  //       "receiverUserId": "1",
  //       "rewardType": "DIRECT",
  //       "blockTimestamp": "1749882659",
  //       "transactionHash": "0xee1b09a81aa014bb469b73e40cf6f18c1bb635505bd0d9ae1b6bf1481f8ef419",
  //       "grossAmount": "11000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "14",
  //       "receiverUserId": "100",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749882659",
  //       "transactionHash": "0xee1b09a81aa014bb469b73e40cf6f18c1bb635505bd0d9ae1b6bf1481f8ef419",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "106",
  //       "receiverUserId": "1",
  //       "rewardType": "DIRECT_REBIRTH",
  //       "blockTimestamp": "1749886720",
  //       "transactionHash": "0xf3b252bed3bd1e899d34bdc0a021b6a42aafa3222bb6ac3b08c72fdd558cab69",
  //       "grossAmount": "11000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "105",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS_REBIRTH",
  //       "blockTimestamp": "1749886720",
  //       "transactionHash": "0xf3b252bed3bd1e899d34bdc0a021b6a42aafa3222bb6ac3b08c72fdd558cab69",
  //       "grossAmount": "1000000",
  //       "level": "3"
  //     },
  //     {
  //       "fromUserId": "30",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS",
  //       "blockTimestamp": "1749886720",
  //       "transactionHash": "0xf3b252bed3bd1e899d34bdc0a021b6a42aafa3222bb6ac3b08c72fdd558cab69",
  //       "grossAmount": "1000000",
  //       "level": "4"
  //     },
  //     {
  //       "fromUserId": "25",
  //       "receiverUserId": "1",
  //       "rewardType": "LEVEL_BONUS",
  //       "blockTimestamp": "1749886286",
  //       "transactionHash": "0xf3d8795249f53027dd2ae84541ab6a54c1ebd9da2c0523c089dcb7e2f5ec042d",
  //       "grossAmount": "1000000",
  //       "level": "4"
  //     }
  //   ],
  //   "upline": [
  //     {
  //       "fromUserId": "23",
  //       "receiverUserId": "20",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749886066",
  //       "transactionHash": "0x04709abbe94658225252e4fbd130eb1fe3df2b2eaf6d5b3f995c979e15dfa4b2",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "104",
  //       "receiverUserId": "8",
  //       "rewardType": "UPLINE_REBIRTH",
  //       "blockTimestamp": "1749886376",
  //       "transactionHash": "0x051b8f7ce4d395c41520f2ae3dddd96d4d222dceddadf51e1731830f94dd8bd5",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "26",
  //       "receiverUserId": "7",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749886376",
  //       "transactionHash": "0x051b8f7ce4d395c41520f2ae3dddd96d4d222dceddadf51e1731830f94dd8bd5",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "2",
  //       "receiverUserId": "1",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749819359",
  //       "transactionHash": "0x10b58500f573be7a7c404b5e48f4b3381f058ca9fede7cd92062fb0bfcc2d308",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "7",
  //       "receiverUserId": "4",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749819679",
  //       "transactionHash": "0x23d1dd7e85d17197c999aafe05320e57c89118a8075ffe3c5b88b960465facf2",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "100",
  //       "receiverUserId": "4",
  //       "rewardType": "UPLINE_REBIRTH",
  //       "blockTimestamp": "1749819743",
  //       "transactionHash": "0x2a8286b759f715591e904833c47f719eda591733a8d3e4394bfe97bca14a1713",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "8",
  //       "receiverUserId": "3",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749819743",
  //       "transactionHash": "0x2a8286b759f715591e904833c47f719eda591733a8d3e4394bfe97bca14a1713",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "13",
  //       "receiverUserId": "10",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749882608",
  //       "transactionHash": "0x36d571b3bf1cd8de061d034f4cf594543ab21583c220cfce50c746817bf7a1f0",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "10",
  //       "receiverUserId": "100",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749882302",
  //       "transactionHash": "0x3f2f73d601ea6b1b59efb6227c982ef66c033c01f626a9e04bf88a0e3c5fc5e4",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "28",
  //       "receiverUserId": "25",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749886561",
  //       "transactionHash": "0x405247372f8ed80393ca70791f8c4f37d2fec56fb94c5930ce4ff83a041a6b3a",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "15",
  //       "receiverUserId": "101",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749882731",
  //       "transactionHash": "0x43704b19bf616f7712191880bb5a593c2ea3f2435b634af52b9ef34a12908815",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "4",
  //       "receiverUserId": "2",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749819493",
  //       "transactionHash": "0x47f68afee105659a770ab119d8160b9920a7a25855623b51d67e40eff4e125a9",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "31",
  //       "receiverUserId": "105",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749886783",
  //       "transactionHash": "0x490d7826832ed2424d3b77715456e8c3f83e1f07f7ec9635ed813a1eecc4aa3a",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "16",
  //       "receiverUserId": "101",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749885533",
  //       "transactionHash": "0x50bca436c5be26b6f4d80221e32df6153e97dfee0158ce03b1d8cf645562ffc2",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "12",
  //       "receiverUserId": "9",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749882545",
  //       "transactionHash": "0x51932624e8bd2e4c28c7c0a0a65a2bb58fb142ace77b8c477336b6425addee0d",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "29",
  //       "receiverUserId": "26",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749886655",
  //       "transactionHash": "0x69610ab3f240dde9b13db4e7cf86c25e5a73574d3afc76419ace9bc7237e6397",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "102",
  //       "receiverUserId": "6",
  //       "rewardType": "UPLINE_REBIRTH",
  //       "blockTimestamp": "1749885681",
  //       "transactionHash": "0x72794c8b784e4bdc69e8da1f38cedd6f6b5bb7153bd78fa9409d4708ef69208c",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "18",
  //       "receiverUserId": "5",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749885681",
  //       "transactionHash": "0x72794c8b784e4bdc69e8da1f38cedd6f6b5bb7153bd78fa9409d4708ef69208c",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "20",
  //       "receiverUserId": "102",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749885814",
  //       "transactionHash": "0x8a7c101f5d2e11887b8897435aa279898067cddd3756f61fc103698e4fde6068",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "32",
  //       "receiverUserId": "105",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749886858",
  //       "transactionHash": "0x8d8ef9ceabd96cccd74072c5c34eed0ff0deac8f68eb631d91096c95038441d3",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "3",
  //       "receiverUserId": "1",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749819458",
  //       "transactionHash": "0x972ca1fa9cb2c7a162a69046fdba9ff5d79fee576ca8ee23a8baaa7fe5f53bfe",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "17",
  //       "receiverUserId": "15",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749885597",
  //       "transactionHash": "0x9a19e90449262be76e1baffa3b5d853baa87c05dd035c08e300d7816143ac674",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "6",
  //       "receiverUserId": "3",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749819607",
  //       "transactionHash": "0x9b2a927f5bb1e673e7806d253be8be58ce107efacabc60ff1d92de338834f4f3",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "22",
  //       "receiverUserId": "19",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749885993",
  //       "transactionHash": "0xa4294ce477be22c7ab164738b37479b0ac49c0c04641cef6122bf8500f31ef73",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "11",
  //       "receiverUserId": "9",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749882407",
  //       "transactionHash": "0xace19eb9cc8c00eba0229f6e047071e25d79b5429d68af34437779c0e726eadf",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "27",
  //       "receiverUserId": "25",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749886505",
  //       "transactionHash": "0xb0c88e1a2c1367f1335ceee06e2cdf02a817019e1a19102acd94f5685cada79d",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "33",
  //       "receiverUserId": "31",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749886915",
  //       "transactionHash": "0xc9383cd167599105244d8fd9d8f882d93d9596f95645591ae556af44df751a0f",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "9",
  //       "receiverUserId": "100",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749882237",
  //       "transactionHash": "0xd61f06912823c5b71905ba44c872a1c6a01bc847627f6d449a2c0747fd82f897",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "103",
  //       "receiverUserId": "6",
  //       "rewardType": "UPLINE_REBIRTH",
  //       "blockTimestamp": "1749886122",
  //       "transactionHash": "0xd962723c9206ca4fa5c241870b2ed747190f01b21154c4603deec5dce485cad9",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "24",
  //       "receiverUserId": "20",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749886122",
  //       "transactionHash": "0xd962723c9206ca4fa5c241870b2ed747190f01b21154c4603deec5dce485cad9",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "5",
  //       "receiverUserId": "2",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749819542",
  //       "transactionHash": "0xe107a1905f1dba16aa57ff532552540e95289be25467f0d0bdf5cb649a72d1a0",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "19",
  //       "receiverUserId": "102",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749885755",
  //       "transactionHash": "0xebfd1a28963c6b17498b2b7ff9131dc309e21bdc8f03a687980d2fd14883ec95",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "21",
  //       "receiverUserId": "19",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749885917",
  //       "transactionHash": "0xed7d9321ddbeb7a2410983bc9c8010a884c1ceae26ae8a10ae497c679bc4ba87",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "101",
  //       "receiverUserId": "5",
  //       "rewardType": "UPLINE_REBIRTH",
  //       "blockTimestamp": "1749882659",
  //       "transactionHash": "0xee1b09a81aa014bb469b73e40cf6f18c1bb635505bd0d9ae1b6bf1481f8ef419",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "14",
  //       "receiverUserId": "10",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749882659",
  //       "transactionHash": "0xee1b09a81aa014bb469b73e40cf6f18c1bb635505bd0d9ae1b6bf1481f8ef419",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "106",
  //       "receiverUserId": "18",
  //       "rewardType": "UPLINE_REBIRTH",
  //       "blockTimestamp": "1749886720",
  //       "transactionHash": "0xf3b252bed3bd1e899d34bdc0a021b6a42aafa3222bb6ac3b08c72fdd558cab69",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "105",
  //       "receiverUserId": "8",
  //       "rewardType": "UPLINE_REBIRTH",
  //       "blockTimestamp": "1749886720",
  //       "transactionHash": "0xf3b252bed3bd1e899d34bdc0a021b6a42aafa3222bb6ac3b08c72fdd558cab69",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "30",
  //       "receiverUserId": "26",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749886720",
  //       "transactionHash": "0xf3b252bed3bd1e899d34bdc0a021b6a42aafa3222bb6ac3b08c72fdd558cab69",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "25",
  //       "receiverUserId": "7",
  //       "rewardType": "UPLINE",
  //       "blockTimestamp": "1749886286",
  //       "transactionHash": "0xf3d8795249f53027dd2ae84541ab6a54c1ebd9da2c0523c089dcb7e2f5ec042d",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     }
  //   ],
  //   "super_upline": [
  //     {
  //       "fromUserId": "23",
  //       "receiverUserId": "102",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749886066",
  //       "transactionHash": "0x04709abbe94658225252e4fbd130eb1fe3df2b2eaf6d5b3f995c979e15dfa4b2",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "104",
  //       "receiverUserId": "3",
  //       "rewardType": "SUPER_UPLINE_REBIRTH",
  //       "blockTimestamp": "1749886376",
  //       "transactionHash": "0x051b8f7ce4d395c41520f2ae3dddd96d4d222dceddadf51e1731830f94dd8bd5",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "26",
  //       "receiverUserId": "4",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749886376",
  //       "transactionHash": "0x051b8f7ce4d395c41520f2ae3dddd96d4d222dceddadf51e1731830f94dd8bd5",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "7",
  //       "receiverUserId": "2",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749819679",
  //       "transactionHash": "0x23d1dd7e85d17197c999aafe05320e57c89118a8075ffe3c5b88b960465facf2",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "100",
  //       "receiverUserId": "2",
  //       "rewardType": "SUPER_UPLINE_REBIRTH",
  //       "blockTimestamp": "1749819743",
  //       "transactionHash": "0x2a8286b759f715591e904833c47f719eda591733a8d3e4394bfe97bca14a1713",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "8",
  //       "receiverUserId": "1",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749819743",
  //       "transactionHash": "0x2a8286b759f715591e904833c47f719eda591733a8d3e4394bfe97bca14a1713",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "13",
  //       "receiverUserId": "100",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749882608",
  //       "transactionHash": "0x36d571b3bf1cd8de061d034f4cf594543ab21583c220cfce50c746817bf7a1f0",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "10",
  //       "receiverUserId": "4",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749882302",
  //       "transactionHash": "0x3f2f73d601ea6b1b59efb6227c982ef66c033c01f626a9e04bf88a0e3c5fc5e4",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "28",
  //       "receiverUserId": "7",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749886561",
  //       "transactionHash": "0x405247372f8ed80393ca70791f8c4f37d2fec56fb94c5930ce4ff83a041a6b3a",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "15",
  //       "receiverUserId": "5",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749882731",
  //       "transactionHash": "0x43704b19bf616f7712191880bb5a593c2ea3f2435b634af52b9ef34a12908815",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "4",
  //       "receiverUserId": "1",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749819493",
  //       "transactionHash": "0x47f68afee105659a770ab119d8160b9920a7a25855623b51d67e40eff4e125a9",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "31",
  //       "receiverUserId": "8",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749886783",
  //       "transactionHash": "0x490d7826832ed2424d3b77715456e8c3f83e1f07f7ec9635ed813a1eecc4aa3a",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "16",
  //       "receiverUserId": "5",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749885533",
  //       "transactionHash": "0x50bca436c5be26b6f4d80221e32df6153e97dfee0158ce03b1d8cf645562ffc2",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "12",
  //       "receiverUserId": "100",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749882545",
  //       "transactionHash": "0x51932624e8bd2e4c28c7c0a0a65a2bb58fb142ace77b8c477336b6425addee0d",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "29",
  //       "receiverUserId": "7",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749886655",
  //       "transactionHash": "0x69610ab3f240dde9b13db4e7cf86c25e5a73574d3afc76419ace9bc7237e6397",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "102",
  //       "receiverUserId": "3",
  //       "rewardType": "SUPER_UPLINE_REBIRTH",
  //       "blockTimestamp": "1749885681",
  //       "transactionHash": "0x72794c8b784e4bdc69e8da1f38cedd6f6b5bb7153bd78fa9409d4708ef69208c",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "18",
  //       "receiverUserId": "2",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749885681",
  //       "transactionHash": "0x72794c8b784e4bdc69e8da1f38cedd6f6b5bb7153bd78fa9409d4708ef69208c",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "20",
  //       "receiverUserId": "6",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749885814",
  //       "transactionHash": "0x8a7c101f5d2e11887b8897435aa279898067cddd3756f61fc103698e4fde6068",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "32",
  //       "receiverUserId": "8",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749886858",
  //       "transactionHash": "0x8d8ef9ceabd96cccd74072c5c34eed0ff0deac8f68eb631d91096c95038441d3",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "17",
  //       "receiverUserId": "101",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749885597",
  //       "transactionHash": "0x9a19e90449262be76e1baffa3b5d853baa87c05dd035c08e300d7816143ac674",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "6",
  //       "receiverUserId": "1",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749819607",
  //       "transactionHash": "0x9b2a927f5bb1e673e7806d253be8be58ce107efacabc60ff1d92de338834f4f3",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "22",
  //       "receiverUserId": "102",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749885993",
  //       "transactionHash": "0xa4294ce477be22c7ab164738b37479b0ac49c0c04641cef6122bf8500f31ef73",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "11",
  //       "receiverUserId": "100",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749882407",
  //       "transactionHash": "0xace19eb9cc8c00eba0229f6e047071e25d79b5429d68af34437779c0e726eadf",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "27",
  //       "receiverUserId": "7",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749886505",
  //       "transactionHash": "0xb0c88e1a2c1367f1335ceee06e2cdf02a817019e1a19102acd94f5685cada79d",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "33",
  //       "receiverUserId": "105",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749886915",
  //       "transactionHash": "0xc9383cd167599105244d8fd9d8f882d93d9596f95645591ae556af44df751a0f",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "9",
  //       "receiverUserId": "4",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749882237",
  //       "transactionHash": "0xd61f06912823c5b71905ba44c872a1c6a01bc847627f6d449a2c0747fd82f897",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "103",
  //       "receiverUserId": "3",
  //       "rewardType": "SUPER_UPLINE_REBIRTH",
  //       "blockTimestamp": "1749886122",
  //       "transactionHash": "0xd962723c9206ca4fa5c241870b2ed747190f01b21154c4603deec5dce485cad9",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "24",
  //       "receiverUserId": "102",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749886122",
  //       "transactionHash": "0xd962723c9206ca4fa5c241870b2ed747190f01b21154c4603deec5dce485cad9",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "5",
  //       "receiverUserId": "1",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749819542",
  //       "transactionHash": "0xe107a1905f1dba16aa57ff532552540e95289be25467f0d0bdf5cb649a72d1a0",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "19",
  //       "receiverUserId": "6",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749885755",
  //       "transactionHash": "0xebfd1a28963c6b17498b2b7ff9131dc309e21bdc8f03a687980d2fd14883ec95",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "21",
  //       "receiverUserId": "102",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749885917",
  //       "transactionHash": "0xed7d9321ddbeb7a2410983bc9c8010a884c1ceae26ae8a10ae497c679bc4ba87",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "101",
  //       "receiverUserId": "2",
  //       "rewardType": "SUPER_UPLINE_REBIRTH",
  //       "blockTimestamp": "1749882659",
  //       "transactionHash": "0xee1b09a81aa014bb469b73e40cf6f18c1bb635505bd0d9ae1b6bf1481f8ef419",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "14",
  //       "receiverUserId": "100",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749882659",
  //       "transactionHash": "0xee1b09a81aa014bb469b73e40cf6f18c1bb635505bd0d9ae1b6bf1481f8ef419",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "106",
  //       "receiverUserId": "5",
  //       "rewardType": "SUPER_UPLINE_REBIRTH",
  //       "blockTimestamp": "1749886720",
  //       "transactionHash": "0xf3b252bed3bd1e899d34bdc0a021b6a42aafa3222bb6ac3b08c72fdd558cab69",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "105",
  //       "receiverUserId": "3",
  //       "rewardType": "SUPER_UPLINE_REBIRTH",
  //       "blockTimestamp": "1749886720",
  //       "transactionHash": "0xf3b252bed3bd1e899d34bdc0a021b6a42aafa3222bb6ac3b08c72fdd558cab69",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "30",
  //       "receiverUserId": "7",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749886720",
  //       "transactionHash": "0xf3b252bed3bd1e899d34bdc0a021b6a42aafa3222bb6ac3b08c72fdd558cab69",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     },
  //     {
  //       "fromUserId": "25",
  //       "receiverUserId": "4",
  //       "rewardType": "SUPER_UPLINE",
  //       "blockTimestamp": "1749886286",
  //       "transactionHash": "0xf3d8795249f53027dd2ae84541ab6a54c1ebd9da2c0523c089dcb7e2f5ec042d",
  //       "grossAmount": "10000000",
  //       "level": "0"
  //     }
  //   ],
  //   "rebirths": [
  //     {
  //       "mainUserId": "1",
  //       "childUserId": "100"
  //     },
  //     {
  //       "mainUserId": "1",
  //       "childUserId": "101"
  //     }
  //   ]
  // }

  const _data = await fetchLevelRewards(receiverUserIds, 0);
  //console.log(_data);
  const _levels = [...new Set(_data.rewardDistributeds.map((r: any) => Number(r.level)))].sort((a:any, b:any) => Number(a) - Number(b));

  console.log(_levels);
  _levels.map((x: any) => {
    const d: Reward[] = x === 0 ? _data.rewardDistributeds.filter((ld: Reward) => ld.level?.toString() === x.toString() && ["DIRECT", "DIRECT_REBIRTH"].includes(ld.rewardType)) as any : _data.rewardDistributeds.filter((ld: Reward) => ld.level?.toString() === x.toString());
    levels[x] = d
  console.log(_data.rewardDistributeds,x, d);
    const amt: number = d.reduce((sum: number, item: Reward) => {
      return sum + Number(item?.grossAmount) || 0;
    }, 0);

    data.levelData.push({
      level: x.toString(),
      levelData: d,
      levelTeamCount: d.length,
      levelTeamAmount: amt / 1_000_000

    } as LevelDataDetails)

  })
  const _level_rewards = levels;
  data.referalTeam = levels["0"].length;
  const childUserIds = [..._data.rebirths.map((x: any) => x.childUserId)];

  const _uplineData = [..._data.upline.filter((x: any) => [...receiverUserIds, ...childUserIds].includes(x.receiverUserId))];


  const _superuplineData = [..._data.super_upline.filter((x: any) => [...receiverUserIds, ...childUserIds].includes(x.receiverUserId))];

  data.levels = _level_rewards;
  const allRewards = Object.values(_level_rewards).flat();
  const uniqueUserIds = new Set(_data.rewardDistributeds.map((r: any) => r.fromUserId));
  data.teamCount = allRewards.length;// uniqueUserIds.size;
  data.teamAmount = allRewards.length * 50;
  data.globalAmount = allRewards.length * 50;

  // Generation Amount
  const totalGenerationAmount = Object.entries(_level_rewards).reduce((sum, [levelStr, rewards]) => {
    const level = parseInt(levelStr);
    const reward = LEVEL_REWARD_AMOUNTS[level] || 0;
    return sum + rewards.length * reward;
  }, 0);

  const totalUplineAmount = _uplineData.length * UPLINE_REWARD_AMOUNT;

  const totalSuperUplineAmount = _superuplineData.length * SUPER_UPLINE_REWARD_AMOUNT;

  data.uplineRewards = _uplineData;
  data.superUplineRewards = _superuplineData;
  data.uplineAmount = totalUplineAmount;
  data.superUplineAmount = totalSuperUplineAmount;

  data.grandTotalAmount = data.levelData.reduce((sum: number, item: LevelDataDetails) => {
    return sum + Number(item?.levelTeamAmount) || 0
  }, 0) + totalUplineAmount + totalSuperUplineAmount; // totalGenerationAmount + totalUplineAmount + totalSuperUplineAmount;

  console.log(data);
  return data;
};