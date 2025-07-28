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
import { useState } from "react";
import {  Mail, Plus, Check } from "lucide-react";

interface Signer {
  id: number;
  name: string;
  email: string;
  status: "signed" | "pending";
  signedDate?: string;
}

interface DocumentDetails {
  name: string;
  type: string;
  size: string;
  createdBy: string;
  createdDate: string;
  signers: Signer[];
}

const mockDocument: DocumentDetails = {
  name: "Sales Agreement.pdf",
  type: "PDF",
  size: "145.8 KB",
  createdBy: "2025-07-21 03:54",
  createdDate: "2025-07-21 03:54",
  signers: [
    {
      id: 1,
      name: "You (Alex)",
      email: "",
      status: "signed",
      signedDate: "2025-07-21 03:54",
    },
    {
      id: 2,
      name: "Busayo Ajim",
      email: "busayoajim@gmail.com",
      status: "signed",
      signedDate: "2025-07-21 03:54",
    },
  ],
};

export function ViewDetails() {
  const [open, setOpen] = useState(false);
  const [showNewSignerForm, setShowNewSignerForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log({ firstName, lastName, email });

    // Reset form and hide it
    setFirstName("");
    setLastName("");
    setEmail("");
    setShowNewSignerForm(false);
  };

  const handleCancel = () => {
    // Reset form and hide it
    setFirstName("");
    setLastName("");
    setEmail("");
    setShowNewSignerForm(false);
  };



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <p className='cursor-pointer hover:text-blue-600'>View Details</p>
      </DialogTrigger>
      <DialogContent className='max-w-md bg-white text-gray-900 rounded-lg border p-0 max-h-[90vh] overflow-auto'>
        {/* Header */}
        <DialogHeader className='flex flex-row items-center justify-between px-6 py-2  border-b border-gray-100'>
          <DialogTitle className='text-lg font-semibold text-gray-900'>
            {mockDocument.name}
          </DialogTitle>
        </DialogHeader>

        <div className='overflow-y-auto flex-1'>
          {/* Properties Section */}
          <div className='px-6 py-2 pb-4'>
            <h3 className='text-sm   border-b-[#D4D4D4] font-medium text-gray-900 mb-3'>
              Properties
            </h3>
            <div className='space-y-3 text-sm'>
              <div>
                <span className='text-gray-600'>Document Name</span>
                <div className='text-gray-900'>{mockDocument.name}</div>
              </div>
              <div>
                <span className='text-gray-600'>Type</span>
                <div className='text-gray-900'>{mockDocument.type}</div>
              </div>
              <div>
                <span className='text-gray-600'>Size</span>
                <div className='text-gray-900'>{mockDocument.size}</div>
              </div>
              <div>
                <span className='text-gray-600'>Created By</span>
                <div className='text-gray-900'>{mockDocument.createdBy}</div>
              </div>
            </div>
          </div>

          {/* Signers Section */}
          <div className='px-6 pb-4'>
            <h3 className='text-sm font-medium border-b-[#D4D4D4] text-gray-900 mb-3'>Signer</h3>
            <div className='space-y-3'>
              {mockDocument.signers.map((signer) => (
                <div
                  key={signer.id}
                  className='flex items-center justify-between'
                >
                  <div>
                    <div className='text-sm text-gray-900'>{signer.name}</div>
                    {signer.email && (
                      <div className='text-xs text-gray-500'>
                        {signer.email}
                      </div>
                    )}
                  </div>
                  <div className='flex items-center gap-2'>
                    <Check className='h-4 w-4 text-green-500' />
                    <span className='text-sm text-gray-600'>Signed</span>
                    {signer.signedDate && (
                      <span className='text-xs text-gray-400'>
                        {signer.signedDate}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Signer Button or Form */}
          <div className='px-6 pb-6'>
            {!showNewSignerForm ? (
              <Button
                onClick={() => setShowNewSignerForm(true)}
                className='w-[150px] bg-[#268DE9] hover:bg-blue-700 text-white'
              >
                <Plus className='w-4 h-4 mr-2' />
                New Signer
              </Button>
            ) : (
              <div className='bg-gray-50 rounded-lg p-4 space-y-4'>
                <h4 className='text-sm font-medium text-gray-900'>
                  New Signer
                </h4>
                <form onSubmit={handleSubmit} className='space-y-4'>
                  {/* Name Fields */}
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-1'>
                      <Label
                        htmlFor='firstName'
                        className='text-xs font-medium text-gray-700'
                      >
                        First name
                      </Label>
                      <Input
                        id='firstName'
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder='Marcus'
                        className='h-8 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        required
                      />
                    </div>
                    <div className='space-y-1'>
                      <Label
                        htmlFor='lastName'
                        className='text-xs font-medium text-gray-700'
                      >
                        Last name
                      </Label>
                      <Input
                        id='lastName'
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder='Armstrong'
                        className='h-8 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        required
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className='space-y-1'>
                    <Label
                      htmlFor='email'
                      className='text-xs font-medium text-gray-700'
                    >
                      Email Address
                    </Label>
                    <div className='relative'>
                      <Mail className='absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400' />
                      <Input
                        id='email'
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='email@domain.com'
                        className='h-8 pl-7 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        required
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className='flex justify-end gap-2 pt-2'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={handleCancel}
                      className='px-3 py-1 text-xs border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent'
                    >
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      size='sm'
                      className='px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white'
                    >
                      Send Invite
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
