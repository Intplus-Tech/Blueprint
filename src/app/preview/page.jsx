"use client";
import React, { useState, useRef, useEffect } from "react";
import { Upload, ChevronLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { AuthModal } from "./components/siginModal";

const PDFViewer = () => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.8);
  const [thumbnails, setThumbnails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef(null);
  const [pageNum, setPageNum] = useState(1);
  const [active, setActive] = useState("note");
  const auth = false;

  // Load PDF.js
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      loadPdfFromSession();
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Load PDF file from sessionStorage
  const loadPdfFromSession = async () => {
    const fileUrl = sessionStorage.getItem("UploadedFile");
    if (!fileUrl) {
      setIsLoading(false);
      return;
    }

    try {
      const pdf = await window.pdfjsLib.getDocument(fileUrl).promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      await generateThumbnails(pdf);
      await renderPage(pdf, 1);
    } catch (err) {
      console.error("Failed to load PDF", err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateThumbnails = async (pdf) => {
    const thumbs = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.2 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;
      thumbs.push({
        pageNum: i,
        dataUrl: canvas.toDataURL(),
      });
    }
    setThumbnails(thumbs);
  };

  const renderPage = async (pdf, pageNum) => {
    if (!canvasRef.current) return;
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: context, viewport }).promise;
  };

  const goToPage = async (pageNum) => {
    if (pdfDoc && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pdfDoc,pageNum);
      await renderPage(pdfDoc, pageNum);
    }
  };
  useEffect(() => {
    if (pdfDoc) {
      renderPage(pageNum); // Always render the current page after loading
    }
  }, [pdfDoc, pageNum]);
  const nextPage = () => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) goToPage(currentPage - 1);
  };

  const zoomIn = async () => {
    const newScale = Math.min(scale + 0.2, 3);
    setScale(newScale);
    await renderPage(pdfDoc, currentPage);
  };

  const zoomOut = async () => {
    const newScale = Math.max(scale - 0.2, 0.5);
    setScale(newScale);
    await renderPage(pdfDoc, currentPage);
  };

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, currentPage);
    }
  }, [scale]);

  return (
    <div className='flex h-screen bg-gray-100'>
      {/* Header */}
      <div className='absolute top-0  left-0 right-0 bg-[#006FEE] text-white p-4 flex items-center justify-between z-10'>
        <div className='flex items-center gap-4'>
          <Link
            href={"/"}
            className='flex items-center gap-2 hover:bg-blue-700 px-3 py-1 rounded'
          >
            <ChevronLeft size={20} />
            Back
          </Link>
        </div>
        <span className='font-medium'>Contract Agreement Star Klint...</span>
        <div className='flex items-center gap-2'>
          <span>Sign Up</span>
          <span>/</span>
          <span>Sign In</span>
        </div>
      </div>

      {/* Sidebar Thumbnails */}
      {pdfDoc && (
        <div className='w-64 bg-gray-300 shadow-lg flex flex-col mt-16 border-r'>
          <div className='flex-1 overflow-y-auto p-4'>
            {thumbnails.map((thumb) => (
              <div
                key={thumb.pageNum}
                className={`mb-3 cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                  currentPage === thumb.pageNum
                    ? "border-gray-500 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => goToPage(thumb.pageNum)}
              >
                <img
                  src={thumb.dataUrl}
                  alt={`Page ${thumb.pageNum}`}
                  className='w-full h-auto'
                />
                <div className='p-2 text-center bg-transparent text-sm text-gray-600'>
                  {thumb.pageNum} / {totalPages}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main PDF Area */}
      <div className='flex-1 flex flex-col mt-[60px] '>
        {pdfDoc && (
          <div className='bg-[#323639] absolute border rounded-xl right-5 top-20 w-[250px] text-white p-3 flex items-center'>
            <div className='flex items-center gap-1'>
              <button
                onClick={() => setActive("note")}
                className={
                  "p-1 rounded hover:bg-gray-700 " +
                  (active === "note" && "bg-black")
                }
              >
                <Image src={"/note.svg"} alt='note' width={25} height={15} />
              </button>
              <button
                className={
                  "p-1 rounded hover:bg-gray-700 " +
                  (active === "sign" && "bg-black")
                }
              >
                <DropdownMenu onOpenChange={() => setActive("sign")}>
                  <DropdownMenuTrigger asChild>
                    <Image
                      src={"/sign.svg"}
                      alt='note'
                      width={25}
                      height={15}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start' className='w-full mt-3'>
                    <DropdownMenuItem>
                      <p>not assignes</p>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </button>
              <button
                onClick={() => setActive("plus")}
                className={
                  "p-1 rounded hover:bg-gray-700 " +
                  (active === "plus" && "bg-black")
                }
              >
                <DropdownMenu onOpenChange={() => setActive("plus")}>
                  <DropdownMenuTrigger asChild>
                    <Image
                      src={"/plus.svg"}
                      alt='note'
                      width={25}
                      height={15}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start' className='w-[160px] mt-3'>
                    {auth ? (
                      <>
                        <DropdownMenuItem>
                          {" "}
                          <Image
                            src={"/pc.svg"}
                            alt='png'
                            height={10}
                            width={10}
                            className='w-[17px] h-[17px] object-cover'
                          />{" "}
                          My Device
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {" "}
                          <Image
                            src={"/drive.svg"}
                            alt='png'
                            height={10}
                            width={10}
                            className='w-[17px] h-[17px] object-cover'
                          />{" "}
                          Google Drive
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {" "}
                          <Image
                            src={"/one.svg"}
                            alt='png'
                            height={10}
                            width={10}
                            className='w-[17px] h-[17px] object-cover'
                          />{" "}
                          OneDrive
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {" "}
                          <Image
                            src={"/box.svg"}
                            alt='png'
                            height={10}
                            width={10}
                            className='w-[17px] h-[17px] object-cover'
                          />{" "}
                          Drop Box
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem>
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
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </button>
              <button
                onClick={() => setActive("team")}
                className={
                  "p-1 rounded hover:bg-gray-700 " +
                  (active === "team" && "bg-black")
                }
              >
                <DropdownMenu onOpenChange={() => setActive("team")}>
                  <DropdownMenuTrigger asChild>
                    <Image
                      src={"/team.svg"}
                      alt='note'
                      width={25}
                      height={15}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='mt-3'>
                    {auth ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        className='p-3'
                      >
                        <h3 className='text-gray-400 text-base font-semibold mb-2'>
                          New Signer
                        </h3>
                        <form className='flex flex-col gap-2 text-black'>
                          <div className='flex gap-2'>
                            <div className='flex-1'>
                              <label
                                htmlFor='first-name'
                                className='block mb-1'
                              >
                                First name
                              </label>
                              <input
                                type='text'
                                id='first-name'
                                placeholder='First name'
                                className='border p-2 rounded w-full'
                              />
                            </div>
                            <div className='flex-1'>
                              <label htmlFor='lastName' className='block mb-1'>
                                Last name
                              </label>
                              <input
                                id='lastName'
                                type='text'
                                placeholder='Last name'
                                className='border p-2 rounded w-full'
                              />
                            </div>
                          </div>
                          <div className='flex-1'>
                            <label htmlFor='email'>Email Address</label>
                            <input
                              id='email'
                              type='email'
                              placeholder='Email address'
                              className='border p-2 rounded w-full'
                            />
                          </div>
                          <div className='flex items-center gap-2'>
                            <input type='checkbox' id='more' />
                            <label
                              htmlFor='more'
                              className='text-blue-500 cursor-pointer text-sm'
                            >
                              Add more signer
                            </label>
                          </div>
                          <div className='flex justify-end gap-2 mt-2'>
                            <button
                              type='button'
                              className='px-3 py-1 border rounded'
                            >
                              Cancel
                            </button>
                            <button
                              type='submit'
                              className='px-3 py-1 bg-blue-500 text-white rounded'
                            >
                              Send Invite
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <DropdownMenuItem>
                        <div
                          className='flex flex-col gap-1'
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <p className='text-black font-bold'>
                            Add Co-Signer(s)
                          </p>
                          <span className='font-extralight'>
                            <AuthModal />
                            Add people to sign the same
                          </span>
                          <span className='font-extralight'>
                            document with you.
                          </span>
                        </div>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </button>
              <button
                onClick={() => setActive("write")}
                className={
                  "p-1 rounded hover:bg-gray-700 " +
                  (active === "write" && "bg-black")
                }
              >
                <DropdownMenu onOpenChange={() => setActive("write")}>
                  <DropdownMenuTrigger asChild>
                    <Image
                      src={"/write.svg"}
                      alt='note'
                      width={25}
                      height={15}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {auth ? (
                      <DropdownMenuItem>
                        <div className='w-full flex-col space-x-3 space-y-4 p-4 gap-5'>
                          <p className='text-2xl text-gray-500 '>
                            AI Document Reviewer
                          </p>

                          <p>
                            Do you want continue with AI Torney to Review your
                            document.
                          </p>

                          <p className='text-sm text-gray-600'>
                            By using you agree to AI Torney
                            <span className='text-blue-600 underline px-1'>
                              Terms & Condition
                            </span>
                            and
                            <span className='text-blue-600 px-1 underline'>
                              Privacy Policy
                            </span>
                            .
                          </p>

                          <div className='flex justify-end gap-2 mt-2'>
                            <button
                              type='button'
                              className='px-3 py-2 border hover:bg-gray-100 rounded-xl'
                            >
                              Cancel
                            </button>
                            <button
                              type='submit'
                              className='px-3 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-xl'
                            >
                              Review free
                            </button>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem>
                        <div className='flex flex-col gap-1'
                          onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}>
                          <p className='text-black font-bold'>AI Review</p>
                          <span className='font-extralight'>
                            <AuthModal />
                            Review and get recommendation
                          </span>
                          <span className='font-extralight'>
                            about your document from our AI.
                          </span>
                        </div>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </button>
              <button
                onClick={() => setActive("download")}
                className={
                  "p-1 rounded hover:bg-gray-700 " +
                  (active === "download" && "bg-black")
                }
              >
                <DropdownMenu onOpenChange={() => setActive("download")}>
                  <DropdownMenuTrigger asChild>
                    <Image
                      src={"/download.svg"}
                      alt='note'
                      width={25}
                      height={15}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <p>hey</p>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </button>
            </div>
          </div>
        )}

        {/* Viewer */}
        <div className='flex-1 overflow-auto bg-gray-300 p-4'>
          {isLoading ? (
            <div className='flex justify-center items-center h-full'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
            </div>
          ) : !pdfDoc ? (
            <div className='text-center text-gray-600 mt-20'>
              No PDF loaded. Return to upload page.
            </div>
          ) : (
            <div className='flex justify-center w-full  mx-auto'>
              <canvas
                ref={canvasRef}
                className='shadow-lg border border-gray-300 bg-white max-w-full h-auto'
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
