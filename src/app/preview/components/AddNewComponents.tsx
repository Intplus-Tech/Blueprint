"use client";
import Image from "next/image";
import { AuthModal } from "./siginModal";
import { useContext, useEffect } from "react";
import { UserContext } from "@/app/AppContext";

const AddNewComponents = () => {
  const { userAuth } = useContext(UserContext);

  const access_token = userAuth?.access_token;
  const auth = userAuth?.access_token ? true : false;
  useEffect(() => {
    if (access_token) {
    }
  }, [access_token]);

  return (
    <div>
      {auth ? (
        <>
          <div className='flex items-center gap-2 cursor-pointer hover:opacity-80 py-1'>
            {" "}
            <Image
              src={"/pc.svg"}
              alt='png'
              height={10}
              width={10}
              className='w-[17px] h-[17px] object-cover'
            />{" "}
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
