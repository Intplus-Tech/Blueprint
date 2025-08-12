"use client";

import type React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showconfirmPassword, setconfirmPassword] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [form, setForm] = useState({
    Password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!token) {
      toast.error("token is not defined");
      setIsLoading(false);
      return;
    }
    if (form.confirmPassword !== form.Password) {
      toast.error("password must be correct");
      setIsLoading(false);
      return;
    }
    const details = {
      password: form.Password,
      token: token,
      confirm_password: form.confirmPassword,
    };
    console.log(details);

    try {
      const { data } = await axios.post(
        process.env.NEXT_PUBLIC_SERVER_DOMAIN + "/auth/reset-password",
        details
      );
      setIsLoading(false);
      toast.success(data.msg);
      router.push("/login");
      console.log(data);
    } catch (error: unknown) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.msg || "Something went wrong");
      } else {
        toast.error("An unexpected error occurred");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className='h-screen bg-gray-100 flex items-center justify-center p-8'>
      <div className='w-full max-w-md space-y-8'>
        {/* Logo and Header */}
        <div className='text-center space-y-2'>
          <div className='flex flex-col items-center justify-center space-x-2'>
            <div className='flex justify-center'>
              <Image
                src={"/logo.svg"}
                alt='png'
                height={100}
                width={100}
                className='w-[70px] mb-2 h-[90px] object-cover'
              />
            </div>
            <Image
              src={"/blueprint.svg"}
              alt='png'
              height={100}
              width={100}
              className='w-[250px] h-[60px] object-cover'
            />
          </div>

          <div className=''>
            <h1 className='text-4xl font-normal text-gray-900'>
              Reset Password
            </h1>
          </div>
        </div>

        {/* Forgot Password Form */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <div className='relative'>
              <Label
                htmlFor='confirmPassword'
                className='text-sm font-medium text-gray-700'
              >
                Password
              </Label>
              <Input
                id='password'
                type={!showOldPassword ? "text" : "password"}
                value={form.Password}
                onChange={(e) => {
                  setForm({ ...form, Password: e.target.value });
                }}
                placeholder='••••••••••••'
                className='mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white'
              />
              <button
                type='button'
                onClick={() => setShowOldPassword(!showOldPassword)}
                className='absolute right-3 top-11 transform -translate-y-1/2 text-gray-400'
              >
                {showOldPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
            <div className='relative mt-2'>
              <Label
                htmlFor='confirmPassword'
                className='text-sm font-medium text-gray-700'
              >
                Confirm Password
              </Label>
              <Input
                id='password'
                type={showconfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => {
                  setForm({ ...form, confirmPassword: e.target.value });
                }}
                placeholder='••••••••••••'
                className='mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white'
              />
              <button
                type='button'
                onClick={() => setconfirmPassword(!showconfirmPassword)}
                className='absolute right-3 top-11 transform -translate-y-1/2 text-gray-400'
              >
                {showOldPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
          </div>

          <Button
            type='submit'
            className='w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium'
          >
            {isLoading ? (
              <svg
                className='animate-spin h-5 w-5 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z'
                />
              </svg>
            ) : (
              "Send Reset Link"
            )}
            Send Reset Link
          </Button>
        </form>
      </div>
    </div>
  );
}
