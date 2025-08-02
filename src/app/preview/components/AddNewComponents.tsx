"use client";
import Image from "next/image";
import { AuthModal } from "./siginModal";

const AddNewComponents = () => {
  const auth = true;
  return (
    <div>
      {auth ? (
        <>
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 py-1">
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
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 py-1">
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
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 py-1">
            {" "}
            <Image
              src={"/one.svg"}
              alt='png'
              height={10}
              width={10}
              className='w-[17px] h-[17px] object-cover'
            />{" "}
            OneDrive
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 py-1">
            {" "}
            <Image
              src={"/box.svg"}
              alt='png'
              height={10}
              width={10}
              className='w-[17px] h-[17px] object-cover'
            />{" "}
            Drop Box
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
