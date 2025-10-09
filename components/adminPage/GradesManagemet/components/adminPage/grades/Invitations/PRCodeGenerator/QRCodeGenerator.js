console.log("QRCodeGenerator loaded");

import React, { useState, useRef, useEffect } from "react";
import { Download, Copy, QrCode, RefreshCw } from "lucide-react";
import { toPng } from "html-to-image";
import { prCodeService } from "../services/prCodeService";

const QRCodeGenerator = ({ invite }) => {
  const [loadingAction, setLoadingAction] = useState(null); // "download" | "copy" | "regenerate"
  const [error, setError] = useState(null);
  const qrRef = useRef(null);

  useEffect(() => {
    console.log("[QRCodeGenerator] Mounted with invite:", invite);
  }, [invite]);

  // Normalize invite props
  const prCode = invite?.pr_code || invite?.prCode;
  const shortUrl = invite?.shortUrl || `https://www.schoolheadoffice.com//invite/${prCode}`;

  /** Download QR Code as PNG */
  const handleDownload = async () => {
    if (!qrRef.current) return;
    setLoadingAction("download");
    setError(null);
    console.log("[QRCodeGenerator] handleDownload triggered for PR code:", prCode);

    try {
      const dataUrl = await toPng(qrRef.current, { 
        quality: 1, 
        pixelRatio: 2, 
        backgroundColor: "#ffffff" 
      });
      const link = document.createElement("a");
      link.download = `schoolheadoffice-invite-${prCode}.png`;
      link.href = dataUrl;
      link.click();
      console.log("[QRCodeGenerator] QR code downloaded successfully");
    } catch (err) {
      console.error("[QRCodeGenerator] Error generating QR code:", err);
      setError("Failed to generate QR code image.");
    } finally {
      setLoadingAction(null);
    }
  };

  /** Copy QR Code to clipboard */
  const handleCopy = async () => {
    if (!qrRef.current) return;
    setLoadingAction("copy");
    setError(null);
    console.log("[QRCodeGenerator] handleCopy triggered for PR code:", prCode);

    try {
      const dataUrl = await toPng(qrRef.current, { 
        quality: 0.8, 
        pixelRatio: 1, 
        backgroundColor: "#ffffff" 
      });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      alert("QR code copied to clipboard!");
      console.log("[QRCodeGenerator] QR code copied successfully");
    } catch (err) {
      console.error("[QRCodeGenerator] Error copying QR code:", err);
      setError("Failed to copy QR code. Your browser may not support this feature.");
    } finally {
      setLoadingAction(null);
    }
  };

  /** Regenerate QR Code via API */
  const handleRegenerate = async () => {
    setLoadingAction("regenerate");
    setError(null);
    console.log("[QRCodeGenerator] handleRegenerate triggered for PR code:", prCode);

    try {
      await prCodeService.generateQRCode(prCode, { size: 300, format: "png" });
      alert("QR code regenerated successfully!");
      console.log("[QRCodeGenerator] QR code regenerated successfully");
    } catch (err) {
      console.error("[QRCodeGenerator] Error regenerating QR code:", err);
      setError(err?.response?.data?.message || "Failed to regenerate QR code.");
    } finally {
      setLoadingAction(null);
    }
  };

  console.log("[QRCodeGenerator] Rendering QRCodeGenerator for PR code:", prCode);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">QR Code Invitation</h3>

      {error && (
        <div className="mb-3 p-2 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* QR Code Preview */}
      <div className="flex flex-col items-center mb-4">
        <div ref={qrRef} className="bg-white p-4 border border-gray-200 rounded-lg flex flex-col items-center">
          <div className="w-32 h-32 bg-gray-100 flex items-center justify-center mb-2">
            {invite?.qrCodeData ? (
              <img src={invite.qrCodeData} alt="QR Code" className="w-full h-full" />
            ) : (
              <div className="text-center text-xs text-gray-500">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-1" />
                <p>QR Code Preview</p>
                <p className="text-[10px]">{prCode}</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {invite?.schoolId?.name || "School Invitation"}
            </p>
            <p className="text-xs text-gray-500">Scan to join</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={handleDownload}
          disabled={loadingAction !== null}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <Download className="h-4 w-4 mr-2" />
          {loadingAction === "download" ? "Generating..." : "Download QR Code"}
        </button>

        <button
          onClick={handleCopy}
          disabled={loadingAction !== null}
          className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <Copy className="h-4 w-4 mr-2" />
          {loadingAction === "copy" ? "Copying..." : "Copy QR Code"}
        </button>

        <button
          onClick={handleRegenerate}
          disabled={loadingAction !== null}
          className="w-full flex items-center justify-center px-4 py-2 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-md hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {loadingAction === "regenerate" ? "Regenerating..." : "Regenerate QR Code"}
        </button>
      </div>

      {/* Usage Instructions */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">QR Code Usage:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li className="flex items-start">
            <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
            Print for in-person events and orientation
          </li>
          <li className="flex items-start">
            <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
            Include in printed materials and brochures
          </li>
          <li className="flex items-start">
            <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
            Display on digital screens at school entrance
          </li>
          <li className="flex items-start">
            <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
            Share digitally via messaging apps
          </li>
        </ul>
      </div>

      {/* Short Link */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        <p>Scanning this code will take users to:</p>
        <p className="truncate text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded mt-1">
          {shortUrl}
        </p>
      </div>

      {/* Additional Features */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Format: PNG</span>
          <span>Size: 300x300</span>
          <span>Quality: High</span>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;