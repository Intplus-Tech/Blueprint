"use client";
import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Upload,
  ChevronLeft,
  Menu,
  X,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import AddNewComponents from "../components/AddNewComponents";
import AiModal from "../components/AiModal";
import AddSignature from "../components/AddSignature";
import jsPDF from "jspdf";
import { useRouter, useSearchParams } from "next/navigation";
import AddText from "../components/AddText";
import { UserContext } from "../../AppContext";
import { removeFromSession } from "../../(auth)/components/session";
import toast from "react-hot-toast";
import axios from "axios";

const PDFViewer = () => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.8);
  const [thumbnails, setThumbnails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const canvasRef = useRef(null);
  const [pageNum, setPageNum] = useState(1);
  const [active, setActive] = useState("note");
  const [currentSignature, setCurrentSignature] = useState("");
  const [signatures, setSignatures] = useState([]);
  const [pdfName, setPdfName] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const { userAuth, setUserAuth } = useContext(UserContext);
  const access_token = searchParams.get("access_token");



 

  const handleLogout = () => {
    removeFromSession("user");
    toast.success("Log Out Successful");
    setUserAuth(null);
  };

  // Dragging state
  const [draggedSignature, setDraggedSignature] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const overlayRef = useRef(null);
  const canvasContainerRef = useRef(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-close sidebar on mobile when screen gets small
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Adjust scale for mobile
  useEffect(() => {
    if (isMobile) {
      setScale(1.4); // Smaller scale for mobile
    } else {
      setScale(1.8); // Original scale for desktop
    }
  }, [isMobile]);

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
    const fileUrl = searchParams.get("document_url");
    const filename = searchParams.get("filename");
    setPdfName(filename);
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
      // Close sidebar on mobile after page selection
      if (isMobile) {
        setSidebarOpen(false);
      }
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

    if (!currentSignature || !canvasRef.current || isDragging) {
      console.log("Blocked:", {
        currentSignature: !!currentSignature,
        canvas: !!canvasRef.current,
        isDragging,
      });
      return;
    }

    // Handle both mouse and touch events properly
    if (e.preventDefault) {
      try {
        e.preventDefault();
      } catch (error) {
        // Ignore preventDefault errors for passive listeners
        console.log("preventDefault failed (passive listener)");
      }
    }

    if (e.stopPropagation) {
      e.stopPropagation();
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Handle both mouse and touch events
    let clientX, clientY;

    if (e.type === "touchstart" || e.type === "touchend") {
      // For touch events
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        // For touchend events, touches array might be empty
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        console.error("No touch coordinates available");
        return;
      }
    } else {
      // For mouse events
      clientX = e.clientX;
      clientY = e.clientY;
    }

    if (isNaN(clientX) || isNaN(clientY)) {
      console.error("Invalid coordinates:", { clientX, clientY });
      return;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    console.log("Touch/Click coordinates:", { clientX, clientY, x, y, rect });

    const newSignature = {
      id: Date.now(),
      x,
      y,
      page: currentPage,
      data: currentSignature,
      width: isMobile ? 150 : 200,
      height: isMobile ? 82 : 110,
    };

    console.log("Adding signature:", newSignature);
    setSignatures((prev) => [...prev, newSignature]);
    setCurrentSignature("");
  };

  const removeSignature = (id) => {
    setSignatures(signatures.filter((sig) => sig.id !== id));
  };

  // Drag handlers with touch support
  // Updated drag handlers with better touch support
  const handleMouseDown = (e, signature) => {
    try {
      e.preventDefault();
    } catch (error) {
      // Ignore preventDefault errors for passive listeners
    }

    if (e.stopPropagation) {
      e.stopPropagation();
    }

    const rect = overlayRef.current.getBoundingClientRect();

    // Handle both mouse and touch events
    let clientX, clientY;

    if (e.type === "touchstart") {
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        return;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    if (isNaN(clientX) || isNaN(clientY)) {
      return;
    }

    const offsetX = clientX - rect.left - (signature.x - signature.width / 2);
    const offsetY = clientY - rect.top - (signature.y - signature.height / 2);

    setDraggedSignature(signature);
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !draggedSignature || !overlayRef.current) return;

    const rect = overlayRef.current.getBoundingClientRect();

    // Handle both mouse and touch events
    let clientX, clientY;

    if (e.type === "touchmove") {
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        return;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    if (isNaN(clientX) || isNaN(clientY)) {
      return;
    }

    const newX =
      clientX - rect.left - dragOffset.x + draggedSignature.width / 2;
    const newY =
      clientY - rect.top - dragOffset.y + draggedSignature.height / 2;

    setSignatures((prev) =>
      prev.map((sig) =>
        sig.id === draggedSignature.id ? { ...sig, x: newX, y: newY } : sig
      )
    );

    setDraggedSignature((prev) => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedSignature(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Add global mouse and touch event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleMove = (e) => handleMouseMove(e);
      const handleEnd = () => handleMouseUp();

      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleMove);
      document.addEventListener("touchend", handleEnd);

      return () => {
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchmove", handleMove);
        document.removeEventListener("touchend", handleEnd);
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

        overlay.style.position = "absolute";
        overlay.style.left = canvasRect.left - containerRect.left + "px";
        overlay.style.top = canvasRect.top - containerRect.top + "px";
        overlay.style.width = canvas.offsetWidth + "px";
        overlay.style.height = canvas.offsetHeight + "px";
      }
    };

    updateOverlayPosition();

    const handleResize = () => updateOverlayPosition();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, [pdfDoc, currentPage, scale, signatures]);

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
        const sizeMultiplier = 1.1;
        const yOffset = 10;

        for (const sig of pageSignatures) {
          const scaledX = sig.x * scaleRatio;
          const scaledY = sig.y * scaleRatio + yOffset;
          const scaledWidth = sig.width * scaleRatio * sizeMultiplier;
          const scaledHeight = sig.height * scaleRatio * sizeMultiplier;

          const finalX = scaledX - scaledWidth / 2;
          const finalY = scaledY - scaledHeight / 2;

          const boundedX = Math.max(
            0,
            Math.min(finalX, viewport.width - scaledWidth)
          );
          const boundedY = Math.max(
            0,
            Math.min(finalY, viewport.height - scaledHeight)
          );

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

      pdf.save(pdfName || "modified-document");
    } catch (err) {
      console.error("Failed to generate PDF for download", err);
    }
  };
  const handleSaveSignature = async () => {
    const documentId = searchParams.get("document_id");
   const toastId = toast.loading("signing your document...");
    if (!signatures.length) {
      toast.error("No signature to save");
      return;
    }

    // Pick the last placed signature
    const signature = signatures[signatures.length - 1];

    // Get the canvas and its viewport
    const canvas = canvasRef.current;
    if (!canvas || !pdfDoc) return;

    // Get the current page from pdfDoc
    const page = await pdfDoc.getPage(signature.page);
    const viewport = page.getViewport({ scale: 1.0 }); // Native PDF size (no scaling)

    // A4 size in points (used by backend)
    const PAGE_WIDTH = 612; // A4 width in points
    const PAGE_HEIGHT = 792; // A4 height in points

    // Calculate the scaling factor between displayed canvas and A4
    const canvasRect = canvas.getBoundingClientRect();
    const scaleX = PAGE_WIDTH / canvasRect.width; // Map canvas width to A4 width
    const scaleY = PAGE_HEIGHT / canvasRect.height; // Map canvas height to A4 height

    // Log for debugging
    console.log("Canvas and Viewport:", {
      canvasWidth: canvasRect.width,
      canvasHeight: canvasRect.height,
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
      scaleX,
      scaleY,
      signatureX: signature.x,
      signatureY: signature.y,
    });

    // Transform coordinates to A4 coordinate system
    const pos_x = signature.x * scaleX; // Scale X coordinate
    const pos_y = (canvasRect.height - signature.y) * scaleY; // Flip and scale Y coordinate to PDF bottom-left origin
    const width = signature.width * scaleX; // Scale signature width
    const height = signature.height * scaleY; // Scale signature height

    // Ensure coordinates and dimensions are within bounds
    const bounded_pos_x = Math.max(0, Math.min(pos_x, PAGE_WIDTH - width));
    const bounded_pos_y = Math.max(0, Math.min(pos_y, PAGE_HEIGHT - height));

    const payload = {
      signature_base64: signature.data.data,
      page_number: signature.page,
      pos_x: bounded_pos_x,
      pos_y: bounded_pos_y,
      width: width +20,
      height: height,
      is_pdf_coordinates: true, // Indicate Y is in PDF bottom-left coordinates
    };
    
    console.log(payload);

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_DOMAIN}/api/documents/${documentId}/send/sign`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Document Signed successfully!");
      console.log("Signed PDF URL:", data);
    } catch (err) {
      console.log(err);
      toast.error(err?.response.data.error || "Something went wrong");
    }
  };

  return (
    <div className='flex h-screen bg-gray-100 relative'>
      {/* Header */}
      <div className='absolute top-0 left-0 right-0 bg-[#006FEE] text-white p-3 md:p-4 flex items-center justify-between z-30'>
        <div className='flex items-center gap-2'>
          {/* Mobile menu button */}
          {isMobile && pdfDoc && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className='p-1 hover:bg-blue-700 rounded mr-2'
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          <div
            onClick={() => router.push(access_token ? "/dashboard" : "/")}
            className='flex items-center gap-2 hover:bg-blue-700 px-2 md:px-3 py-1 rounded cursor-pointer'
          >
            <ChevronLeft size={20} />
            <span className='hidden sm:inline'>
              {access_token ? "Dashboard" : "Back"}
            </span>
          </div>
        </div>

        <span className='font-medium text-sm md:text-base truncate max-w-[200px] md:max-w-none'>
          {pdfName}
        </span>

        <div className='flex items-center gap-1 md:gap-2 text-sm'>
          {access_token ? (
            <div className='flex items-center gap-6'>
              <Settings className='w-5 h-5 text-gray-100/90 cursor-pointer' />
              <div className='relative cursor-pointer'>
                <Image src={"/shape.svg"} alt='note' width={20} height={15} />

                <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center'>
                  3
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  className='border-none focus:outline-none'
                >
                  <Image
                    src={"/signout.svg"}
                    alt='note'
                    width={20}
                    height={15}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleLogout}>
                    <p className=' text-red-500 cursor-pointer'>Log Out</p>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Link
                href='/signup'
                className='text-white/80 hover:text-white hover:underline transition-colors'
              >
                Sign Up
              </Link>
              <span className='text-white/60'>/</span>
              <Link
                href='/login'
                className='text-white/80 hover:underline hover:text-white transition-colors'
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className='fixed inset-0 bg-[#00000099]/60 bg-opacity-50 z-40 md:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Thumbnails */}
      {pdfDoc && (
        <div
          className={`
          ${
            isMobile
              ? `fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ${
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : "relative"
          }
          w-48 md:w-64 bg-gray-300 shadow-lg flex flex-col ${
            isMobile ? "pt-16" : "mt-16"
          } border-r
        `}
        >
          <div className='flex-1 overflow-y-auto p-2 md:p-4'>
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
                <div className='p-2 text-center bg-transparent text-xs md:text-sm text-gray-600'>
                  {thumb.pageNum} / {totalPages}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main PDF Area */}
      <div className='flex-1 flex flex-col mt-[50px] md:mt-0 bg-[#CDD1D8]'>
        {/* Tools Bar */}
        {pdfDoc && (
          <div
            className={`
            bg-[#323639] border rounded-xl text-white p-2 md:p-3 flex items-center z-20
            ${
              isMobile
                ? "fixed top-22 -right-14 transform -translate-x-1/2 w-auto max-w-[calc(100vw-2rem)]"
                : "absolute right-5 top-20 w-[250px]"
            }
          `}
          >
            <div className='flex items-center gap-1 overflow-x-auto'>
              <button
                onClick={() => setActive("note")}
                className={
                  "p-1 rounded hover:bg-gray-700 flex-shrink-0 " +
                  (active === "note" && "bg-black")
                }
              >
                <Image src={"/note.svg"} alt='note' width={20} height={15} />
              </button>

              <button
                className={
                  "p-1 rounded hover:bg-gray-700 flex-shrink-0 " +
                  (active === "text" && "bg-black")
                }
              >
                <DropdownMenu
                  open={active === "text"}
                  onOpenChange={(open) => setActive(open ? "text" : "note")}
                >
                  <DropdownMenuTrigger asChild>
                    <Image src={"/T.svg"} alt='Text' width={15} height={15} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start' className='w-full mt-3'>
                    <AddText
                      onSignatureSelect={handleSignatureSelect}
                      onClose={() => setActive("note")}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </button>
              <button
                className={
                  "p-1 rounded hover:bg-gray-700 flex-shrink-0 " +
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
                      alt='sign'
                      width={20}
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
                  "p-1 rounded hover:bg-gray-700 flex-shrink-0 " +
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
                      alt='plus'
                      width={20}
                      height={15}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start' className='w-[160px] mt-3'>
                    <AddNewComponents />
                  </DropdownMenuContent>
                </DropdownMenu>
              </button>


              <button
                onClick={() => setActive("write")}
                className={
                  "p-1 rounded hover:bg-gray-700 flex-shrink-0 " +
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
                      alt='write'
                      width={20}
                      height={15}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='w-[300px] md:w-full mr-8'>
                    <AiModal />
                  </DropdownMenuContent>
                </DropdownMenu>
              </button>

              <button
                onClick={() => setActive("download")}
                className={
                  "p-1 rounded hover:bg-gray-700 flex-shrink-0 " +
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
                      alt='download'
                      width={20}
                      height={15}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleDownload}>
                      Download PDF
                    </DropdownMenuItem>
                    {access_token && (
                      <DropdownMenuItem onClick={handleSaveSignature}>
                        Save PDF
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </button>
            </div>
          </div>
        )}

        {/* PDF Viewer */}
        <div
          className={`
          flex-1 overflow-auto bg-gray-300 p-2 md:p-4
          ${isMobile ? "mt-14 " : "mt-16"}
        `}
        >
          {isLoading ? (
            <div className='flex justify-center items-center h-full'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
            </div>
          ) : !pdfDoc ? (
            <div className='text-center text-gray-600 mt-20 px-4'>
              <p className='text-lg mb-2'>No PDF loaded</p>
              <p className='text-sm'>
                Return to upload page to select a document
              </p>
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
                onTouchStart={
                  currentSignature
                    ? (e) => {
                        // Prevent default touch behavior like scrolling
                        e.preventDefault();
                        addSignatureToPage(e);
                      }
                    : undefined
                }
                style={{
                  cursor: currentSignature ? "crosshair" : "",
                  touchAction: currentSignature ? "none" : "auto", // Prevent default touch behaviors
                }}
              />

              {/* Signature Overlay */}
              <div
                ref={overlayRef}
                className='absolute'
                style={{
                  zIndex: 10,
                  pointerEvents:
                    currentSignature && !isDragging ? "none" : "auto",
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
                        pointerEvents: "auto",
                        touchAction: "none", // Prevent default touch behaviors
                      }}
                      onMouseDown={(e) => handleMouseDown(e, sig)}
                      onTouchStart={(e) => {
                        e.preventDefault(); // Prevent scrolling
                        handleMouseDown(e, sig);
                      }}
                    >
                      <img
                        src={sig.data.data}
                        alt='Signature'
                        className='w-full h-full object-cover pointer-events-none'
                        draggable={false}
                      />
                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSignature(sig.id);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          removeSignature(sig.id);
                        }}
                        className={`
          absolute -top-2 -right-1 text-xl font-bold bg-white rounded-full 
          flex items-center justify-center shadow-md transition-opacity
          text-red-500 hover:text-red-700 cursor-pointer
          opacity-0 group-hover:opacity-100
          ${isMobile ? "w-8 h-8" : "w-6 h-6"}
        `}
                        style={{
                          pointerEvents: "auto",
                          touchAction: "manipulation", // Allow touch but prevent other gestures
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>

              {/* Status Messages */}
              {currentSignature && !isDragging && (
                <div
                  className={`
                  absolute bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm shadow-md z-20
                  ${
                    isMobile
                      ? "top-2 left-2 right-2 text-center"
                      : "top-4 left-4"
                  }
                `}
                >
                  📝 {isMobile ? "Tap" : "Click"} on the document to place your
                  signature
                </div>
              )}

              {isDragging && (
                <div
                  className={`
                  absolute bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm shadow-md z-20
                  ${
                    isMobile
                      ? "top-2 left-2 right-2 text-center"
                      : "top-4 left-4"
                  }
                `}
                >
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
