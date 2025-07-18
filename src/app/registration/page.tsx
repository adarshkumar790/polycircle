"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUserId } from "@/Redux/store/userSlice";
import { useRegister } from "@/components/usehooks/usehook";
import { checkRegistrationStatus, getPendingRebirths } from "@/components/registerUser";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Register() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const refFromUrl = searchParams.get("ref") || "1";

  const [viewUserId, setViewUserId] = useState("");
  const [rebirths, setRebirths] = useState<string[]>([]);
  const [rebirthCheckLoading, setRebirthCheckLoading] = useState(false);
  const [error, setError] = useState("");
  const [waitingForRebirthClear, setWaitingForRebirthClear] = useState(false);

  const {
    walletAddress,
    balance,
    signer,
    statusMessage,
    isLoaded,
    referralId,
    setReferralId,
    handleRegister,
  } = useRegister(refFromUrl);

  const isReferralInRebirthQueue = referralId && rebirths.includes(referralId);

  const handleAutomaticLogin = async () => {
    if (!signer) {
      toast.warning("Connect your wallet first");
      return;
    }

    const result = await checkRegistrationStatus(signer);
    if (result.exists) {
      dispatch(setUserId(result.userId.toString()));
      router.push("/dashboards");
    } else {
      toast.error("You are not registered yet. Please register first.");
    }
  };

  const handleViewUser = () => {
    if (!signer) {
      toast.warning("Connect your wallet first");
      return;
    }

    if (!viewUserId.trim()) {
      toast.warning("Please enter a valid User ID.");
      return;
    }

    dispatch(setUserId(viewUserId));
    router.push("/dashboards");
  };

  const handleRegisterWithCheck = async () => {
    if (!signer) {
      toast.warning("Connect your wallet to register");
      return;
    }

    if (!referralId.trim()) {
      toast.warning("Please enter a referral ID");
      return;
    }

    if (rebirths.includes(referralId)) {
      // toast.info("Referral ID is currently undergoing rebirth. Waiting...");
      setWaitingForRebirthClear(true);
      return;
    }

    handleRegister();
  };

  useEffect(() => {
    if (!signer) return;

    const fetchRebirths = async () => {
      setRebirthCheckLoading(true);
      const { rebirths, error } = await getPendingRebirths(signer);
      console.log("rebirths", rebirths)
      if (error) {
        setError(error);
      } else {
        setRebirths(rebirths || []);
      }
      setRebirthCheckLoading(false);
    };

    fetchRebirths();

    // Keep polling every 5 seconds if waiting for rebirth to clear
    const interval = setInterval(() => {
      if (waitingForRebirthClear) {
        fetchRebirths().then(() => {
          const stillBlocked = referralId && rebirths.includes(referralId);
          if (!stillBlocked && referralId) {
            setWaitingForRebirthClear(false);
            handleRegister();
          }
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [signer, waitingForRebirthClear, referralId]);

  return (
    <div
      className="min-h-screen bg-black flex flex-col items-center text-white relative overflow-hidden"
      style={{
        backgroundImage: "url('/logo/registration.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="z-10 flex flex-col items-center mb-6">
        <div className="flex items-center flex-col">
          <Image
            src="/polycircle.svg"
            alt="Polycircle"
            width={300}
            height={300}
            className="mb-[-4px]"
          />
          <div
            className="inline-block px-6 py-2 rounded-md bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition active:scale-95"
            style={{
              boxShadow:
                "0 10px 15px -3px hsla(217, 91.20%, 59.80%, 0.95), 0 4px 6px -2px rgba(59, 130, 246, 0.4)",
            }}
          >
            {isLoaded ? (
              <appkit-button />
            ) : (
              <div className="h-6 w-24 bg-blue-300 animate-pulse rounded"></div>
            )}
          </div>
        </div>
      </div>

      <div className="z-10 flex flex-col md:flex-row md:space-x-10 w-full max-w-6xl px-4">
        {/* Left Panel */}
        <div className="flex-1 bg-gradient-to-b from-purple-900/30 to-transparent rounded-xl p-4 md:p-12 flex flex-col items-center space-y-4 border border-purple-900 mb-6 md:mb-0">
          <h2 className="text-xl font-semibold mb-2">Sign Now With PolyCircle</h2>
          <input
            type="text"
            placeholder="Enter UserId"
            value={viewUserId}
            onChange={(e) => setViewUserId(e.target.value)}
            className="w-full px-4 py-2 rounded bg-slate-900 border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={handleViewUser}
            className="w-1/2 px-4 py-2 rounded bg-white text-purple-700 font-semibold shadow hover:bg-purple-100 transition cursor-pointer"
          >
            VIEW
          </button>
          <p className="md:text-sm text-xs text-center px-2">
            For Access To All The Function Of Your Personal Account, Use Automatic Login
          </p>
          <button
            onClick={handleAutomaticLogin}
            className="w-2/3 px-4 py-2 rounded bg-white z-20 text-purple-700 font-semibold shadow hover:bg-purple-100 transition cursor-pointer"
          >
            AUTOMATIC LOGIN
          </button>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-gradient-to-b from-purple-900/30 to-transparent rounded-xl p-4 md:p-6 flex flex-col items-center space-y-4 border border-purple-900">
          <h2 className="text-xl font-semibold mb-2">Sign Up With PolyCircle</h2>
          <p className="md:text-sm text-xs text-center">
            Please Double-Check The Inviter's ID Before Registering
          </p>

          <input
            type="text"
            placeholder="Enter Referral Id"
            value={referralId}
            onChange={(e) => setReferralId(e.target.value)}
            className="w-full px-4 py-2 rounded bg-slate-900 border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <button
            onClick={handleRegisterWithCheck}
            className="w-1/2 px-4 py-2 rounded bg-white text-purple-700 font-semibold shadow hover:bg-purple-100 transition relative flex items-center justify-center"
          >
            {rebirthCheckLoading || waitingForRebirthClear ? (
              <div className="flex items-center gap-2">
                
                {waitingForRebirthClear
                  ? "REGISTER"
                  : "REGISTER"}
              </div>
            ) : (
              "REGISTER"
            )}
          </button>

          {waitingForRebirthClear && (
            <div className="flex items-center justify-center gap-2 text-white text-sm text-center">
              {/* <svg
                className="animate-spin h-4 w-4 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg> */}
              <span>Processing Registration...</span>
            </div>
          )}

          {statusMessage && (
            <p className="mt-2 text-sm text-center text-white">{statusMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}
