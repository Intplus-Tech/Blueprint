"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { storeInSession } from "../../(auth)/components/session";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const accessToken = params.get("access_token");
    const csrfToken = params.get("csrf_token");
    const userId = params.get("user_id");
    const email = params.get("email");
    const username = params.get("username");

    const data = {
      access_token: accessToken,
      csrf_token: csrfToken,
      user: {
        email,
        userId,
        username,
      },
    };

    if (accessToken) {
      storeInSession("user", JSON.stringify(data));

      router.push("/dashboard"); // redirect home after saving
    }
  }, [router]);

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <div className='h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700'></div>
      <span className='mt-2 text-sm text-gray-600'>Logging you in... </span>
    </div>
  );
}
