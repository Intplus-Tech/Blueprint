/* eslint-disable @next/next/no-img-element */
"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { X, Clock, Type } from "lucide-react";

type SignatureMethod = "name" | "default" | "text";

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

export default function AddText({
  onSignatureSelect,
  onClose,
}: AddSignatureProps) {
  const [currentMethod, setCurrentMethod] =
    useState<SignatureMethod>("default");
  const [savedSignatures, setSavedSignatures] = useState<SavedSignature[]>([]);
  const [showAddSignature, setShowAddSignature] = useState(false);
  const [userName, setUserName] = useState("John Doe");
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const generateNameSignature = (name: string): string => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    canvas.width = 400;
    canvas.height = 150;

    // Fill with white background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Enhanced text rendering for smoother appearance
    ctx.font = "42px sans-serif";

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
      case "text":
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
      case "default":
        return (
          <div className='space-y-3'>
            {!savedSignatures.length && (
              <div className='space-y-4'>
                <div className='text-sm font-medium text-gray-700'>
                  My Names
                </div>
                <div className='bg-blue-50 rounded-lg p-8 text-center'>
                  <div className='text-gray-500 mb-4'>No Name found</div>
                </div>
              </div>
            )}
            {savedSignatures.filter((sig) => sig.type === "text").map((signature) => (
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
      case "text":
        return (
          <div className='w-[350px] space-y-4'>
            <div className='text-sm font-medium text-gray-700'>
              Use your name
            </div>
            <div className='bg-blue-50 rounded-lg p-4'>
              <div className='bg-white rounded border-b-2 border-gray-400 p-4 text-center'>
                <div className='text-2xl  text-gray-800'>{userName}</div>
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
            onClick={() => {
                  setShowAddSignature(true);
                  setCurrentMethod("text");
                }}
            className={`p-4 hover:bg-gray-100 ${
              currentMethod === "text"
                ? "bg-white border-r-2 border-blue-600"
                : ""
            }`}
          >
            <Type className='w-5 h-5 text-gray-600' />
          </button>
        </div>

        {/* Main Content */}
        <div className='flex-1 p-6'>
          {!showAddSignature ? (
            // Saved Signatures View
            <div className='space-y-4'>
              <div className='text-sm font-medium text-gray-700'>
                My Name
              </div>
              {savedSignatures.length === 0 ? (
                <div className='bg-blue-50 rounded-lg p-8 text-center'>
                  <div className='text-gray-500 mb-4'>No Signature found</div>
                </div>
              ) : (
                <div className='space-y-3'>
                  {savedSignatures
                    .filter((sig) => sig.type === "text")
                    .map((signature) => (
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
                              {new Date(
                                signature.timestamp
                              ).toLocaleDateString()}
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
                  setCurrentMethod("text");
                }}
                className='w-full bg-blue-600 hover:bg-blue-700 text-white'
              >
                Add Your Name
              </Button>
            </div>
          ) : (
            // Add Signature View
            <div className='space-y-6'>
              {renderSignatureMethod()}
              {currentMethod === "text" && (
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
