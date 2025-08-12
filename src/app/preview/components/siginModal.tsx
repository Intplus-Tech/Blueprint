import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useContext, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "@/app/(auth)/components/session";
import { UserContext } from "@/app/AppContext";

export function AuthModal() {
  const [open, setOpen] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const { setUserAuth } = useContext(UserContext);
  const [showconfirmPassword, setconfirmPassword] = useState(false);

  const [mode, setMode] = useState<"login" | "signup">("login");
  const isLogin = mode === "login";

  const [form, setForm] = useState({
    fullName: "",
    Email: "",
    Password: "",
    confirmPassword: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (form.Email.length < 1) {
      toast.error("Update all fields");
      setIsLoading(false);
      return;
    }
    const details = {
      password: form.Password,
      email: form.Email,
    };
    console.log(details);

    try {
      const { data } = await axios.post(
        process.env.NEXT_PUBLIC_SERVER_DOMAIN + "/auth/login",
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
  const handleSignup = async (e: React.FormEvent) => {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className='text-blue-500 underline mr-1'>
          {isLogin ? "Log In" : "Sign Up"}
        </button>
      </DialogTrigger>
      <DialogContent className='min-w-[900px]  items-center flex  h-[96vh]  bg-white text-gray-900 rounded-2xl border-0 p-8'>
        <DialogHeader className='text-center space-y-2'>
          {/* Logo */}
          <div className='flex justify-center w-[400px]'>
            <Image
              src={"/logo.svg"}
              alt='png'
              height={100}
              width={100}
              className='w-[70px] mb-2 h-[86px] object-cover'
            />
          </div>

          <DialogTitle className='text-3xl font-semibold text-gray-900 mx-auto'>
            {isLogin ? "Log in" : "Sign Up"}
          </DialogTitle>

          <p className='text-black text-sm mx-auto'>
            {isLogin
              ? "Welcome back! Please enter your details."
              : "Create your account to get started."}
          </p>
        </DialogHeader>

        <div className='space-y-2 mt-2'>
          {/* Google Sign In Button */}
          <Button
            variant='outline'
            className='w-full h-12 border-gray-300 hover:bg-gray-50 bg-transparent'
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
          <div className='flex items-center '>
            <div className='flex-1 border-t border-gray-300'></div>
            <span className='px-4 text-sm text-gray-500'>OR</span>
            <div className='flex-1 border-t border-gray-300'></div>
          </div>

          {/* Form Fields */}
          <div className='space-y-2 min-w-[400px]'>
            {!isLogin && (
              <div>
                <Label
                  htmlFor='fullName'
                  className='text-sm font-medium text-gray-700'
                >
                  Full Name
                </Label>
                <Input
                  id='fullName'
                  value={form.fullName}
                  onChange={(e) => {
                    setForm({ ...form, fullName: e.target.value });
                  }}
                  placeholder='John Doe'
                  className='mt-1 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                />
              </div>
            )}

            <div>
              <Label
                htmlFor='email'
                className='text-sm font-medium text-gray-700'
              >
                Email
              </Label>
              <Input
                id='email'
                value={form.Email}
                onChange={(e) => {
                  setForm({ ...form, Email: e.target.value });
                }}
                type='email'
                placeholder='john@impresa.com'
                className='mt-1 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              />
            </div>

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
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'
              >
                {showOldPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>

            {!isLogin && (
           
            <div className='relative'>
              <Label
                htmlFor='confirmPassword'
                className='text-sm font-medium text-gray-700'
              >
              Confirm  Password
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
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'
              >
                {showOldPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
            )}

            {isLogin && (
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='remember'
                    checked={rememberPassword}
                    onCheckedChange={(checked) =>
                      setRememberPassword(checked as boolean)
                    }
                  />
                  <Label htmlFor='remember' className='text-sm text-gray-600'>
                    Remember Password
                  </Label>
                </div>
                <Button
                  variant='link'
                  className='text-sm text-blue-600 hover:text-blue-700 p-0'
                >
                  Forgot Password
                </Button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            onClick={isLogin ? handleLogin : handleSignup}
            className='w-full h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium mt-3'
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
            ) : isLogin ? (
              "Log In"
            ) : (
              "Create Account"
            )}
          </Button>

          {/* Switch Mode */}
          <div className='text-center mt-3'>
            <span className='text-sm text-gray-600'>
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
            </span>
            <Button
              variant='link'
              className='text-sm text-blue-600 hover:text-blue-700 p-0 font-medium'
              onClick={() => setMode(isLogin ? "signup" : "login")}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
