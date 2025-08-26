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
import { useContext, useEffect, useState } from "react";
import { Mail, Plus } from "lucide-react";
import axios from "axios";
import { UserContext } from "@/app/AppContext";
import toast from "react-hot-toast";
import Image from "next/image";
interface FormatDate {
  (dateString: string): string;
}
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

interface DocumentId {
  documentId: string;
  onDelete?: () => void;
}
export function ViewDetails({ documentId, onDelete }: DocumentId) {
  const [open, setOpen] = useState(false);
  const [showNewSignerForm, setShowNewSignerForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const { userAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;
  const [isLoading, setIsLoading] = useState(false);

  const [details, setDetails] = useState<DocumentDetails>({
    name: "",
    type: "",
    size: "",
    createdBy: "",
    createdDate: "",
    signers: [],
  });
  const fetchDocumentDetails = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_DOMAIN}/api/document/${documentId}`,

        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      const formattedData = {
        name: data?.document.document_name,
        type: data?.document.document_type,
        size: data?.document.document_size,
        createdBy: data?.document.created_at,
        createdDate: data?.document.created_by,
        signers: data?.document.signers,
      };
      setDetails(formattedData);
      console.log(formattedData);
    } catch (error: unknown) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data?.msg || "Something went wrong");
      } else {
        console.log("An unexpected error occurred");
      }
    }
  };
  useEffect(() => {
    if (documentId) {
      fetchDocumentDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Reset form and hide it
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
    setShowNewSignerForm(false);
  };

  const handleCancel = () => {
    // Reset form and hide it
    setFirstName("");
    setLastName("");
    setEmail("");
    setShowNewSignerForm(false);
  };
  const formatDate: FormatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <p className='cursor-pointer hover:text-blue-600'>View Details</p>
      </DialogTrigger>
      <DialogContent className='w-[350px] md:w-full bg-white text-gray-900 rounded-lg border p-0 max-h-[90vh] overflow-auto'>
        {/* Header */}
        <DialogHeader className='flex flex-row items-center justify-between px-6 py-2  border-b border-gray-100'>
          <DialogTitle className='text-lg font-semibold text-gray-900'>
            {details.name}
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
                <span className='text-gray-900'>Document Name</span>
                <div className='text-gray-600'>{details.name}</div>
              </div>
              <div>
                <span className='text-gray-900'>Type</span>
                <div className='text-gray-600'>{details.type}</div>
              </div>
              <div>
                <span className='text-gray-900'>Size</span>
                <div className='text-gray-600'>{details.size}</div>
              </div>
              <div>
                <span className='text-gray-900'>Created By</span>
                <div className='text-gray-600'>
                  {formatDate(details.createdBy)}
                </div>
              </div>
            </div>
          </div>

          {/* Signers Section */}
          <div className='px-6 pb-4'>
            <h3 className='text-sm font-medium border-b-[#D4D4D4] text-gray-900 mb-3'>
              Signer
            </h3>
            <div className='space-y-3'>
              {details.signers.map((signer, i) => (
                <div key={i} className='flex items-center justify-between'>
                  <div>
                    <div className='text-sm text-gray-900'>{signer.name}</div>
                    {signer.email && (
                      <div className='text-xs text-gray-500'>
                        {signer.email}
                      </div>
                    )}
                  </div>
                  <div className='flex items-center gap-2'>
                    {signer.status === "signed" ? (
                      <Image
                        src={"/tick.svg"}
                        alt=''
                        width={16}
                        height={16}
                        className='w-4 h-4'
                      />
                    ) : (
                      <Image
                        src={"/x.svg"}
                        alt=''
                        width={16}
                        height={16}
                        className='w-4 h-4'
                      />
                    )}
                    <span className='text-sm text-gray-600'>
                      {signer.status}
                    </span>
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
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
