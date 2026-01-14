import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Copy } from "lucide-react";
import { Learner } from "../../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Channel {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface ChannelSelectionProps {
  channels: Channel[];
  selectedChannels: string[];
  learners: Learner[];
  schoolName: string;
  schools: any[];
  school: any;
  onChannelSelection: (channelId: string) => void;
  onSelectAllChannels: () => void;
}

export const ChannelSelection: React.FC<ChannelSelectionProps> = ({
  channels,
  selectedChannels,
  learners,
  schoolName,
  schools,
  school,
  onChannelSelection,
  onSelectAllChannels,
}) => {
  console.log("🏫 [ChannelSelection] Component mounted");
  console.log("📦 [ChannelSelection] Props received:", {
    schoolName: schoolName,
    schools: schools,
    school: school,
    schoolsCount: schools?.length || 0,
    channelsCount: channels.length,
    selectedChannelsCount: selectedChannels.length,
    learnersCount: learners.length
  });

  // Heavy schools prop logging
  console.log("🔍 [ChannelSelection] SCHOOLS PROP ANALYSIS:");
  if (schools && Array.isArray(schools)) {
    schools.forEach((schoolItem, index) => {
      console.log(`🏫 School [${index}]:`, {
        id: schoolItem?.id || schoolItem?._id,
        name: schoolItem?.schoolName || schoolItem?.name,
        email: schoolItem?.schoolEmail || schoolItem?.email
      });
    });
  }

  // Determine the actual school name to use
  const actualSchoolName = schoolName || school?.schoolName || school?.name || "your school";
  const schoolId = school?.id || school?._id || schools?.[0]?.id || schools?.[0]?._id;

  console.log("🎯 [ChannelSelection] ACTUAL SCHOOL DATA:", {
    actualSchoolName: actualSchoolName,
    schoolId: schoolId,
    schoolObject: school
  });

  const [copied, setCopied] = useState<string | null>(null);
  const [prCode, setPrCode] = useState<string | null>(null);
  const [isGeneratingPrCode, setIsGeneratingPrCode] = useState(false);
  const [prCodeError, setPrCodeError] = useState<string | null>(null);

  // Generate school PR code when component mounts
  useEffect(() => {
    const generateSchoolPrCode = async () => {
      if (!schoolId || !actualSchoolName) {
        console.warn("❌ [ChannelSelection] Cannot generate PR code: missing school ID or name");
        return;
      }

      console.log("🚀 [ChannelSelection] Auto-generating PR code for school:", {
        schoolId,
        schoolName: actualSchoolName
      });

      setIsGeneratingPrCode(true);
      setPrCodeError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/schools/${schoolId}/pr_codes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pr_code: {
              purpose: "enrollment",
              metadata: {
                school_name: actualSchoolName,
                academic_year: "2024",
                generated_at: new Date().toISOString(),
                scope: "school_wide",
                channels: selectedChannels // Include selected channels in metadata
              }
            }
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ [ChannelSelection] PR code generated successfully:", data);
        
        // Assuming the response has a structure like { pr_code: { code: "ABC123", ... } }
        const generatedCode = data.pr_code?.code || data.code;
        if (generatedCode) {
          setPrCode(generatedCode);
          console.log("🎉 [ChannelSelection] PR Code stored:", generatedCode);
        } else {
          throw new Error("No PR code in response");
        }

      } catch (error) {
        console.error("❌ [ChannelSelection] Failed to generate PR code:", error);
        setPrCodeError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setIsGeneratingPrCode(false);
      }
    };

    generateSchoolPrCode();
  }, [schoolId, actualSchoolName]); // Regenerate if schoolId or name changes

  // Generate school link with actual school data and PR code
  const schoolLink = prCode 
    ? `https://www.schoolheadoffice.com/school/${encodeURIComponent(schoolId)}/${encodeURIComponent(actualSchoolName)}?prcode=${prCode}`
    : `https://www.schoolheadoffice.com/school/${encodeURIComponent(schoolId)}/${encodeURIComponent(actualSchoolName)}`;

  console.log("🔗 [ChannelSelection] Generated school link:", schoolLink);
  console.log("🔑 [ChannelSelection] PR Code status:", {
    hasPrCode: !!prCode,
    prCode: prCode,
    isGenerating: isGeneratingPrCode,
    error: prCodeError
  });

  // ✅ Invitation template (default message)
  const defaultMessage = `Hello 👋,

You are invited to join the ${actualSchoolName} community on SchoolHeadOffice 🎓. 
Stay updated with school news, events, and more!

Click here to join: ${schoolLink}`;

  const [message, setMessage] = useState(defaultMessage);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  console.log("🎨 [ChannelSelection] Rendering component");

  return (
    <div className="space-y-6 mb-8">
      {/* School Info Header with PR Code Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">School Information</h3>
        <div className="text-sm text-blue-700">
          <p><strong>School:</strong> {actualSchoolName}</p>
          <p><strong>ID:</strong> {schoolId}</p>
          <p><strong>Total Schools:</strong> {schools?.length || 0}</p>
          <div className="mt-2 p-2 bg-white rounded border">
            <strong>PR Code Status:</strong>
            {isGeneratingPrCode && (
              <span className="ml-2 text-yellow-600">🔄 Generating PR Code...</span>
            )}
            {prCode && (
              <span className="ml-2 text-green-600">✅ PR Code: {prCode}</span>
            )}
            {prCodeError && (
              <span className="ml-2 text-red-600">❌ Error: {prCodeError}</span>
            )}
            {!isGeneratingPrCode && !prCode && !prCodeError && (
              <span className="ml-2 text-gray-600">⏳ PR Code not generated</span>
            )}
          </div>
        </div>
      </div>

      {/* 🔹 Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className={`border rounded-2xl shadow-sm p-5 transition-all ${
              selectedChannels.includes(channel.id)
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-400"
            }`}
            onClick={() => onChannelSelection(channel.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                    selectedChannels.includes(channel.id)
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {channel.icon}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedChannels.includes(channel.id)}
                    onChange={() => onChannelSelection(channel.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="ml-2 font-medium text-gray-900">
                    {channel.name}
                  </span>
                </label>

                {/* ✅ Always black description */}
                <p className="mt-1 text-sm text-black">{channel.description}</p>

                {/* ✅ QR + Link + Copy */}
                <div className="mt-4 flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <QRCode value={schoolLink} size={64} />
                  </div>
                  <div className="flex-1 text-xs text-gray-700 break-all">
                    <a
                      href={schoolLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {schoolLink}
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(schoolLink);
                      }}
                      className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      <Copy className="w-3 h-3 mr-1" /> Copy
                    </button>
                    {copied === schoolLink && (
                      <span className="ml-2 text-green-600 font-medium">
                        ✅ Copied!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 Invitation Composer */}
      {selectedChannels.length > 0 && (
        <div className="p-5 border rounded-xl bg-white shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">
            ✉️ Compose Your Invitation Message for {actualSchoolName}
          </h3>

          <div className="flex flex-col md:flex-row md:items-start gap-4">
            {/* Text Area */}
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 border rounded-lg text-sm text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={6}
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleCopy(message)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Copy Message
                </button>
                <button
                  onClick={() => handleCopy(schoolLink)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Copy Link Only
                </button>
                {copied && copied !== schoolLink && (
                  <span className="text-green-600 text-xs font-medium">
                    ✅ Message Copied!
                  </span>
                )}
              </div>
            </div>

            {/* QR code beside text */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <QRCode value={schoolLink} size={96} />
              <p className="mt-2 text-xs text-gray-600">Scan to join {actualSchoolName}</p>
              <p className="text-xs text-gray-500 mt-1">School ID: {schoolId}</p>
              {prCode && (
                <p className="text-xs text-green-600 mt-1">PR Code: {prCode}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
