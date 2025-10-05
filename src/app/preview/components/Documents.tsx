"use client";

import type React from "react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

import { ChevronDown, Upload, Cloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useContext, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import axios from "axios";
import { UserContext } from "@/app/AppContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export function NewDocument() {
  const [open, setOpen] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='bg-[#268DE9] cursor-pointer hover:bg-blue-700 text-white w-full sm:w-auto'>
          <Plus className='w-4 h-4 mr-2' />
          New Document
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-md mx-auto bg-white/65 text-gray-900 rounded-lg border shadow-lg p-8'>
        <DialogHeader className='sr-only'>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col items-center space-y-6'>
          <div className='flex justify-center'>
            <Image
              src={"/cloud.svg"}
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
              !access_token ? handleDeviceUpload : handleDeviceUploadForUser
            }
            className='hidden'
          />

          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              className='border-none focus:outline-none'
            >
              <Button
                className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-medium flex items-center gap-2'
                size='default'
              >
                <Upload className='w-4 h-4' />
                Upload
                <ChevronDown className='w-4 h-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='center' className='w-40'>
              <DropdownMenuItem
                onClick={() => inputRef.current?.click()}
                className='flex items-center gap-2'
              >
                <Image
                  src={"/pc.svg"}
                  alt='device'
                  height={17}
                  width={17}
                  className='w-[17px] h-[17px] object-cover'
                />
                My Device
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <p className='text-gray-800 text-sm text-center'>
            Drag your files here
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
