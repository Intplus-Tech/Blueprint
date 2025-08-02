"use client"
import React, { useState, useRef, useEffect } from "react";
import { Upload, Download, Pen, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const PDFSignatureViewer = () => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [isLoading, setIsLoading] = useState(false);
  const [signatures, setSignatures] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentSignature, setCurrentSignature] = useState("");
  
  const canvasRef = useRef(null);
  const signatureCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const overlayRef = useRef(null);

  // Load PDF.js
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    };
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') return;

    setIsLoading(true);
    try {
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        const typedArray = new Uint8Array(e.target.result);
        const pdf = await window.pdfjsLib.getDocument(typedArray).promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        await renderPage(pdf, 1);
        setIsLoading(false);
      };
      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error loading PDF:", error);
      setIsLoading(false);
    }
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

  const changePage = async (newPage) => {
    if (pdfDoc && newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      await renderPage(pdfDoc, newPage);
    }
  };

  const changeScale = async (newScale) => {
    if (pdfDoc) {
      setScale(newScale);
      await renderPage(pdfDoc, currentPage);
    }
  };

  // Signature drawing functions
  const startDrawing = (e) => {
    if (!signatureCanvasRef.current) return;
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing || !signatureCanvasRef.current) return;
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (!signatureCanvasRef.current) return;
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    if (!signatureCanvasRef.current) return;
    const canvas = signatureCanvasRef.current;
    const signatureData = canvas.toDataURL();
    setCurrentSignature(signatureData);
    setShowSignatureModal(false);
    console.log(signatureData);
    
  };

  const addSignatureToPage = (e) => {
    if (!currentSignature || !canvasRef.current) return;
    
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
      width: 150,
      height: 75
    };
    
    setSignatures([...signatures, newSignature]);
  };

  const removeSignature = (id) => {
    setSignatures(signatures.filter(sig => sig.id !== id));
  };
  console.log(signatures,"lol");
  

  // Render signatures on overlay
  useEffect(() => {
    if (!overlayRef.current || !canvasRef.current) return;
    
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    overlay.style.width = canvas.width + 'px';
    overlay.style.height = canvas.height + 'px';
  }, [pdfDoc, currentPage, scale]);

  const downloadPDF = async () => {
    if (!pdfDoc || !canvasRef.current) return;
    
    try {
      // Create a new PDF with signatures
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      // Draw signatures on the canvas
      const pageSignatures = signatures.filter(sig => sig.page === currentPage);
      for (const sig of pageSignatures) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, sig.x, sig.y, sig.width, sig.height);
        };
        img.src = sig.data;
      }
      
      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `signed-document-page-${currentPage}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold">PDF Signature Tool</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSignatureModal(true)}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
            >
              <Pen size={16} />
              Create Signature
            </button>
            <button
              onClick={downloadPDF}
              disabled={!pdfDoc}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {!pdfDoc ? (
          /* Upload Section */
          <div className="text-center py-20">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-blue-400 transition-colors">
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Upload PDF Document</h2>
              <p className="text-gray-500 mb-6">Select a PDF file to preview, sign, and download</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Choose PDF File
              </button>
            </div>
          </div>
        ) : (
          /* PDF Viewer */
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Controls */}
            <div className="lg:w-64 space-y-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold mb-3">Page Navigation</h3>
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => changePage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="p-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 rounded"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm font-medium">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => changePage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="p-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 rounded"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <input
                  type="range"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => changePage(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold mb-3">Zoom</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => changeScale(1)}
                    className={`w-full p-2 rounded ${scale === 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    100%
                  </button>
                  <button
                    onClick={() => changeScale(1.5)}
                    className={`w-full p-2 rounded ${scale === 1.5 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    150%
                  </button>
                  <button
                    onClick={() => changeScale(2)}
                    className={`w-full p-2 rounded ${scale === 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    200%
                  </button>
                </div>
              </div>

              {signatures.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold mb-3">Signatures</h3>
                  <div className="space-y-2">
                    {signatures.map((sig) => (
                      <div key={sig.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">Page {sig.page}</span>
                        <button
                          onClick={() => removeSignature(sig.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PDF Display */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
                {isLoading ? (
                  <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="relative inline-block">
                    <canvas
                      ref={canvasRef}
                      className="border border-gray-300 shadow-sm"
                      onClick={currentSignature ? addSignatureToPage : undefined}
                      style={{ cursor: currentSignature ? 'crosshair' : 'default' }}
                    />
                    
                    {/* Signature Overlay */}
                    <div
                      ref={overlayRef}
                      className="absolute top-0 left-0 pointer-events-none"
                    >
                      {signatures
                        .filter(sig => sig.page === currentPage)
                        .map((sig) => (
                          <img
                            key={sig.id}
                            src={sig.data}
                            alt="Signature"
                            className="absolute"
                            style={{
                              left: sig.x,
                              top: sig.y,
                              width: sig.width,
                              height: sig.height,
                            }}
                          />
                        ))}
                    </div>
                    
                    {currentSignature && (
                      <div className="absolute -top-8 left-0 bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm">
                        Click to place signature
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create Your Signature</h3>
            <div className="border border-gray-300 rounded mb-4">
              <canvas
                ref={signatureCanvasRef}
                width={400}
                height={200}
                className="w-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{ touchAction: 'none' }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={clearSignature}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 py-2 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSignature}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFSignatureViewer;