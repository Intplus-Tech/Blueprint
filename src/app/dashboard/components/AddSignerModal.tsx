"use client";

import type React from "react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useContext, useState } from "react";
import { Mail } from "lucide-react";
import axios from "axios";
import { UserContext } from "@/app/AppContext";
import toast from "react-hot-toast";

interface DocumentId {
  documentId: string;
  onDelete?: () => void;
}

export function AddSignerModal({ documentId, onDelete }: DocumentId) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const { userAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log({ access_token });
    setIsLoading(true);

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_DOMAIN}/api/documents/${documentId}/signers`,
        {
          first_name: firstName,
          last_name: lastName,
          email: email,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      toast.success(data.message);
      setIsLoading(false);
      if (onDelete) onDelete();
      setOpen(false);
    } catch (error: unknown) {
      setIsLoading(false);
      console.log(error);
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data?.msg || "Something went wrong");
        toast.error("Something went wrong");
      } else {
        console.log("An unexpected error occurred");
      }
    }
    // Reset form
    setFirstName("");
    setLastName("");
    setEmail("");
  };

  const handleCancel = () => {
    setOpen(false);
    // Reset form
    setFirstName("");
    setLastName("");
    setEmail("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <p>Add Signer</p>
      </DialogTrigger>
      <DialogContent className='max-w-md bg-white text-gray-900 rounded-lg border p-0'>
        {/* Header */}
        <DialogHeader className='flex flex-row items-center justify-between p-6 pb-4'>
          <DialogTitle className='text-lg font-semibold text-gray-900'>
            Add Signer
          </DialogTitle>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className='px-6 pb-6'>
          <div className='space-y-4'>
            {/* Name Fields */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label
                  htmlFor='firstName'
                  className='text-sm font-medium text-gray-700'
                >
                  First name
                </Label>
                <Input
                  id='firstName'
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder='Marcus'
                  className='h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label
                  htmlFor='lastName'
                  className='text-sm font-medium text-gray-700'
                >
                  Last name
                </Label>
                <Input
                  id='lastName'
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder='Armstrong'
                  className='h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className='space-y-2'>
              <Label
                htmlFor='email'
                className='text-sm font-medium text-gray-700'
              >
                Email Address
              </Label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='email@domain.com'
                  className='h-10 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  required
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className='flex justify-end gap-3 mt-6'>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              className='px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white'
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
                "Send Invite"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
