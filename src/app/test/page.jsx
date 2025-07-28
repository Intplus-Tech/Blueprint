'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Upload, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Edit } from 'lucide-react';

const PDFViewer = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [thumbnails, setThumbnails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load PDF.js from CDN
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    };
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setIsLoading(true);
      setPdfFile(file);
      
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        const typedArray = new Uint8Array(e.target.result);
        
        try {
          const pdf = await window.pdfjsLib.getDocument(typedArray).promise;
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPage(1);
          
          // Generate thumbnails
          await generateThumbnails(pdf);
          
          // Render first page
          await renderPage(pdf, 1);
          setIsLoading(false);
        } catch (error) {
          console.error('Error loading PDF:', error);
          setIsLoading(false);
        }
      };
      
      fileReader.readAsArrayBuffer(file);
    }
  };

  const generateThumbnails = async (pdf) => {
    const thumbs = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.2 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      thumbs.push({
        pageNum: i,
        dataUrl: canvas.toDataURL()
      });
    }
    
    setThumbnails(thumbs);
  };

  const renderPage = async (pdf, pageNum) => {
    if (!pdf || !canvasRef.current) return;
    
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
  };

  const goToPage = async (pageNum) => {
    if (pdfDoc && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      await renderPage(pdfDoc, pageNum);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const zoomIn = async () => {
    const newScale = Math.min(scale + 0.2, 3);
    setScale(newScale);
    if (pdfDoc) {
      await renderPage(pdfDoc, currentPage);
    }
  };

  const zoomOut = async () => {
    const newScale = Math.max(scale - 0.2, 0.5);
    setScale(newScale);
    if (pdfDoc) {
      await renderPage(pdfDoc, currentPage);
    }
  };

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, currentPage);
    }
  }, [scale]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 hover:bg-blue-700 px-3 py-1 rounded">
            <ChevronLeft size={20} />
            Back
          </button>
          <span className="font-medium">
            {pdfFile ? pdfFile.name : 'Contract Agreement Star Kint...'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Sign Up</span>
          <span>/</span>
          <span>Sign In</span>
        </div>
      </div>

      {/* Sidebar with thumbnails */}
      {pdfDoc && (
        <div className="w-64 bg-white shadow-lg flex flex-col mt-16 border-r">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800">Pages</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {thumbnails.map((thumb) => (
              <div
                key={thumb.pageNum}
                className={`mb-3 cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                  currentPage === thumb.pageNum
                    ? 'border-blue-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => goToPage(thumb.pageNum)}
              >
                <img
                  src={thumb.dataUrl}
                  alt={`Page ${thumb.pageNum}`}
                  className="w-full h-auto"
                />
                <div className="p-2 text-center text-sm text-gray-600">
                  {thumb.pageNum} / {totalPages}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col mt-16">
        {/* Toolbar */}
        {pdfDoc && (
          <div className="bg-gray-800 text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="p-2 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
              <span className="mx-3">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={zoomOut}
                className="p-2 rounded hover:bg-gray-700"
              >
                <ZoomOut size={20} />
              </button>
              <span className="text-sm">{Math.round(scale * 100)}%</span>
              <button
                onClick={zoomIn}
                className="p-2 rounded hover:bg-gray-700"
              >
                <ZoomIn size={20} />
              </button>
              <button className="p-2 rounded hover:bg-gray-700">
                <Download size={20} />
              </button>
              <button className="p-2 rounded hover:bg-gray-700">
                <Edit size={20} />
              </button>
            </div>
          </div>
        )}

        {/* PDF Display Area */}
        <div className="flex-1 overflow-auto bg-gray-300 p-4">
          {!pdfDoc ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-semibold mb-2">Upload PDF File</h2>
                <p className="text-gray-600 mb-4">
                  Choose a PDF file to view with thumbnail navigation
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Choose File
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  className="shadow-lg border border-gray-300 bg-white"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;