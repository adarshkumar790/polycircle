// useRegister.ts
"use client";

import { useEffect, useState } from "react";
import { registerUser } from "@/components/registerUser";
import { useAppKitProvider } from "@reown/appkit/react";
import { ethers } from "ethers";
import { useSearchParams, useRouter } from "next/navigation";

export function useRegister(initialReferralId?: string) {
  //@ts-ignore
  const { walletProvider: providerInstance, chainId: activeChainId } = useAppKitProvider("eip155");

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [referralId, setReferralId] = useState(initialReferralId || "1");
  const router = useRouter();

  const searchParams = useSearchParams();

  // Load referral ID from URL or initial prop
  useEffect(() => {
    const urlRef = searchParams.get("ref");
    if (urlRef && !isNaN(Number(urlRef))) {
      setReferralId(urlRef);
    } else if (initialReferralId && !isNaN(Number(initialReferralId))) {
      setReferralId(initialReferralId);
    } else {
      setReferralId("1");
    }
  }, [searchParams, initialReferralId]);

  // Wallet connection
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        //@ts-ignore
        if (!providerInstance?.request) return;
          //@ts-ignore
        const accounts: string[] = await providerInstance.request({ method: "eth_accounts" });
        if (accounts.length === 0) return;

        setWalletAddress(accounts[0]);
        const ethersProvider = new ethers.BrowserProvider(providerInstance as any);
        const signerInstance = await ethersProvider.getSigner();
        setSigner(signerInstance);
        //@ts-ignore
        const balanceWei: string = await providerInstance.request({
          method: "eth_getBalance",
          params: [accounts[0], "latest"],
        });
        setBalance(parseFloat(ethers.formatEther(balanceWei)).toFixed(4));
      } catch (error) {
        console.error("Wallet Initialization Error:", error);
      }
    };

    initializeWallet();
  }, [providerInstance, activeChainId]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleRegister = async () => {
    if (!walletAddress || !signer) {
      setStatusMessage("Please connect your wallet first.");
      return;
    }

    setStatusMessage("Processing registration...");

    const refId = Number(referralId);
    if (isNaN(refId)) {
      setStatusMessage("Invalid referral ID.");
      return;
    }

    try {
      const result = await registerUser({ referrer: refId, signer });
      if (result.success) {
        setStatusMessage(`Registration successful with referrer ID ${refId} please automaticlogin and see your details`);

        // setTimeout(() => router.push("/dashboards"), 1000);
      } else {
        setStatusMessage(`Registration failed: ${result.error}`);
      }
    } catch (error: any) {
      setStatusMessage(`Unexpected error: ${error.message}`);
    }
  };

  return {
    walletAddress,
    balance,
    signer,
    isLoaded,
    statusMessage,
    referralId,
    setReferralId,
    handleRegister,
  };
}
