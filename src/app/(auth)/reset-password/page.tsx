"use client";

import type React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle forgot password logic here
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className='h-screen bg-gray-100 flex items-center justify-center p-8'>
        <div className='w-full max-w-md space-y-8 text-center'>
          {/* Logo */}
          <div className='flex items-center justify-center space-x-2'>
            <div className='w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center'>
              <div className='w-6 h-6 bg-white rounded-full relative'>
                <div className='absolute top-1 left-1 w-2 h-2 bg-blue-600 rounded-full'></div>
              </div>
            </div>
            <span className='text-2xl font-semibold text-gray-900'>
              Blueprint<span className='text-blue-600'>.doc</span>
            </span>
          </div>

          <div className='space-y-4'>
            <h1 className='text-3xl font-bold text-gray-900'>
              Check Your Email
            </h1>
            <p className='text-gray-600'>
              We&apos;ve sent a password reset link to <strong>{email}</strong>
            </p>
            <p className='text-sm text-gray-500'>
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setIsSubmitted(false)}
                className='text-blue-600 hover:text-blue-700 underline'
              >
                try again
              </button>
            </p>
          </div>

          <Link href='/login'>
            <Button
              variant='outline'
              className='w-full border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent'
            >
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
            <h1 className='text-4xl font-normal text-gray-900'>Reset Password</h1>
          </div>
        </div>

        {/* Forgot Password Form */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <Label
              htmlFor='password'
              className='text-sm font-medium text-gray-700'
            >
              New Password
            </Label>
            <Input
              id='password'
              type='password'
              placeholder='********'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white'
              required
            />
            <Label
              htmlFor='password'
              className='text-sm font-medium text-gray-700'
            >
              Confirm New Password
            </Label>
            <Input
              id='password'
              type='password'
              placeholder='*********'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='mt-1 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white'
              required
            />
          </div>

          <Button
            type='submit'
            className='w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium'
          >
            Send Reset Link
          </Button>
        </form>
      </div>
    </div>
  );
}
