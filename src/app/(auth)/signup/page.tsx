/* eslint-disable @next/next/no-img-element */
"use client";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { storeInSession } from "../components/session";
import { UserContext } from "@/app/AppContext";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showconfirmPassword, setconfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const router = useRouter();

  const { userAuth, setUserAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;
  const [form, setForm] = useState({
    fullName: "",
    Email: "",
    Password: "",
    confirmPassword: "",
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (form.fullName.length < 1) {
      toast.error("Update all fields");
      setIsLoading(false);
      return;
    }
    const details = {
      username: form.fullName,
      password: form.Password,
      confirm_password: form.confirmPassword,
      email: form.Email,
    };
    console.log(details);

    try {
      const { data } = await axios.post(
        process.env.NEXT_PUBLIC_SERVER_DOMAIN + "/auth/register",
        details
      );
      setIsLoading(false);
      toast.success(data.msg);
      storeInSession("user", JSON.stringify(data));
      setUserAuth(data);
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
  useEffect(() => {
    if (access_token) {
      // router.push("/");
      return
    }
  }, [access_token,router]);
  return (
    <div className='min-h-screen flex'>
      {/* Left Side - Image */}
      <div className='hidden lg:flex lg:w-1/2 relative'>
        <img
          src='/bg.svg'
          alt='Collaborative workspace with people working around a table'
          className='w-full h-full object-cover'
        />
      </div>

      {/* Right Side - Sign Up Form */}
      <div className='w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50'>
        <div className='w-full max-w-md space-y-8'>
          {/* Logo and Header */}
          <div className='flex text-center flex-col items-center justify-center space-x-2'>
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

            <div className='space-y-2 '>
              <h1 className='text-4xl font-normal text-gray-900'>Sign Up</h1>
              <p className='text-gray-600'>
                Create your account to get started.
              </p>
            </div>
          </div>

          {/* Sign Up Form */}
          <div className='space-y-1'>
            {/* Google Sign In Button */}
            <Button
              variant='outline'
              className='w-full h-12 border-gray-300 hover:bg-gray-50 bg-white'
            >
              <svg className='w-5 h-5 mr-3' viewBox='0 0 24 24'>
                <path
                  fill='#4285F4'
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                />
                <path
                  fill='#34A853'
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                />
                <path
                  fill='#FBBC05'
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                />
                <path
                  fill='#EA4335'
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                />
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className='flex items-center'>
              <div className='flex-1 border-t border-gray-300'></div>
              <span className='px-4 text-sm text-gray-500'>OR</span>
              <div className='flex-1 border-t border-gray-300'></div>
            </div>

            {/* Form Fields */}
            <form className='space-y-1' onSubmit={handleSubmit}>
              <div>
                <Label
                  htmlFor='fullName'
                  className='text-sm font-medium text-gray-700'
                >
                  Full Name
                </Label>
                <Input
                  id='fullName'
                  placeholder='John Doe'
                  value={form.fullName}
                  onChange={(e) => {
                    setForm({ ...form, fullName: e.target.value });
                  }}
                  className='mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white'
                />
              </div>

              <div>
                <Label
                  htmlFor='email'
                  className='text-sm font-medium text-gray-700'
                >
                  Email
                </Label>
                <Input
                  id='email'
                  type='email'
                  value={form.Email}
                  onChange={(e) => {
                    setForm({ ...form, Email: e.target.value });
                  }}
                  placeholder='john@impresa.com'
                  className='mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white'
                />
              </div>

              <div>
                <Label
                  htmlFor='password'
                  className='text-sm font-medium text-gray-700'
                >
                  Password
                </Label>
                <div className='relative'>
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
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                  >
                    {showOldPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label
                  htmlFor='confirmPassword'
                  className='text-sm font-medium text-gray-700'
                >
                  Confirm Password
                </Label>
                <div className='relative'>
                  <Input
                    id='confirmPassword'
                    type={showconfirmPassword ? "password" : "text"}
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
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                  >
                    {showconfirmPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
              </div>

              <Button className='w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium'>
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
                  "Log In"
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className='text-center'>
              <span className='text-sm text-gray-600'>
                Already have an account?{" "}
              </span>
              <Link
                href='/login'
                className='text-sm text-blue-600 hover:text-blue-700 font-medium'
              >
                Sign In
              </Link>
            </div>

            {/* Footer */}
            <div className='text-center pt-4'>
              <p className='text-xs text-gray-500'>
                Powered By: <span className='font-medium'>AI Tomey</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
