// src/pages/HostRoutes/EventQRCode.tsx
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useEvent } from "@/contexts/EventContext";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Download,
  Copy,
  Check,
  Share2,
  Printer,
  Eye,
  Users,
  Camera,
  RefreshCw,
} from "lucide-react";

const palette = {
  sp_eggshell: "#dad7cd",
  sp_lightgreen: "#a3b18a",
  sp_green: "#3a5a40",
  sp_midgreen: "#588157",
  sp_darkgreen: "#344e41",
};

export function EventQRCode() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { currentEvent, selectEvent } = useEvent();
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (eventId && (!currentEvent || currentEvent.id !== eventId)) {
      selectEvent(eventId);
    }
  }, [eventId, currentEvent, selectEvent]);

  if (!eventId) {
    return <Navigate to="/host" replace />;
  }

  const getJoinUrl = () => {
    if (!currentEvent?.sessionCode) return "";
    return `https://join.spevents.live/${currentEvent.sessionCode}/guest/camera`;
  };

  const displayJoinUrl = () => {
    if (!(getJoinUrl() === "")) {
      const removeHTTPS: number = 8;
      return getJoinUrl().substring(removeHTTPS);
    }
    return "";
  };

  const downloadQRCode = async () => {
    setIsGenerating(true);
    try {
      const svg = document.getElementById("event-qr-code");
      if (!svg) return;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const data = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      const svgBlob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const scale = 4; // Higher quality
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        const imgURI = canvas
          .toDataURL("image/png")
          .replace("image/png", "image/octet-stream");

        const downloadLink = document.createElement("a");
        downloadLink.download = `${
          currentEvent?.name?.replace(/[^a-zA-Z0-9]/g, "-") || "event"
        }-qr-code.png`;
        downloadLink.href = imgURI;
        downloadLink.click();
      };

      img.src = url;
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    const url = getJoinUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${currentEvent?.name || "Event"}`,
          text: "Scan this QR code to join our photo sharing event!",
          url: getJoinUrl(),
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      copyToClipboard();
    }
  };

  const printQRCode = () => {
    const printWindow = window.open("", "_blank");
    const qrCodeElement = document.getElementById("event-qr-code");
    if (!printWindow || !qrCodeElement) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Codes - ${currentEvent?.name || "Event"}</title>
          <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Quicksand', sans-serif; 
              background: ${palette.sp_eggshell};
              padding: 5px 1px;
              color: ${palette.sp_darkgreen};
            }
            .page-header {
              text-align: center;
              margin-bottom: 30px;
              background: ${palette.sp_green};
              padding: 20px;
              border-radius: 12px;
              color: ${palette.sp_eggshell};
            }
            .page-header h1 {
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            .page-header p {
              font-size: 16px;
              opacity: 0.9;
            }
            .qr-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              max-width: 100%;
              margin: 0 auto;
              justify-items: center;
            }
            .qr-card {
              background: ${palette.sp_green};
              border-radius: 16px;
              padding: 20px;
              text-align: center;
              border: 3px solid ${palette.sp_midgreen};
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .qr-card svg {
              background: ${palette.sp_eggshell} !important;
              border-radius: 8px;
              padding: 8px;
              margin-bottom: 12px;
            }
            .qr-title {
              color: ${palette.sp_eggshell};
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 6px;
            }
            .qr-code {
              color: ${palette.sp_lightgreen};
              font-size: 12px;
              font-weight: 500;
              letter-spacing: 1px;
            }
            .cut-lines {
              position: absolute;
              top: 0; left: 0; right: 0; bottom: 0;
              pointer-events: none;
              border: 2px dashed ${palette.sp_midgreen};
              opacity: 0.3;
            }
            @media print {
              body { 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact;
                background: ${palette.sp_eggshell} !important;
              }
              .cut-lines { display: none; }
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: ${palette.sp_green};
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="page-header">
            <h1>${currentEvent?.name || "Event"}</h1>
            <p>Scan to Join • Session: ${currentEvent?.sessionCode}</p>
          </div>
          
          <div class="qr-grid">
            ${Array(9)
              .fill(
                `
              <div class="qr-card">
                <div class="qr-title">Photo Sharing</div>
                ${qrCodeElement.outerHTML}
                <div class="qr-code">${currentEvent?.sessionCode}</div>
              </div>
            `,
              )
              .join("")}
          </div>
          
          <div class="footer">
            Cut along card edges • No app required • Works with any phone camera
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: palette.sp_darkgreen }}
    >
      {/* Header */}
      <div
        style={{ backgroundColor: palette.sp_green }}
        className="border-b border-black/20"
      >
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/host/event/${eventId}/gallery`)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft
                  className="w-5 h-5"
                  style={{ color: palette.sp_eggshell }}
                />
              </button>
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{ color: palette.sp_eggshell }}
                >
                  Event QR Code
                </h1>
                <p style={{ color: palette.sp_lightgreen }}>
                  {currentEvent?.name || "Event"} • Session:{" "}
                  {currentEvent?.sessionCode}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 px-3 py-1 rounded-full"
                style={{ backgroundColor: palette.sp_midgreen }}
              >
                <Eye
                  className="w-4 h-4"
                  style={{ color: palette.sp_eggshell }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: palette.sp_eggshell }}
                >
                  Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* QR Code - Main Feature */}
          <div className="lg:col-span-2">
            <div
              className="rounded-xl p-8 text-center"
              style={{ backgroundColor: palette.sp_green }}
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <Camera
                  style={{ color: palette.sp_lightgreen }}
                  className="w-6 h-6"
                />
                <h2
                  className="text-2xl font-bold"
                  style={{ color: palette.sp_eggshell }}
                >
                  Guest Access QR Code
                </h2>
              </div>

              {currentEvent?.sessionCode ? (
                <div className="space-y-6">
                  {/* QR Code */}
                  <div className="mx-auto w-fit">
                    <div
                      className="p-8 rounded-2xl inline-block shadow-2xl"
                      style={{ backgroundColor: palette.sp_eggshell }}
                    >
                      <QRCodeSVG
                        id="event-qr-code"
                        value={getJoinUrl()}
                        size={300}
                        level="H"
                        includeMargin
                        fgColor={palette.sp_darkgreen}
                        bgColor={palette.sp_eggshell}
                      />
                    </div>
                  </div>

                  {/* Guest count indicator */}
                  <div
                    className="flex items-center justify-center gap-2 text-sm"
                    style={{ color: palette.sp_lightgreen }}
                  >
                    <Users className="w-4 h-4" />
                    <span>Ready for guests to join</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={downloadQRCode}
                      disabled={isGenerating}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50"
                      style={{
                        backgroundColor: palette.sp_midgreen,
                        color: palette.sp_eggshell,
                      }}
                    >
                      {isGenerating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Download HD
                    </button>

                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
                      style={{
                        backgroundColor: palette.sp_lightgreen,
                        color: palette.sp_darkgreen,
                      }}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Link
                        </>
                      )}
                    </button>

                    <button
                      onClick={shareQRCode}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
                      style={{
                        backgroundColor: palette.sp_midgreen,
                        color: palette.sp_eggshell,
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>

                    <button
                      onClick={printQRCode}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
                      style={{
                        backgroundColor: palette.sp_lightgreen,
                        color: palette.sp_darkgreen,
                      }}
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ color: palette.sp_lightgreen }}>
                  No session code available
                </div>
              )}
            </div>
          </div>

          {/* Instructions & Info */}
          <div className="space-y-6">
            {/* How to Use */}
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: palette.sp_green }}
            >
              <h3
                className="text-lg font-bold mb-4 flex items-center gap-2"
                style={{ color: palette.sp_eggshell }}
              >
                <Users className="w-5 h-5" />
                How It Works
              </h3>

              <div className="space-y-4">
                {[
                  {
                    step: "1",
                    title: "Display QR Code",
                    desc: "Show at your event entrance or share digitally",
                  },
                  {
                    step: "2",
                    title: "Guests Scan",
                    desc: "Works with any phone camera - no app needed",
                  },
                  {
                    step: "3",
                    title: "Photos Flow In",
                    desc: "Watch memories appear live on your slideshow",
                  },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        backgroundColor: palette.sp_midgreen,
                        color: palette.sp_eggshell,
                      }}
                    >
                      {step}
                    </div>
                    <div>
                      <h4
                        className="font-medium"
                        style={{ color: palette.sp_eggshell }}
                      >
                        {title}
                      </h4>
                      <p
                        className="text-sm"
                        style={{ color: palette.sp_lightgreen }}
                      >
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* URL Display */}
            // src/components/GuestAccess/DirectLinkSection.jsx
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: palette.sp_green }}
            >
              <h4
                className="font-medium mb-4"
                style={{ color: palette.sp_eggshell }}
              >
                Direct Link:
              </h4>
              <div
                className="p-6 rounded-lg break-all min-h-6 flex items-center"
                style={{ backgroundColor: palette.sp_darkgreen }}
              >
                <code
                  className="text-xs leading-relaxed"
                  style={{ color: palette.sp_lightgreen }}
                >
                  {displayJoinUrl()}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
