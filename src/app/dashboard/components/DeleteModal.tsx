"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { UserContext } from "@/app/AppContext";
interface DocumentId {
  documentId: string;
  onDelete?: () => void;
}
export function DeleteModal({ documentId, onDelete }: DocumentId) {
  const [open, setOpen] = useState(false);
  const { userAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;
  const [isLoading, setIsLoading] = useState(false);
  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_DOMAIN}/api/documents/delete`,
        {
          data: { document_id: documentId }, // Correctly pass public_id in data
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      toast.success("Document succesfully deleted");
      setIsLoading(false);
      setOpen(false);
      if (onDelete) onDelete();
      console.log(data.message);
    } catch (error: unknown) {
      setOpen(false);
      setIsLoading(false);

      console.log(error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.msg || "Something went wrong");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <p className='cursor-pointer text-sm text-red-600 '>Delete</p>
      </DialogTrigger>

      <DialogContent className='bg-[#1E1E1E] text-white max-w-sm rounded-xl p-6 text-center shadow-xl'>
        <DialogHeader>
          <div className='flex flex-col items-center space-y-4'>
            <Trash2 className='w-10 h-10 text-gray-300' />
            <p className='text-base font-medium'>
              Are you sure you want delete this document?
            </p>
          </div>
        </DialogHeader>
        <DialogTitle>
          <div className='mt-6 flex justify-center gap-4'>
            <Button
              onClick={() => setOpen(false)}
              className='bg-transparent border border-gray-600 hover:bg-gray-700 text-white w-20'
            >
              No
            </Button>
            <Button
              onClick={handleDelete}
              className='bg-blue-600 hover:bg-blue-700 text-white w-20'
              disabled={isLoading}
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
              ) : (
                "Yes"
              )}
            </Button>
          </div>
        </DialogTitle>
      </DialogContent>
    </Dialog>
  );
}
