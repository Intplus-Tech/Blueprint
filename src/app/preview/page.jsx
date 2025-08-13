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
import AddNewComponents from "./components/AddNewComponents";
import Signers from "./components/Signers";
import AiModal from "./components/AiModal";
import AddSignature from "./components/AddSignature";
import jsPDF from "jspdf";
import { useRouter } from "next/navigation";

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
  const [currentSignature, setCurrentSignature] = useState("");
  const [signatures, setSignatures] = useState([]);
  const[pdfName,setPdfName]=useState("")
 const router = useRouter();
  // Dragging state
  const [draggedSignature, setDraggedSignature] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const overlayRef = useRef(null);
  const canvasContainerRef = useRef(null);

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
    const filename=sessionStorage.getItem("UploadedFileName");
    setPdfName(filename)
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
      setCurrentPage(pageNum);
      await renderPage(pdfDoc, pageNum);
    }
  };

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, pageNum);
    }
  }, [pdfDoc, pageNum]);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, currentPage);
    }
  }, [scale]);

  const handleSignatureSelect = (signature) => {
      console.log("Setting signature:", signature);
    console.log("Current active state:", active);
    setCurrentSignature(signature);
  };
const addSignatureToPage = (e) => {
   console.log("Adding signature attempt:");
    console.log("Current active state:", active);
    console.log("Current signature:", currentSignature);
  // Add these checks to ensure the click is valid
  if (!currentSignature || !canvasRef.current || isDragging) {
    console.log("Blocked:", { currentSignature: !!currentSignature, canvas: !!canvasRef.current, isDragging });
    return;
  }
  
  // Prevent event bubbling that might interfere
  e.preventDefault();
  e.stopPropagation();

  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const newSignature = {
    id: Date.now(),
    x,
    y,
    page: currentPage,
    data: currentSignature,
    width: 200,
    height: 110,
  };
  
  console.log("Adding signature:", newSignature);
  setSignatures(prev => [...prev, newSignature]);
  
  // Important: Don't clear currentSignature here if you want to place multiple
  setCurrentSignature(""); // Remove this line or make it conditional
};

  const removeSignature = (id) => {
    setSignatures(signatures.filter((sig) => sig.id !== id));
  };

  // Drag handlers
  const handleMouseDown = (e, signature) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = overlayRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - (signature.x - signature.width / 2);
    const offsetY = e.clientY - rect.top - (signature.y - signature.height / 2);

    setDraggedSignature(signature);
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !draggedSignature || !overlayRef.current) return;

    const rect = overlayRef.current.getBoundingClientRect();
    const newX =
      e.clientX - rect.left - dragOffset.x + draggedSignature.width / 2;
    const newY =
      e.clientY - rect.top - dragOffset.y + draggedSignature.height / 2;

    // Update signature position
    setSignatures((prev) =>
      prev.map((sig) =>
        sig.id === draggedSignature.id ? { ...sig, x: newX, y: newY } : sig
      )
    );

    // Update dragged signature reference
    setDraggedSignature((prev) => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedSignature(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, draggedSignature, dragOffset]);

  // Update overlay positioning to match canvas
  useEffect(() => {
    if (
      !overlayRef.current ||
      !canvasRef.current ||
      !canvasContainerRef.current
    ) {
      return;
    }

    const updateOverlayPosition = () => {
      const canvas = canvasRef.current;
      const container = canvasContainerRef.current;
      const overlay = overlayRef.current;

      if (canvas && container && overlay) {
        const canvasRect = canvas.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Position overlay relative to the container
        overlay.style.position = "absolute";
        overlay.style.left = canvasRect.left - containerRect.left + "px";
        overlay.style.top = canvasRect.top - containerRect.top + "px";
        overlay.style.width = canvas.offsetWidth + "px";
        overlay.style.height = canvas.offsetHeight + "px";
        // overlay.style.pointerEvents = "auto"; // Changed to auto to enable dragging
      }
    };

    updateOverlayPosition();

    // Update on window resize or scroll
    const handleResize = () => updateOverlayPosition();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, [pdfDoc, currentPage, scale, signatures]);

  // Function to handle PDF download
  // Replace your handleDownload function with this improved version
  const handleDownload = async () => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width + 15;
        canvas.height = viewport.height + 110;

        await page.render({ canvasContext: context, viewport }).promise;
        const pageImage = canvas.toDataURL("image/png");

        if (pageNum > 1) {
          pdf.addPage([viewport.width, viewport.height], "portrait");
        } else {
          pdf.internal.pageSize.setWidth(viewport.width);
          pdf.internal.pageSize.setHeight(viewport.height);
        }

        pdf.addImage(pageImage, "PNG", 0, 0, viewport.width, viewport.height);

        const pageSignatures = signatures.filter((sig) => sig.page === pageNum);
        const displayedCanvas = canvasRef.current;
        const scaleRatio = viewport.width / displayedCanvas.width;
        const sizeMultiplier = 1.5; // Increase signature size by 50%
        const yOffset = 50; // Shift signatures down by 50 pixels in PDF

        for (const sig of pageSignatures) {
          // Scale signature position and size
          const scaledX = sig.x * scaleRatio;
          const scaledY = sig.y * scaleRatio + yOffset; // Apply downward shift
          const scaledWidth = sig.width * scaleRatio * sizeMultiplier; // Increase size
          const scaledHeight = sig.height * scaleRatio * sizeMultiplier; // Increase size

          // Center the signature at the click point
          const finalX = scaledX - scaledWidth / 2;
          const finalY = scaledY - scaledHeight / 2;

          // Ensure signature stays within page bounds
          const boundedX = Math.max(
            0,
            Math.min(finalX, viewport.width - scaledWidth)
          );
          const boundedY = Math.max(
            0,
            Math.min(finalY, viewport.height - scaledHeight)
          );

          // Add signature image to PDF
          pdf.addImage(
            sig.data.data,
            "PNG",
            boundedX,
            boundedY,
            scaledWidth,
            scaledHeight
          );
        }
      }

      pdf.save(pdfName||"modified-document");
    } catch (err) {
      console.error("Failed to generate PDF for download", err);
    }
  };
  
  return (
    <div className='flex h-screen bg-gray-100'>
      {/* Header */}
      <div className='absolute top-0 left-0 right-0 bg-[#006FEE] text-white p-4 flex items-center justify-between z-10'>
        <div onClick={()=> router.push("/dashboard")} className='flex items-center gap-2 hover:bg-blue-700 px-3 py-1 rounded'>
        
            <ChevronLeft size={20} />
            Back
        </div>
        <span className='font-medium'>{pdfName}</span>
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
      <div className='flex-1 flex flex-col mt-[60px]'>
        {pdfDoc && (
          <div className='bg-[#323639] absolute border rounded-xl right-5 top-20 w-[250px] text-white p-3 flex items-center z-20'>
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
                <DropdownMenu
                  open={active === "sign"}
                  onOpenChange={(open) => setActive(open ? "sign" : "note")}
                >
                  <DropdownMenuTrigger asChild>
                    <Image
                      src={"/sign.svg"}
                      alt='note'
                      width={25}
                      height={15}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start' className='w-full mt-3'>
                    <AddSignature
                      onSignatureSelect={handleSignatureSelect}
                      onClose={() => setActive("note")}
                    />
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
                <DropdownMenu
                  open={active === "plus"}
                  onOpenChange={(open) => setActive(open ? "plus" : "note")}
                >
                  <DropdownMenuTrigger asChild>
                    <Image
                      src={"/plus.svg"}
                      alt='note'
                      width={25}
                      height={15}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start' className='w-[160px] mt-3'>
                    <AddNewComponents />
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
                <DropdownMenu
                  open={active === "team"}
                  onOpenChange={(open) => setActive(open ? "team" : "note")}
                >
                  <DropdownMenuTrigger asChild>
                    <Image
                      src={"/team.svg"}
                      alt='note'
                      width={25}
                      height={15}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='mt-3'>
                    <Signers />
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
                <DropdownMenu
                  open={active === "write"}
                  onOpenChange={(open) => setActive(open ? "write" : "note")}
                >
                  <DropdownMenuTrigger asChild>
                    <Image
                      src={"/write.svg"}
                      alt='note'
                      width={25}
                      height={15}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <AiModal />
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
                <DropdownMenu
                  open={active === "download"}
                  onOpenChange={(open) => setActive(open ? "download" : "note")}
                >
                  <DropdownMenuTrigger asChild>
                    <Image
                      src={"/download.svg"}
                      alt='note'
                      width={25}
                      height={15}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleDownload}>
                      Download PDF
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
            <div
              ref={canvasContainerRef}
              className='flex justify-center w-full mx-auto relative'
            >
              <canvas
                ref={canvasRef}
                className='shadow-lg border border-gray-300 bg-white max-w-full h-auto'
                onClick={currentSignature ? addSignatureToPage : undefined}
                style={{ cursor: currentSignature ? "crosshair" : "" }}
              />

              {/* Signature Overlay */}
              <div
                ref={overlayRef}
                className='absolute '
                style={{
                  zIndex: 10,
                   pointerEvents: currentSignature && !isDragging ? "none" : "auto",
                }}
              >
                {signatures
                  .filter((sig) => sig.page === currentPage)
                  .map((sig) => (
                    <div
                      key={sig.id}
                      className={`absolute group select-none ${
                        isDragging && draggedSignature?.id === sig.id
                          ? "cursor-grabbing"
                          : "cursor-grab hover:ring-2 hover:ring-blue-400"
                      }`}
                      style={{
                        left: sig.x - sig.width / 2,
                        top: sig.y - sig.height / 2,
                        width: sig.width,
                        height: sig.height,
                           pointerEvents: "auto"
                      }}
                      onMouseDown={(e) => handleMouseDown(e, sig)}
                    >
                      <img
                        src={sig.data.data}
                        alt='Signature'
                        className='w-full h-full object-cover pointer-events-none'
                        draggable={false}
                      />
                      {/* Delete button on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSignature(sig.id);
                        }}
                        className='absolute -top-2 transition-opacity text-red-500 hover:text-red-700 cursor-pointer -right-1 text-xl font-bold bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100'
                        style={{ pointerEvents: "auto" }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>

              {currentSignature && !isDragging && (
                <div className='absolute top-4 left-4 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm shadow-md z-20'>
                  📝 Click on the document to place your signature
                </div>
              )}

              {isDragging && (
                <div className='absolute top-4 left-4 bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm shadow-md z-20'>
                  🖱️ Dragging signature - release to place
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
