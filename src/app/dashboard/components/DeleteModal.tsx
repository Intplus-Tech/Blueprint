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
import { useState } from "react";

export function DeleteModal() {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    console.log("Document deleted");
    setOpen(false);
    // Add your delete logic here (e.g., API call or Firestore delete)
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <p className='cursor-pointer text-sm text-red-600 '>
          Delete
        </p>
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
            >
              Yes
            </Button>
          </div>
        </DialogTitle>
      </DialogContent>
    </Dialog>
  );
}
