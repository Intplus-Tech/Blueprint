"use client";
import Image from "next/image";
import { AuthModal } from "./siginModal";
import { useContext, useEffect, useRef } from "react";
import { UserContext } from "@/app/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

const AddNewComponents = () => {
  const { userAuth } = useContext(UserContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const access_token = userAuth?.access_token;
  const auth = userAuth?.access_token ? true : false;
  const csrf_token = userAuth?.csrf_token;
  const router = useRouter()
  useEffect(() => {
    if (access_token) {
    }
  }, [access_token]);

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
    window.location.reload();
      console.log(data.url);
      sessionStorage.setItem("UploadedFile", data.url);
      sessionStorage.setItem("UploadedFileName", file.name);
      toast.dismiss(toastId);

      toast.success("success");
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
      window.location.reload();
      console.log(data.url);
      console.log(data);
      sessionStorage.setItem("UploadedFile", data.url);
      sessionStorage.setItem("UploadedFileName", file.name);
      toast.dismiss(toastId);

      toast.success("success");
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
    <div>
      {auth ? (
        <>
          <div
            onClick={() => inputRef.current?.click()}
            className='flex items-center gap-2 cursor-pointer hover:opacity-80 py-1'
          >
            {" "}
            <Image
              src={"/pc.svg"}
              alt='png'
              height={10}
              width={10}
              className='w-[17px] h-[17px] object-cover'
            />{" "}
            <input
              type='file'
              ref={inputRef}
              accept='.pdf'
              onChange={!auth ? handleDeviceUpload : handleDeviceUploadForUser}
              className='hidden'
            />
            My Device
          </div>
          <div className='flex items-center gap-2 cursor-pointer hover:opacity-80 py-1'>
            {" "}
            <Image
              src={"/drive.svg"}
              alt='png'
              height={10}
              width={10}
              className='w-[17px] h-[17px] object-cover'
            />{" "}
            Google Drive
          </div>
        </>
      ) : (
        <div>
          <div
            className='flex flex-col gap-1'
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <p className='text-black font-bold'>New Document</p>
            <span className='font-extralight'>
              <AuthModal />
              to Add new document
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddNewComponents;
