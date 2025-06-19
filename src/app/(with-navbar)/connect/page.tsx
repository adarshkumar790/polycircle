"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAppKitProvider } from "@reown/appkit/react";
import { registerUser } from "@/components/registerUser"

const WalletComponent: React.FC = () => {
  //@ts-ignore
  const { walletProvider: providerInstance, chainId: activeChainId } = useAppKitProvider("eip155");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [referrerId, setReferrerId] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function initializeWallet() {
      try {
        //@ts-ignore
        if (!providerInstance?.request) return;

        //@ts-ignore
        let accounts: string[] = await providerInstance.request({ method: "eth_accounts" });

        if (accounts.length === 0) {
          //@ts-ignore
          accounts = await providerInstance.request({ method: "eth_requestAccounts" });
          if (accounts.length === 0) {
            console.warn("No accounts connected!");
            return;
          }
        }

        setWalletAddress(accounts[0]);

        //@ts-ignore
        const ethersProvider = new ethers.BrowserProvider(providerInstance);
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
    }

    initializeWallet();
  }, [providerInstance, activeChainId]);

  const handleRegister = async () => {
    if (!signer) {
      setStatusMessage("Please connect your wallet first.");
      return;
    }
    setStatusMessage("Processing registration...");
    try {
      const result = await registerUser({ referrer: referrerId, signer });
      if (result.success) {
        setStatusMessage(`Registration successful with referrer ID ${referrerId}!`);
      } else {
        setStatusMessage(`Registration failed: ${result.error}`);
      }
    } catch (error: any) {
      setStatusMessage(`Unexpected error: ${error.message}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="p-6 border rounded-xl shadow-lg bg-gray-900 max-w-md w-full space-y-4">
        <div>
          <appkit-button />
        </div>

        {walletAddress ? (
          <>
            <div>
              <strong>Address:</strong> {walletAddress}
            </div>
            <div>
              <strong>Balance:</strong> {balance} ETH
            </div>

            <div className="mt-4">
              <label className="block mb-1 text-sm font-medium">Referrer ID</label>
              <input
                type="number"
                value={referrerId}
                onChange={(e) => setReferrerId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
                placeholder="Enter referrer ID"
              />
            </div>

            <button
              onClick={handleRegister}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
            >
              Register
            </button>

            {statusMessage && <div className="mt-3 text-sm">{statusMessage}</div>}
          </>
        ) : (
          <p className="text-yellow-400">Please connect your wallet using the button above.</p>
        )}
      </div>
    </div>
  );
};

export default WalletComponent;
