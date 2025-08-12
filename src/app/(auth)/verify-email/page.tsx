"use client";

import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!token || !email) {
      toast.error("Missing token or email.");
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_DOMAIN}/auth/verify-email`,
        { token, email }
      );
      toast.success(data.msg || "Email verified successfully!");
      router.push("/login");
      setIsVerified(true);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.msg || "Verification failed");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
      <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center'>
        <h1 className='text-2xl font-bold mb-4'>Verify Your Email</h1>
        {email && (
          <p className='text-gray-600 mb-6'>
            You&apos;re verifying <span className='font-medium'>{email}</span>
          </p>
        )}

        <button
          onClick={handleVerify}
          disabled={isLoading || isVerified}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white transition-all
            ${
              isVerified
                ? "bg-green-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }
            ${isLoading ? "opacity-70 cursor-wait" : ""}
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className='animate-spin h-5 w-5' />
              Verifying...
            </>
          ) : isVerified ? (
            "Email Verified"
          ) : (
            "Verify Email"
          )}
        </button>
      </div>
    </div>
  );
}
