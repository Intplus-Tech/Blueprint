"use client";

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Filter, Download, MoreVertical } from "lucide-react";
import Image from "next/image";
import { AddSignerModal } from "./AddSignerModal";
import { ViewDetails } from "./ViewDetails";
import { ResendModal } from "./Resendmodal";
import { DeleteModal } from "./DeleteModal";

interface Signer {
  name: string;
  avatar: string;
  signed: string;
}

interface Document {
  id: number;
  documentId: string;
  documentName: string;
  status: "pending" | "signed" | "expired";
  signers: Signer[];
  created: string;
  lastActivity: string;
}

const data: Document[] = [
  {
    id: 1,
    documentId: "144532",
    documentName: "Sales Agreement.pdf",
    status: "pending",
    signers: [
      {
        name: "Busayo",
        avatar: "/placeholder.svg?height=24&width=24",
        signed: "no",
      },
      {
        name: "James",
        avatar: "/placeholder.svg?height=24&width=24",
        signed: "no",
      },
      {
        name: "Gbemisola",
        avatar: "/placeholder.svg?height=24&width=24",
        signed: "yes",
      },
      {
        name: "Gabriel",
        avatar: "/placeholder.svg?height=24&width=24",
        signed: "no",
      },
    ],
    created: "21.03.2021",
    lastActivity: "14.07.2021",
  },
  {
    id: 2,
    documentId: "335645",
    documentName: "NDA_Template.pdf",
    status: "signed",
    signers: [
      {
        signed: "yes",
        name: "Busayo",
        avatar: "/placeholder.svg?height=24&width=24",
      },
      {
        signed: "no",
        name: "James",
        avatar: "/placeholder.svg?height=24&width=24",
      },
      {
        signed: "no",
        name: "Gbemisola",
        avatar: "/placeholder.svg?height=24&width=24",
      },
      {
        signed: "no",
        name: "Gabriel",
        avatar: "/placeholder.svg?height=24&width=24",
      },
    ],
    created: "21.03.2021",
    lastActivity: "14.07.2021",
  },
  {
    id: 3,
    documentId: "720472",
    documentName: "Sales Agreement.pdf",
    status: "expired",
    signers: [
      {
        signed: "no",
        name: "Busayo",
        avatar: "/placeholder.svg?height=24&width=24",
      },
      {
        signed: "yes",
        name: "James",
        avatar: "/placeholder.svg?height=24&width=24",
      },
      {
        signed: "yes",
        name: "Gbemisola",
        avatar: "/placeholder.svg?height=24&width=24",
      },
      {
        signed: "no",
        name: "Gabriel",
        avatar: "/placeholder.svg?height=24&width=24",
      },
    ],
    created: "21.03.2021",
    lastActivity: "14.07.2021",
  },
  {
    id: 4,
    documentId: "720472",
    documentName: "Sales Agreement.pdf",
    status: "expired",
    signers: [
      {
        signed: "no",
        name: "Busayo",
        avatar: "/placeholder.svg?height=24&width=24",
      },
      {
        signed: "no",
        name: "James",
        avatar: "/placeholder.svg?height=24&width=24",
      },
      {
        signed: "yes",
        name: "Gbemisola",
        avatar: "/placeholder.svg?height=24&width=24",
      },
      {
        signed: "yes",
        name: "Gabriel",
        avatar: "/placeholder.svg?height=24&width=24",
      },
    ],
    created: "21.03.2021",
    lastActivity: "14.07.2021",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-orange-500";
    case "signed":
      return "bg-green-500";
    case "expired":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "Pending (You)";
    case "signed":
      return "Signed";
    case "expired":
      return "Expired";
    default:
      return status;
  }
};

