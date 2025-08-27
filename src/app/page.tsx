"use client";
import { Button } from "@/components/ui/button";
import { ChevronDown, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { UserContext } from "./AppContext";

export default function Component() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { userAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;
  const csrf_token = userAuth?.csrf_token;
  const handleDeviceUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    const file = files[0];
    console.log(file);
    const formData = new FormData();
    formData.append("file", file);

    // if (file && file.type === "application/pdf") {

    //   const fileUrl = URL.createObjectURL(file);

    //   sessionStorage.setItem("UploadedFile", fileUrl);

    //   router.push("/preview");
    // }
    const toastId = toast.loading("Uploading your file...");
    try {
      if (file && file.type !== "application/pdf") {
        toast.dismiss(toastId);

        return toast.error("Upload a Pdf");
      }
      const { data } = await axios.post(
        process.env.NEXT_PUBLIC_SERVER_DOMAIN + "/api/guest-upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(data);
      sessionStorage.setItem("UploadedFile", data.url);
      sessionStorage.setItem("UploadedFileName", file.name);
      toast.dismiss(toastId);

      toast.success("success");
      router.push("/preview");
    } catch (error: unknown) {
      console.log(error);
      toast.dismiss(toastId);

      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Something went wrong");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };
  const handleDeviceUploadForUser = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    console.log("for logged user");

    const file = files[0];
    console.log(file);
    const formData = new FormData();
    formData.append("file", file);

    // if (file && file.type === "application/pdf") {

    //   const fileUrl = URL.createObjectURL(file);

    //   sessionStorage.setItem("UploadedFile", fileUrl);

    //   router.push("/preview");
    // }
    const toastId = toast.loading("Uploading your file...");
    try {
      if (file && file.type !== "application/pdf") {
        toast.dismiss(toastId);

        return toast.error("Upload a Pdf");
      }
      const { data } = await axios.post(
        process.env.NEXT_PUBLIC_SERVER_DOMAIN + "/api/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "X-CSRF-Token": csrf_token,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(data.url);
      console.log(data);
      sessionStorage.setItem("UploadedFile", data.url);
      sessionStorage.setItem("UploadedFileName", file.name);
      sessionStorage.setItem("documentId", data.document_id);

      toast.dismiss(toastId);

      toast.success("success");
      router.push("/preview");
    } catch (error: unknown) {
      console.log(error);
      toast.dismiss(toastId);

      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Something went wrong");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };
  const handleDriveUploaad = () => {};
  return (
    <div
      className='min-h-screen bg-black text-white  overflow-hidden absolute inset-0 bg-cover bg-center bg-no-repeat'
      style={{
        backgroundImage: `url('/background.png')`,
      }}
    >
      {/* Content */}
      <div className='relative z-10 flex flex-col min-h-screen'>
        {/* Header */}
        <header className='flex items-center justify-between p-6 lg:px-12'>
          <div className='flex items-center justify-center space-x-2'>
            <Image
              src={"/logo.png"}
              alt='png'
              height={100}
              width={100}
              className='w-[30px] mb-4 h-[40px] object-cover'
            />
            <span className='text-xl font-light'>
              <Image
                src={"/words.png"}
                alt='png'
                height={100}
                width={100}
                className='w-[110px] h-[30px]  md:w-[170px] md:h-[50px] object-cover'
              />
            </span>
          </div>

          {!access_token ? (
            <nav className='flex items-center space-x-3 md:space-x-6'>
              <Link
                href='/signup'
                className='text-white/80 hover:text-white hover:underline transition-colors'
              >
                Sign Up
              </Link>
              <span className='text-white/60'>/</span>
              <Link
                href='/login'
                className='text-white/80 hover:underline hover:text-white transition-colors'
              >
                Sign In
              </Link>
            </nav>
          ) : (
            <nav className='flex items-center space-x-3 md:space-x-6'>
              <Link
                href='/dashboard'
                className='text-white/80 hover:text-white hover:underline transition-colors'
              >
               Dashboard
              </Link>
            </nav>
          )}
        </header>

        {/* Main Content */}
        <main className='flex-1 flex flex-col items-center justify-center px-6 text-center'>
          <div className='max-w-4xl mx-auto space-y-8'>
            {/* Hero Text */}
            <div className='space-y-4'>
              <h1 className='text-5xl  lg:text-6xl font-normal tracking-wide'>
                Sign. Review. Lock.
              </h1>
              <p className='text-xl text-white/80 max-w-2xl mx-auto'>
                The only e-signature platform with built-in forensic AI
              </p>
            </div>

            {/* Upload Area */}
            <div className='mt-3'>
              <div className='border-2 border-dashed border-white/30 rounded-lg p-12 bg-white/15  max-w-lg mx-auto'>
                <div className='space-y-6'>
                  <div className='flex justify-center'>
                    <Image
                      src={"/upload.png"}
                      alt='png'
                      height={100}
                      width={100}
                      className='w-[40px] h-[40px] object-cover'
                    />
                  </div>
                  <input
                    type='file'
                    ref={inputRef}
                    accept='.pdf'
                    onChange={
                      !access_token
                        ? handleDeviceUpload
                        : handleDeviceUploadForUser
                    }
                    className='hidden'
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      className='border-none focus:outline-none'
                    >
                      <Button
                        className='bg-blue-500 w-33 hover:bg-blue-600 text-white px-6 py-2 rounded-sm font-medium'
                        size='default'
                      >
                        <Upload className='w-4 h-4 mr-2' />
                        Upload
                        <ChevronDown className='w-4 h-4 ml-2' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-33'>
                      <DropdownMenuItem
                        onClick={() => inputRef.current?.click()}
                      >
                        {" "}
                        <Image
                          src={"/pc.svg"}
                          alt='png'
                          height={10}
                          width={10}
                          className='w-[17px] h-[17px] object-cover'
                        />{" "}
                        My Device
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem onClick={handleDriveUploaad}>
                        {" "}
                        <Image
                          src={"/drive.svg"}
                          alt='png'
                          height={10}
                          width={10}
                          className='w-[17px] h-[17px] object-cover'
                        />{" "}
                        Google Drive
                      </DropdownMenuItem> */}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <p className='text-white/60 text-sm'>Drag your files here</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className='p-6 lg:px-12'>
          <div className='flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0'>
            <div className='text-white/60 text-sm'>
              © 2025 Torney.cc. All Rights Reserved
            </div>

            <nav className='flex items-center space-x-3 md:space-x-8 md:text-sm text-[10px]'>
              <Link
                href='/pricing'
                className='text-white/60 hover:text-white transition-colors'
              >
                Pricing
              </Link>
              <div className='flex items-center space-x-2'>
                <Link
                  href='/templates'
                  className='text-white/60 hover:text-white transition-colors'
                >
                  Templates
                </Link>
                <ChevronDown className='w-3 h-3 text-white/60' />
              </div>
              <Link
                href='/support'
                className='text-white/60 hover:text-white transition-colors'
              >
                Support
              </Link>
              <Link
                href='/terms'
                className='text-white/60 hover:text-white transition-colors'
              >
                Terms of Use
              </Link>
              <Link
                href='/privacy'
                className='text-white/60 hover:text-white transition-colors'
              >
                Privacy Policy
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
