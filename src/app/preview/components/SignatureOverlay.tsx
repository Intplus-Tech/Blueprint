"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SignaturePosition {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  page: number
}

interface PlacedSignature extends SignaturePosition {
  id: string
  data: string
  name: string
}

interface SignatureOverlayProps {
  pdfCanvasRef: React.RefObject<HTMLCanvasElement>
  currentPage: number
  onSignaturesChange?: (signatures: PlacedSignature[]) => void
}

export default function SignatureOverlay({ pdfCanvasRef, currentPage, onSignaturesChange }: SignatureOverlayProps) {
  const [placedSignatures, setPlacedSignatures] = useState<PlacedSignature[]>([])
  const [selectedSignature, setSelectedSignature] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Load signatures from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`pdfSignatures_${currentPage}`)
    if (saved) {
      const signatures = JSON.parse(saved)
      setPlacedSignatures(signatures)
      onSignaturesChange?.(signatures)
    }
  }, [currentPage, onSignaturesChange])

  // Save signatures to localStorage
  const saveSignatures = (signatures: PlacedSignature[]) => {
    localStorage.setItem(`pdfSignatures_${currentPage}`, JSON.stringify(signatures))
    onSignaturesChange?.(signatures)
  }

  const addSignature = (signatureData: string, signatureName: string) => {
    const canvas = pdfCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const newSignature: PlacedSignature = {
      id: Date.now().toString(),
      data: signatureData,
      name: signatureName,
      x: rect.width / 2 - 100,
      y: rect.height / 2 - 50,
      width: 200,
      height: 100,
      rotation: 0,
      page: currentPage,
    }

    const updatedSignatures = [...placedSignatures, newSignature]
    setPlacedSignatures(updatedSignatures)
    saveSignatures(updatedSignatures)
  }

  const removeSignature = (id: string) => {
    const updatedSignatures = placedSignatures.filter((sig) => sig.id !== id)
    setPlacedSignatures(updatedSignatures)
    saveSignatures(updatedSignatures)
  }

  const updateSignaturePosition = (id: string, x: number, y: number) => {
    const updatedSignatures = placedSignatures.map((sig) => (sig.id === id ? { ...sig, x, y } : sig))
    setPlacedSignatures(updatedSignatures)
    saveSignatures(updatedSignatures)
  }

  const rotateSignature = (id: string) => {
    const updatedSignatures = placedSignatures.map((sig) =>
      sig.id === id ? { ...sig, rotation: (sig.rotation + 90) % 360 } : sig,
    )
    setPlacedSignatures(updatedSignatures)
    saveSignatures(updatedSignatures)
  }

  const handleMouseDown = (e: React.MouseEvent, signatureId: string) => {
    e.preventDefault()
    setSelectedSignature(signatureId)
    setIsDragging(true)

    const signature = placedSignatures.find((sig) => sig.id === signatureId)
    if (signature) {
      setDragOffset({
        x: e.clientX - signature.x,
        y: e.clientY - signature.y,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedSignature) return

    const canvas = pdfCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, rect.width - 200))
    const y = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, rect.height - 100))

    updateSignaturePosition(selectedSignature, x, y)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
  }

  // Expose addSignature method
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).addSignatureToCanvas = addSignature
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      {placedSignatures
        .filter((sig) => sig.page === currentPage)
        .map((signature) => (
          <div
            key={signature.id}
            className={`absolute pointer-events-auto cursor-move border-2 ${
              selectedSignature === signature.id
                ? "border-blue-500 bg-blue-50"
                : "border-transparent hover:border-gray-300"
            } rounded group`}
            style={{
              left: signature.x,
              top: signature.y,
              width: signature.width,
              height: signature.height,
              transform: `rotate(${signature.rotation}deg)`,
            }}
            onMouseDown={(e) => handleMouseDown(e, signature.id)}
          >
            <img
              src={signature.data || "/placeholder.svg"}
              alt={signature.name}
              className="w-full h-full object-contain"
              draggable={false}
            />

            {selectedSignature === signature.id && (
              <div className="absolute -top-8 left-0 flex space-x-1 bg-white border rounded shadow-lg p-1">
                <Button size="sm" variant="ghost" onClick={() => rotateSignature(signature.id)} className="h-6 w-6 p-0">
                  <RotateCw className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeSignature(signature.id)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        ))}
    </div>
  )
}
