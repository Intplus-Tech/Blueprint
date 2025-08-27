/* eslint-disable @next/next/no-img-element */
"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { X, Clock, Edit, Type, Camera, Cloud } from "lucide-react";

type SignatureMethod = "draw" | "upload" | "name" | "default";

interface SavedSignature {
  id: string;
  type: SignatureMethod;
  data: string;
  name: string;
  timestamp: number;
}

interface AddSignatureProps {
  onSignatureSelect?: (signature: SavedSignature) => void;
  onClose?: () => void;
}

export default function AddSignature({
  onSignatureSelect,
  onClose,
}: AddSignatureProps) {
  const [currentMethod, setCurrentMethod] =
    useState<SignatureMethod>("default");
  const [savedSignatures, setSavedSignatures] = useState<SavedSignature[]>([]);
  const [showAddSignature, setShowAddSignature] = useState(false);
  const [userName, setUserName] = useState("John Doe");
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Load saved signatures from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedSignatures");
    if (saved) {
      setSavedSignatures(JSON.parse(saved));
    } else {
      setShowAddSignature(true);
    }
  }, []);

  // Initialize canvas for drawing with smooth settings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Enhanced drawing settings for smoother lines
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = "source-over";

    // Enable smoothing
    ctx.imageSmoothingEnabled = true;

    // Clear the canvas with white background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [currentMethod]);

  const getMousePos = (
    canvas: HTMLCanvasElement,
    e: React.MouseEvent<HTMLCanvasElement>
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getMousePos(canvas, e);
    lastPointRef.current = pos;

    // Start a new path and move to the starting point
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentPos = getMousePos(canvas, e);

    // Draw a continuous line to the current position
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();

    // Move the path to the current position for the next segment
    ctx.beginPath();
    ctx.moveTo(currentPos.x, currentPos.y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Refill with white background
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = 400;
        canvas.height = 150;

        // Fill with white background first
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate scaling to fit image in canvas
        const scale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        );
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // Update the display canvas
        const displayCanvas = canvasRef.current;
        if (displayCanvas) {
          const displayCtx = displayCanvas.getContext("2d");
          if (displayCtx) {
            displayCtx.clearRect(0, 0, canvas.width, canvas.height);
            displayCtx.drawImage(canvas, 0, 0);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const generateNameSignature = (name: string): string => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    canvas.width = 400;
    canvas.height = 150;

    // Fill with white background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Enhanced text rendering for smoother appearance
    ctx.font = "32px 'Brush Script MT', 'Lucida Handwriting', cursive";

    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Removed invalid property 'textRenderingOptimization'
    if ("fontSmooth" in ctx) {
      ctx.fontSmooth = "always";
    }

    ctx.fillText(name, canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL();
  };

  const saveSignature = () => {
    let signatureData = "";
    let signatureName = "";

    switch (currentMethod) {
      case "draw":
        const canvas = canvasRef.current;
        if (!canvas) return;
        signatureData = canvas.toDataURL("image/png");
        signatureName = "Hand-drawn signature";
        break;
      case "upload":
        const uploadCanvas = canvasRef.current;
        if (!uploadCanvas) return;
        signatureData = uploadCanvas.toDataURL("image/png");
        signatureName = "Uploaded signature";
        break;
      case "name":
        signatureData = generateNameSignature(userName);
        signatureName = `${userName} (typed)`;
        break;
    }

    if (!signatureData) return;

    const newSignature: SavedSignature = {
      id: Date.now().toString(),
      type: currentMethod,
      data: signatureData,
      name: signatureName,
      timestamp: Date.now(),
    };

    const updatedSignatures = [...savedSignatures, newSignature];
    setSavedSignatures(updatedSignatures);
    localStorage.setItem("savedSignatures", JSON.stringify(updatedSignatures));
    setShowAddSignature(false);
  };

  const selectSignature = (signature: SavedSignature) => {
    onSignatureSelect?.(signature);
    onClose?.();
  };

  const deleteSignature = (id: string) => {
    const updatedSignatures = savedSignatures.filter((sig) => sig.id !== id);
    setSavedSignatures(updatedSignatures);
    localStorage.setItem("savedSignatures", JSON.stringify(updatedSignatures));
  };

  const renderSignatureMethod = () => {
    switch (currentMethod) {
      case "draw":
        return (
          <div className='w-[350px] space-y-4'>
            <div className='text-sm font-medium text-gray-700'>Draw it in</div>
            <div className='relative bg-blue-50 rounded-lg p-4'>
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                className='w-full h-32 bg-white rounded border-2 border-dashed border-gray-300 cursor-crosshair'
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  startDrawing({
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                  } as unknown as React.MouseEvent<HTMLCanvasElement>);
                }}
                onTouchMove={(e) => {
                    e.preventDefault();
                  const touch = e.touches[0];
                  draw({
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                  } as unknown as React.MouseEvent<HTMLCanvasElement>);
                }}
                style={{ imageRendering: "auto" }}
              />
              <button
                onClick={clearCanvas}
                className='absolute top-2 right-2 text-gray-400 hover:text-gray-600'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
          </div>
        );
      case "default":
        return (
          <div className='space-y-3'>
            {!savedSignatures.length && (
              <div className='space-y-4'>
                <div className='text-sm font-medium text-gray-700'>
                  My Signatures
                </div>
                <div className='bg-blue-50 rounded-lg p-8 text-center'>
                  <div className='text-gray-500 mb-4'>No Signature found</div>
                </div>
              </div>
            )}
            {savedSignatures.map((signature) => (
              <div
                key={signature.id}
                className='bg-white border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow'
              >
                <div className='flex items-center space-x-3'>
                  <img
                    src={signature.data || "/placeholder.svg"}
                    alt={signature.name}
                    className='w-16 h-8 object-contain border rounded'
                  />
                  <div>
                    <div className='text-sm font-medium'>{signature.name}</div>
                    <div className='text-xs text-gray-500'>
                      {new Date(signature.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className='flex space-x-2'>
                  <Button
                    onClick={() => selectSignature(signature)}
                    size='sm'
                    className='bg-blue-600 hover:bg-blue-700'
                  >
                    Use
                  </Button>
                  <Button
                    onClick={() => deleteSignature(signature.id)}
                    size='sm'
                    variant='outline'
                  >
                    <X className='w-4 h-4' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        );
      case "upload":
        return (
          <div className='w-[350px] space-y-4'>
            <div className='text-sm font-medium text-gray-700'>Upload</div>
            <div className='relative bg-blue-50 rounded-lg p-4'>
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                className='w-full h-32 bg-white rounded border-2 border-dashed border-gray-300'
              />
              <div
                className='absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 rounded-lg'
                onClick={() => fileInputRef.current?.click()}
              >
                <Cloud className='w-8 h-8 text-blue-500 mb-2' />
                <div className='text-sm text-gray-600 mb-1'>
                  Drop your signature or{" "}
                  <span className='text-blue-600 font-medium'>
                    Click to upload
                  </span>
                </div>
                <div className='text-xs text-gray-500'>
                  PNG & JPG (max. 800x400px)
                </div>
              </div>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/png,image/jpeg'
                onChange={handleFileUpload}
                className='hidden'
              />
            </div>
          </div>
        );
      case "name":
        return (
          <div className='w-[350px] space-y-4'>
            <div className='text-sm font-medium text-gray-700'>
              Use your name
            </div>
            <div className='bg-blue-50 rounded-lg p-4'>
              <div className='bg-white rounded border-b-2 border-gray-400 p-4 text-center'>
                <div
                  className='text-2xl  text-gray-800'
                  style={{ fontFamily: "'Great Vibes', cursive" }}
                >
                  {userName}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      <div className='flex'>
        {/* Sidebar */}
        <div className='w-16 bg-gray-50 border-r border-gray-200 flex flex-col'>
          <button
            onClick={() => setCurrentMethod("default")}
            className={`p-4 hover:bg-gray-100 ${
              currentMethod === "default"
                ? "bg-white border-r-2 border-blue-600"
                : ""
            }`}
          >
            <Clock className='w-5 h-5 text-gray-600' />
          </button>
          <button
            onClick={() => setCurrentMethod("draw")}
            className={`p-4 hover:bg-gray-100 ${
              currentMethod === "draw"
                ? "bg-white border-r-2 border-blue-600"
                : ""
            }`}
          >
            <Edit className='w-5 h-5 text-gray-600' />
          </button>
          <button
            onClick={() => setCurrentMethod("name")}
            className={`p-4 hover:bg-gray-100 ${
              currentMethod === "name"
                ? "bg-white border-r-2 border-blue-600"
                : ""
            }`}
          >
            <Type className='w-5 h-5 text-gray-600' />
          </button>
          <button
            onClick={() => setCurrentMethod("upload")}
            className={`p-4 hover:bg-gray-100 ${
              currentMethod === "upload"
                ? "bg-white border-r-2 border-blue-600"
                : ""
            }`}
          >
            <Camera className='w-5 h-5 text-gray-600' />
          </button>
        </div>

        {/* Main Content */}
        <div className='flex-1 p-6'>
          {!showAddSignature ? (
            // Saved Signatures View
            <div className='space-y-4'>
              <div className='text-sm font-medium text-gray-700'>
                My Signatures
              </div>
              {savedSignatures.length === 0 ? (
                <div className='bg-blue-50 rounded-lg p-8 text-center'>
                  <div className='text-gray-500 mb-4'>No Signature found</div>
                </div>
              ) : (
                <div className='space-y-3'>
                  {savedSignatures.map((signature) => (
                    <div
                      key={signature.id}
                      className='bg-white border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow'
                    >
                      <div className='flex items-center space-x-3'>
                        <img
                          src={signature.data || "/placeholder.svg"}
                          alt={signature.name}
                          className='w-16 h-8 object-contain border rounded'
                        />
                        <div>
                          <div className='text-sm font-medium'>
                            {signature.name}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {new Date(signature.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className='flex ml-3 space-x-2'>
                        <Button
                          onClick={() => selectSignature(signature)}
                          size='sm'
                          className='bg-blue-600 hover:bg-blue-700'
                        >
                          Use
                        </Button>
                        <Button
                          onClick={() => deleteSignature(signature.id)}
                          size='sm'
                          variant='outline'
                        >
                          <X className='w-4 h-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button
                onClick={() => {
                  setShowAddSignature(true);
                  setCurrentMethod("draw");
                }}
                className='w-full bg-blue-600 hover:bg-blue-700 text-white'
              >
                Add New Signature
              </Button>
            </div>
          ) : (
            // Add Signature View
            <div className='space-y-6'>
              {renderSignatureMethod()}
              {currentMethod === "name" && (
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-gray-700'>
                    Your Name
                  </label>
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className='border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  />
                </div>
              )}
              <div
                className={
                  "flex justify-between " +
                  (currentMethod === "default" && "hidden")
                }
              >
                <Button
                  onClick={() => setShowAddSignature(false)}
                  variant='outline'
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveSignature}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-6'
                >
                  Save Signature
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
