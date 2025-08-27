"use client";

import { useState, useEffect, useContext } from "react";
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
import {
  Plus,
  Filter,
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { AddSignerModal } from "./AddSignerModal";
import { ViewDetails } from "./ViewDetails";
import { ResendModal } from "./Resendmodal";
import { DeleteModal } from "./DeleteModal";
import Link from "next/link";
import { UserContext } from "@/app/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Signer {
  name: string;
  avatar: string;
  signed: string;
  status: string;
}

interface Document {
  id: number;
  documentId: string;
  documentName: string;
  status: "pending" | "signed" | "expired";
  signers: Signer[];
  created: string;
  lastActivity: string;
  url: string;
  file_url: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-orange-500";
    case "Pending (You)":
      return "bg-orange-500";
    case "Signed":
      return "bg-green-500";
    case "Expired":
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
async function downloadFile(url: string, filename: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to download");

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename || "download";
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error(err);
    toast.error("Download failed");
  }
}

function useScreenWidth() {
  const [width, setWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

const DocumentTable = () => {
  const [selected, setSelected] = useState<number[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { userAuth } = useContext(UserContext);
  const access_token = userAuth?.access_token;
  const [Documents, setDocuments] = useState<Document[]>([]);
  const router = useRouter();
  const width = useScreenWidth();
  const [itemsPerPage, setItemsPerPage] = useState(10); // default

  useEffect(() => {
    if (width < 768) {
      setItemsPerPage(10); // small devices (mobile/tablet)
    } else {
      setItemsPerPage(5); // laptop/desktop
    }
  }, [width]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchUserDocuments = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        process.env.NEXT_PUBLIC_SERVER_DOMAIN + "/api/documents",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      console.log(data.documents);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedData = data.documents.map((doc: any) => ({
        documentName: doc.document_name,
        documentId: doc.document_id,
        status: doc.status,
        signers: doc.signers,
        created: doc.created_at,
        lastActivity: doc.last_activity_at,
        url: doc.new_updated_url,
      }));
      setDocuments(formattedData);
      setIsLoading(false);

      console.log("fetched", formattedData);
    } catch (error) {
      setIsLoading(false);

      toast.error("fetching Documents failed");
      console.log(error);
    }
  };

  useEffect(() => {
    if (access_token) {
      fetchUserDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access_token]);

  if (!isMounted) return null;

  // Use Documents from API if available, otherwise fallback to static data
  const currentData = Documents;

  // Pagination calculations
  const totalItems = currentData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = currentData.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show current page and surrounding pages
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(currentItems.map((item) => Number(item.documentId)));
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelected([]); // Clear selections when changing pages
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  interface FormatDate {
    (dateString: string): string;
  }

  const formatDate: FormatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const viewDocument = (name: string, url: string, id: string) => {
    console.log(url, "url");

    sessionStorage.setItem("UploadedFile", url);
    sessionStorage.setItem("UploadedFileName", name);
    sessionStorage.setItem("documentId", id);
    router.push("/preview");
  };

  const handleDocumentDeleted = () => {
    fetchUserDocuments();
  };

  return (
    <div className='w-full rounded-lg shadow-sm border border-gray-200 bg-white'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-6 border-b border-gray-200'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1'>
          <h1 className='text-xl sm:text-2xl font-semibold text-gray-900'>
            Documents
          </h1>
          <Link href={"/"}>
            <Button className='bg-[#268DE9] cursor-pointer hover:bg-blue-700 text-white w-full sm:w-auto'>
              <Plus className='w-4 h-4 mr-2' />
              New Document
            </Button>
          </Link>
        </div>
        <div className='flex items-center gap-2 w-full sm:w-auto'>
          <Button
            variant='outline'
            className='bg-transparent flex-1 sm:flex-none'
            size='sm'
          >
            <Filter className='w-4 h-4 mr-2' />
            Filter
          </Button>
          <Button
            variant='outline'
            className='bg-transparent flex-1 sm:flex-none'
            size='sm'
          >
            <Download className='w-4 h-4 mr-2' />
            Export
          </Button>
        </div>
      </div>

      {/* Table Container with horizontal scroll */}
      <div className='overflow-x-auto'>
        <div className='min-w-[800px]'>
          <Table>
            <TableHeader>
              <TableRow className='border-b border-gray-200 text-black'>
                <TableHead className='w-12'>
                  <Checkbox
                    className='border-black'
                    checked={
                      selected.length === currentItems.length &&
                      currentItems.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className='text-black font-semibold'>
                  Document ID
                </TableHead>
                <TableHead className='text-black font-semibold'>
                  Document Name
                </TableHead>
                <TableHead className='text-black font-semibold'>
                  Status
                </TableHead>
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className='py-10 h-[300px]'>
                    <div className='flex flex-col items-center justify-center'>
                      <div className='h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700'></div>
                      <span className='mt-2 text-sm text-gray-600'>
                        Loading documents...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : currentItems.length == 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className='py-10 h-[330px]'>
                    <div className='flex flex-col items-center justify-center'>
                     
                      <span className='mt-2 text-sm text-gray-600'>
                       You dont have any Documents....
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((item) => (
                  <TableRow
                    key={item.documentId}
                    className='border-b border-gray-100 hover:bg-gray-50'
                  >
                    <TableCell>
                      <Checkbox
                        className='border-[#636363]'
                        checked={selected.includes(Number(item.documentId))}
                        onCheckedChange={(checked) =>
                          handleSelectItem(
                            Number(item.documentId),
                            checked as boolean
                          )
                        }
                      />
                    </TableCell>
                    <TableCell className='text-[#636363]'>
                      {item.documentId}
                    </TableCell>
                    <TableCell className='text-[#636363] font-medium'>
                      <div
                        className='max-w-[130px] truncate'
                        title={item.documentName}
                      >
                        {item.documentName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <div
                          className={`w-2 h-2 rounded-full ${getStatusColor(
                            item.status
                          )}`}
                        ></div>
                        <span className='text-gray-700 text-sm'>
                          {getStatusText(item.status)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-1  w-[200px] md:w-full overflow-auto'>
                        {item.signers.slice(0, 8).map((signer, index) => (
                          <div key={index} className='flex items-center gap-1'>
                            <div className='w-3 h-3  md:w-4 md:h-4 rounded-full flex items-center justify-center text-xs font-medium text-gray-600'>
                              {signer.status == "signed" || signer.status == "Signed"  ? (
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
                            </div>
                            <span className='text-sm md:text-[14px] text-gray-600 max-w-[80px] truncate'>
                              {signer.name}
                            </span>
                          </div>
                        ))}
                        {item.signers.length > 8 && (
                          <span className='text-xs text-gray-500'>
                            +{item.signers.length - 8} more
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='text-[#636363] text-sm'>
                      {formatDate(item.created)}
                    </TableCell>
                    <TableCell className='text-[#636363] text-sm'>
                      {formatDate(item.lastActivity)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0'
                          >
                            <MoreVertical className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-48'>
                          <DropdownMenuItem
                            className='text-[#333333]'
                            onClick={() =>
                              viewDocument(
                                item.documentName,
                                item.url,
                                item.documentId
                              )
                            }
                          >
                            Open Document
                          </DropdownMenuItem>
                          <DropdownMenuItem className='text-[#333333]'>
                            <div
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              <AddSignerModal
                                documentId={item.documentId}
                                onDelete={handleDocumentDeleted}
                              />
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem className='text-[#333333]'>
                            <div
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              <ViewDetails
                                documentId={item.documentId}
                                onDelete={handleDocumentDeleted}
                              />
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem className='text-[#333333]'>
                            <div
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              <ResendModal
                                documentId={item.documentId}
                                onDelete={handleDocumentDeleted}
                              />
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='text-[#333333]'
                            onClick={() =>
                              downloadFile(item.url ?? "", item.documentName)
                            }
                          >
                            Download (PDF)
                          </DropdownMenuItem>
                          <DropdownMenuItem className='text-red-600'>
                            <div
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              <DeleteModal
                                documentId={item.documentId}
                                onDelete={handleDocumentDeleted}
                              />
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className='flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200'>
          {/* Results info */}
          <div className='text-sm text-gray-600 order-2 sm:order-1'>
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
            {totalItems} results
          </div>

          {/* Pagination controls */}
          <div className='flex items-center gap-2 order-1 sm:order-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className='flex items-center gap-1'
            >
              <ChevronLeft className='w-4 h-4' />
              <span className='hidden sm:inline'>Previous</span>
            </Button>

            <div className='flex items-center gap-1'>
              {getPageNumbers().map((page, index) => (
                <div key={index}>
                  {page === "..." ? (
                    <span className='px-2 py-1 text-gray-400'>...</span>
                  ) : (
                    <Button
                      variant={page === currentPage ? "default" : "ghost"}
                      size='sm'
                      className={`w-8 h-8 p-0 ${
                        page === currentPage
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      onClick={() => handlePageChange(page as number)}
                    >
                      {page}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant='outline'
              size='sm'
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className='flex items-center gap-1'
            >
              <span className='hidden sm:inline'>Next</span>
              <ChevronRight className='w-4 h-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentTable;
