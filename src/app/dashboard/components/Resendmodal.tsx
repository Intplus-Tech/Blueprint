"use client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useContext, useEffect, useState } from "react";
import { X, Check, Plus, Mail } from "lucide-react";
import axios from "axios";
import { UserContext } from "@/app/AppContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

interface Signer {
  id: number;
  name: string;
  email: string;
  status: string;
  signedDate?: string;
  isCurrentUser?: boolean;
}

interface DocumentId {
  documentId: string;
  onDelete?: () => void;
}
export function ResendModal({ documentId, onDelete }: DocumentId) {
  const [open, setOpen] = useState(false);
  const [showNewSignerForm, setShowNewSignerForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState<Signer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { userAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;

  const handleResendInvite =async  (name: string, email: string) => {
    setIsLoading(true);

    // Handle resend invite logic here
    const [firstName, lastName] = name.split(" ");

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
    // You could show a toast notification here
  };

  const handleCancel = () => {
    // Reset form and hide it
    setFirstName("");
    setLastName("");
    setEmail("");
    setShowNewSignerForm(false);
  };
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
  const getSignerLabel = (signer: Signer, index: number) => {
    if (signer.isCurrentUser) return signer.name;
    return `Signer ${index + 1}`;
  };

 const resendDetails = async () => {
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_DOMAIN}/api/documents/${documentId}/resend`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    interface ResendApiItem {
      name: string;
      email: string;
      signed_at?: string | null;
      status: string;
    }

    interface FormattedSigner {
      id: number;
      name: string;
      email: string;
      signedDate: string;
      status: string;
    }

    // Map over data.signers, not data
    const formattedData: FormattedSigner[] = (data.signers as ResendApiItem[]).map(
      (item: ResendApiItem, index: number): FormattedSigner => ({
        id: index + 1, // generate id since backend doesn’t give a unique one
        name: item.name,
        email: item.email,
        signedDate: item.signed_at ?? "Not signed yet",
        status: item.status,
      })
    );

    setDetails(formattedData);
    console.log(formattedData, "formatted signers");
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
      resendDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);
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
            {details.length === 0
              ? "No Invite Sent yet"
              : details.map((signer, index) => (
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
                            <span className='text-sm text-gray-600'>
                              Signed
                            </span>
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
                        <div className='text-sm text-[#737373]'>
                          {signer.name}
                        </div>
                        {signer.email && (
                          <div className='text-sm text-gray-500'>
                            {signer.email}
                          </div>
                        )}
                      </div>

                      <div className='flex items-center gap-2'>
                        {signer.status !== "signed" && (
                          <Button
                            size='sm'
                            onClick={() =>
                              handleResendInvite(signer.name, signer.email)
                            }
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
                        {signer.status === "not_signed" &&
                          !signer.signedDate && (
                            <span className='text-xs text-gray-400'>-</span>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
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
