"use client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { X, Check, Plus } from "lucide-react";

interface Signer {
  id: number;
  name: string;
  email: string;
  status: "signed" | "not_signed";
  signedDate?: string;
  isCurrentUser?: boolean;
}

const mockSigners: Signer[] = [
  {
    id: 1,
    name: "You (Alex)",
    email: "",
    status: "signed",
    isCurrentUser: true,
  },
  {
    id: 2,
    name: "Busayo Ajim",
    email: "busayoajim@greymail.com",
    status: "signed",
    signedDate: "2025-07-21 03:54",
  },
  {
    id: 3,
    name: "Liberty Temi",
    email: "libtemiq3@greymail.com",
    status: "not_signed",
  },
];

export function ResendModal() {
  const [open, setOpen] = useState(false);
  const [signers, setSigners] = useState(mockSigners);

  const handleResendInvite = (signerId: number) => {
    // Handle resend invite logic here
    console.log(`Resending invite to signer ${signerId}`);
    // You could show a toast notification here
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getSignerLabel = (signer: Signer, index: number) => {
    if (signer.isCurrentUser) return signer.name;
    return `Signer ${index}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <p className='cursor-pointer '>Resend</p>
      </DialogTrigger>
      <DialogContent className='max-w-lg bg-white text-gray-900 rounded-lg border p-0 max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <DialogHeader className='flex flex-row items-center justify-between p-6 pb-4'>
          <DialogTitle className='text-xl font-semibold text-gray-900'>
            Resend Invite
          </DialogTitle>
        </DialogHeader>

        <div className='px-6 pb-6 space-y-6'>
          {/* Signers List */}
          <div className='space-y-4'>
            {signers.map((signer, index) => (
              <div key={signer.id} className='space-y-1'>
                {/* Signer Label */}
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-[#141414]'>
                    {getSignerLabel(signer, index)}
                  </span>
                  <div className='flex items-center gap-2'>
                    {signer.status === "signed" ? (
                      <>
                        <Check className='h-4 w-4 text-green-500' />
                        <span className='text-sm text-gray-600'>Signed</span>
                      </>
                    ) : (
                      <>
                        <X className='h-4 w-4 text-red-500' />
                        <span className='text-sm text-gray-600'>
                          Not Signed
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Signer Details */}
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                <div className='text-sm text-[#737373]'>{signer.name}</div>
                    {signer.email && (
                      <div className='text-sm text-gray-500'>
                        {signer.email}
                      </div>
                    )}
                  </div>
                  <div className='flex items-center gap-2'>
                    {signer.status === "not_signed" && (
                      <Button
                        size='sm'
                        onClick={() => handleResendInvite(signer.id)}
                        className='bg-[#268DE9] hover:bg-blue-700 text-white text-xs px-3 py-1'
                      >
                        Resend Invite
                      </Button>
                    )}
                    {signer.signedDate && (
                      <span className='text-xs text-gray-400'>
                        {signer.signedDate}
                      </span>
                    )}
                    {signer.status === "not_signed" && !signer.signedDate && (
                      <span className='text-xs text-gray-400'>-</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* New Signer Button */}
          <Button className='w-[120px] bg-[#268DE9] hover:bg-blue-700 text-white'>
            <Plus className='w-4 h-4 mr-2' />
            New Signer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
