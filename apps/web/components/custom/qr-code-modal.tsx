"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  QrCode,
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  ExternalLink,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
  subtitle?: string;
}

export function QrCodeModal({
  isOpen,
  onClose,
  url,
  title = "Smart Vector QR Code",
  subtitle = "Download print-ready vector SVG or high-resolution raster PNG.",
}: QrCodeModalProps) {
  const [svgContent, setSvgContent] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [darkColor, setDarkColor] = useState("#000000");
  const [lightColor, setLightColor] = useState("#ffffff");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!isOpen || !url) return;

    let isMounted = true;
    setIsGenerating(true);

    QRCode.toString(url, {
      type: "svg",
      margin: 1,
      color: {
        dark: darkColor,
        light: lightColor,
      },
    })
      .then((svg) => {
        if (isMounted) {
          setSvgContent(svg);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error("Failed to generate QR SVG:", err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, url, darkColor, lightColor]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const downloadSvg = () => {
    try {
      const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `linkforge-qr-${Date.now()}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      toast.success("Vector SVG downloaded!");
    } catch {
      toast.error("Failed to download SVG");
    }
  };

  const downloadPng = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 1024,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `linkforge-qr-1024x1024-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("High-res PNG downloaded (1024x1024)!");
    } catch {
      toast.error("Failed to download PNG");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="border-border bg-background relative z-10 w-full max-w-md overflow-hidden rounded-2xl border p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl">
              <QrCode size={20} />
            </div>
            <div>
              <h3 className="text-foreground text-base font-semibold">{title}</h3>
              <p className="text-muted-foreground text-xs">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* QR Code Preview Frame */}
        <div className="my-6 flex flex-col items-center">
          <div className="border-border/60 relative flex h-56 w-56 items-center justify-center overflow-hidden rounded-2xl border bg-white p-4 shadow-inner">
            {isGenerating ? (
              <div className="text-muted-foreground flex flex-col items-center gap-2 text-xs">
                <Sparkles size={20} className="animate-spin text-zinc-400" />
                <span>Generating...</span>
              </div>
            ) : svgContent ? (
              <div
                className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            ) : null}
          </div>

          {/* Target URL Badge */}
          <div className="border-border bg-muted/50 mt-4 flex max-w-full items-center gap-2 rounded-lg border px-3 py-1.5">
            <span className="text-muted-foreground truncate text-xs font-mono">
              {url}
            </span>
            <button
              onClick={handleCopyLink}
              className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
              title="Copy URL"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Color Palette Switcher */}
        <div className="border-border bg-muted/30 mb-6 flex items-center justify-between rounded-xl border p-3">
          <span className="text-foreground text-xs font-medium">Palette Style:</span>
          <div className="flex items-center gap-1.5">
            {[
              { dark: "#000000", light: "#ffffff", label: "Classic" },
              { dark: "#8b5cf6", light: "#ffffff", label: "Neon" },
              { dark: "#06b6d4", light: "#ffffff", label: "Cyan" },
              { dark: "#ea580c", light: "#ffffff", label: "Amber" },
              { dark: "#16a34a", light: "#ffffff", label: "Emerald" },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setDarkColor(preset.dark);
                  setLightColor(preset.light);
                }}
                className={`flex h-6 w-6 items-center justify-center rounded-full border transition-transform ${
                  darkColor === preset.dark
                    ? "ring-primary scale-110 ring-2"
                    : "border-black/10 hover:scale-105"
                }`}
                style={{ backgroundColor: preset.dark }}
                title={preset.label}
              />
            ))}
          </div>
        </div>

        {/* Download Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={downloadSvg}
            className="border-border bg-card hover:bg-accent text-foreground flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold shadow-sm transition-all hover:-translate-y-0.5"
          >
            <Layers size={15} className="text-primary" />
            <div className="text-left">
              <div>Download SVG</div>
              <div className="text-muted-foreground font-normal text-[10px]">
                Vector for Print
              </div>
            </div>
          </button>

          <button
            onClick={downloadPng}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-semibold shadow-sm transition-all hover:-translate-y-0.5"
          >
            <ImageIcon size={15} />
            <div className="text-left">
              <div>Download PNG</div>
              <div className="text-primary-foreground/80 font-normal text-[10px]">
                1024x1024 High-Res
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
