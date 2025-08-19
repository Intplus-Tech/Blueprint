import { removeFromSession } from "@/app/(auth)/components/session";
import { UserContext } from "@/app/AppContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, Settings } from "lucide-react";
import Image from "next/image";
import { useContext } from "react";
import toast from "react-hot-toast";

export default function Header() {
  const { setUserAuth } = useContext(UserContext);
  const handleLogout = () => {
    removeFromSession("user");
    toast.success("Log Out Successful");
   setUserAuth(null)
  };
  return (
    <header className='w-full h-16 bg-white shadow-sm flex items-center justify-between px-10'>
      {/* Left: Logo */}
      <div className='flex items-center gap-2'>
        <Image
          src='/logo.svg'
          alt='Blueprint Logo'
          width={100}
          height={100}
          className='h-6 w-auto'
        />
        <Image
          src={"/blueprint.svg"}
          alt='png'
          height={100}
          width={100}
          className='w-[120px] mt-2 h-[30px] object-cover'
        />
      </div>

      {/* Middle: Search Bar */}
      <div className='flex-1 px-8'>
        <div className='w-full max-w-md mx-auto relative'>
          <input
            type='text'
            placeholder='Quick access to documents'
            className='w-full bg-gray-50 text-sm pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200'
          />
          <Image
            src='/search.svg'
            alt='Blueprint Logo'
            width={100}
            height={100}
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4'
          />
        </div>
      </div>

      {/* Right: Icons */}
      <div className='flex items-center gap-6'>
        <Settings className='w-5 h-5 text-gray-500 cursor-pointer' />

        <div className='relative cursor-pointer'>
          <Bell className='w-5 h-5 text-gray-500' />
          <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center'>
            3
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className='border-none focus:outline-none'
          >
            <LogOut className='w-5 h-5 text-red-500 cursor-pointer' />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleLogout}>
              <p className=' text-red-500 cursor-pointer'>Log Out</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