const DocumentTable = () => {
  const [selected, setSelected] = useState<number[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(11);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(data.map((item) => item.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelected([...selected, id]);
    } else {
      setSelected(selected.filter((item) => item !== id));
    }
  };

  const pages = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className='w-full  rounded-lg px-10 shadow-sm border border-gray-200'>
      {/* Header */}
      <div className='flex items-center mt-3 justify-between border-b border-gray-200'>
        <div className='flex items-center gap-4'>
          <h1 className='text-2xl font-semibold text-gray-900'>Documents</h1>
          <Button className='bg-[#268DE9] hover:bg-blue-700 text-white'>
            <Plus className='w-4 h-4 mr-2' />
            New Document
          </Button>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' className='bg-transparent' size='sm'>
            <Filter className='w-4 h-4 mr-2' />
            Filter
          </Button>
          <Button variant='outline' className='bg-transparent' size='sm'>
            <Download className='w-4 h-4 mr-2' />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-auto mt-7 bg-white px-6'>
        <Table>
          <TableHeader>
            <TableRow className='border-b border-gray-200 text-black'>
              <TableHead className='w-12'>
                <Checkbox
                  className='border-black'
                  checked={selected.length === data.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className='text-black font-semibold'>
                Document ID
              </TableHead>
              <TableHead className='text-black font-semibold'>
                Document Name
              </TableHead>
              <TableHead className='text-black font-semibold'>Status</TableHead>
              <TableHead className='text-black font-semibold'>
                Signers
              </TableHead>
              <TableHead className='font-semibold bg-[#E3F2FE] text-blue-600'>
                Created
              </TableHead>
              <TableHead className='text-black font-medium'>
                Last Activity
              </TableHead>
              <TableHead className='w-12'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={item.id}
                className='border-b border-gray-100 hover:bg-gray-50'
              >
                <TableCell>
                  <Checkbox
                    className='border-[#636363]'
                    checked={selected.includes(item.id)}
                    onCheckedChange={(checked) =>
                      handleSelectItem(item.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell className='text-[#636363]'>
                  {item.documentId}
                </TableCell>
                <TableCell className='text-[#636363] font-medium'>
                  {item.documentName}
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(
                        item.status
                      )}`}
                    ></div>
                    <span className='text-gray-700'>
                      {getStatusText(item.status)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-1'>
                    {item.signers.map((signer, index) => (
                      <div key={index} className='flex items-center gap-1'>
                        <div className='w-6 h-6 rounded-full  flex items-center justify-center text-xs font-medium text-gray-600'>
                          {signer.signed === "yes" ? (
                            <Image
                              src={"/tick.svg"}
                              alt=''
                              width={100}
                              height={100}
                              className='w-4 h-4'
                            />
                          ) : (
                            <Image
                              src={"/x.svg"}
                              alt=''
                              width={100}
                              height={100}
                              className='w-4 h-4'
                            />
                          )}
                        </div>
                        <span className='text-sm text-gray-600'>
                          {signer.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className='text-[#636363]'>{item.created}</TableCell>
                <TableCell className='text-[#636363]'>
                  {item.lastActivity}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-48'>
                      <DropdownMenuItem className='text-[#333333]'>
                        Open Document
                      </DropdownMenuItem>
                      <DropdownMenuItem className='text-[#333333]'>
                        <div
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <AddSignerModal />
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem className='text-[#333333]'>
                        <div
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <ViewDetails />
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem className='text-[#333333]'>
                        <div
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <ResendModal />
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem className='text-[#333333]'>
                        Download (PDF)
                      </DropdownMenuItem>
                      <DropdownMenuItem className='text-red-600'>
                        <div
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                         <DeleteModal />
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className='flex absolute bottom-0 right-100 items-center justify-center gap-2 p-4 border-t border-gray-200'>
        <Button variant='ghost' size='sm' disabled>
          Prev 10
        </Button>
        <div className='flex items-center gap-1'>
          {pages.slice(0, 10).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "ghost"}
              size='sm'
              className={`w-8 h-8 p-0 ${
                page === currentPage
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <span className='text-gray-400 px-2'>...</span>
          {pages.slice(10, 20).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "ghost"}
              size='sm'
              className={`w-8 h-8 p-0 ${
                page === currentPage
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
        </div>
        <Button variant='ghost' size='sm'>
          Next 10
        </Button>
      </div>
    </div>
  );
};

export default DocumentTable;
