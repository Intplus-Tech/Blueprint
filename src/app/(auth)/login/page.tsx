/* eslint-disable @next/next/no-img-element */
"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  const [rememberPassword, setRememberPassword] = useState(false)

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="/bg.svg"
          alt="Collaborative workspace with people working around a table"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-6">
          {/* Logo and Header */}
          <div className="text-center space-y-4">
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

            <div className="space-y-2">
              <h1 className="text-4xl font-normal text-gray-900">Log in</h1>
              <p className="text-gray-600">Welcome back! Please enter your details.</p>
            </div>
          </div>

          {/* Login Form */}
          <div className="space-y-4">
            {/* Google Sign In Button */}
            <Button variant="outline" className="w-full h-12 border-gray-300 hover:bg-gray-50 bg-white">
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Form Fields */}
            <form className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@impresa.com"
                  className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberPassword}
                    onCheckedChange={(checked) => setRememberPassword(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Remember Password
                  </Label>
                </div>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                  Forgot Password
                </Link>
              </div>

              <Button className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium">Log In</Button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center">
              <span className="text-sm text-gray-600">Don&apos;t have an account? </span>
              <Link href="/signup" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Sign Up
              </Link>
            </div>

            {/* Footer */}
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                Powered By: <span className="font-medium">AI Tomey</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
