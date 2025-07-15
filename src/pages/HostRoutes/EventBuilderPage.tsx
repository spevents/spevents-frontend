// src/pages/HostRoutes/EventBuilderPage.tsx

import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Eye,
  Palette,
  Image,
  Layout,
  Settings,
  Upload,
  X,
  LayoutTemplate,
  Presentation,
  Hotel,
  AlignHorizontalSpaceAround,
  Trash2,
} from "lucide-react";
import { EventData, colors } from "../../types/eventTypes";
import BuilderFunSlideshow from "./BuilderSlideshows/BuilderFunSlideshow";
import BuilderPresenterSlideshow from "./BuilderSlideshows/BuilderPresenterSlideshow";
import BuilderModelSlideshow from "./BuilderSlideshows/BuilderModelSlideshow";
import BuilderMarqueeSlideshow from "./BuilderSlideshows/BuilderMarqueeSlideshow";

interface PreviewPhoto {
  id: string;
  src: string;
  createdAt: number;
  transitionId: string;
  expiryTime: number;
}

interface PhotoWithStringDate {
  src: string;
  id: string;
  createdAt: string;
}

type SlideshowMode = "simple" | "fun" | "presenter" | "model" | "marquee";

const slideshowModes = [
  {
    id: "simple",
    name: "Classic",
    icon: Layout,
    description: "Clean, simple slideshow",
  },
  {
    id: "fun",
    name: "Dynamic",
    icon: LayoutTemplate,
    description: "Animated photo collage",
  },
  {
    id: "presenter",
    name: "Presenter",
    icon: Presentation,
    description: "Professional 3-grid layout",
  },
  {
    id: "model",
    name: "Elegant",
    icon: Hotel,
    description: "Sophisticated display",
  },
  {
    id: "marquee",
    name: "Marquee",
    icon: AlignHorizontalSpaceAround,
    description: "Scrolling photo strips",
  },
];

const colorThemes = [
  {
    id: "default",
    name: "Forest Green",
    primary: colors.green,
    secondary: colors.lightGreen,
  },
  { id: "ocean", name: "Ocean Blue", primary: "#2563eb", secondary: "#60a5fa" },
  {
    id: "sunset",
    name: "Sunset Orange",
    primary: "#ea580c",
    secondary: "#fb923c",
  },
  {
    id: "purple",
    name: "Royal Purple",
    primary: "#7c3aed",
    secondary: "#a78bfa",
  },
  { id: "rose", name: "Rose Pink", primary: "#e11d48", secondary: "#fb7185" },
];

export function EventBuilderPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [eventData, setEventData] = useState<EventData>({
    name: "My New Event",
    date: new Date().toISOString().split("T")[0],
    startTime: "19:00",
    endTime: "23:00",
    duration: 4,
    location: "",
    description: "",
    expectedGuests: "50",
    theme: "default",
    allowDownloads: true,
    moderatePhotos: false,
    customLink: "",
    sessionCode: "",
    colors: {
      primary: colors.green,
      secondary: colors.lightGreen,
    },
    slideshowViews: [
      {
        id: 1,
        name: "Main Display",
        type: "slideshow",
        preset: "simple",
        isDefault: true,
      },
    ],
  });

  const [activeSection, setActiveSection] = useState<
    "details" | "slideshow" | "photos" | "design" | "layout"
  >("slideshow");
  const [selectedMode, setSelectedMode] = useState<SlideshowMode>("simple");
  const [selectedTheme, setSelectedTheme] = useState(colorThemes[0]);

  const [previewPhotos, setPreviewPhotos] = useState<PreviewPhoto[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Sample photos for demonstration
  const samplePhotos = [
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400",
    "https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=400",
    "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400",
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400",
    "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400",
  ];

  // Convert preview photos to format expected by slideshow components
  const convertPhotosForSlideshow = (
    photos: PreviewPhoto[],
  ): PhotoWithStringDate[] => {
    return photos.map((photo) => ({
      src: photo.src,
      id: photo.id,
      createdAt: new Date(photo.createdAt).toISOString(),
    }));
  };

  const generateSamplePhotos = useCallback(() => {
    const photos: PreviewPhoto[] = samplePhotos.map((src, index) => ({
      id: `sample-${index}`,
      src,
      createdAt: Date.now() - index * 10000,
      transitionId: `sample-${index}-${Date.now()}`,
      expiryTime: Date.now() + 30000,
    }));
    setPreviewPhotos(photos);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newPhoto: PreviewPhoto = {
            id: `upload-${Date.now()}-${index}`,
            src: e.target.result as string,
            createdAt: Date.now(),
            transitionId: `upload-${Date.now()}-${index}`,
            expiryTime: Date.now() + 30000,
          };
          setPreviewPhotos((prev) => [...prev, newPhoto]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/"),
    );

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newPhoto: PreviewPhoto = {
            id: `drop-${Date.now()}-${index}`,
            src: e.target.result as string,
            createdAt: Date.now(),
            transitionId: `drop-${Date.now()}-${index}`,
            expiryTime: Date.now() + 30000,
          };
          setPreviewPhotos((prev) => [...prev, newPhoto]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleThemeChange = (theme: (typeof colorThemes)[0]) => {
    setSelectedTheme(theme);
    setEventData((prev) => ({
      ...prev,
      colors: {
        primary: theme.primary,
        secondary: theme.secondary,
      },
    }));
  };

  const handleModeChange = (mode: SlideshowMode) => {
    setSelectedMode(mode);
    setEventData((prev) => ({
      ...prev,
      slideshowViews: [
        {
          ...prev.slideshowViews[0],
          preset: mode,
        },
      ],
    }));
  };

  const handleSave = () => {
    console.log("Saving event:", eventData);
  };

  const handlePublish = () => {
    console.log("Publishing event:", eventData);
    navigate("/host");
  };

  const renderSlideshowPreview = () => {
    const containerDimensions = { width: 800, height: 450 };
    const photosForSlideshow = convertPhotosForSlideshow(previewPhotos);

    if (photosForSlideshow.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-400">
            <Image className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg mb-2">Your slideshow will appear here</p>
            <p className="text-sm">Add photos to see a live preview</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      photos: photosForSlideshow,
      containerDimensions,
      themeColors: eventData.colors,
      selectedMode,
      onModeChange: (mode: string) => handleModeChange(mode as SlideshowMode),
      hideUI: false,
    };

    switch (selectedMode) {
      case "fun":
        return <BuilderFunSlideshow {...commonProps} />;
      case "presenter":
        return <BuilderPresenterSlideshow {...commonProps} />;
      case "model":
        return <BuilderModelSlideshow {...commonProps} />;
      case "marquee":
        return <BuilderMarqueeSlideshow {...commonProps} />;
      default:
        // Simple mode
        return (
          <div
            className="relative w-full h-full overflow-hidden flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${eventData.colors.primary}40, ${eventData.colors.secondary}20)`,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={photosForSlideshow[0]?.id}
                src={photosForSlideshow[0]?.src}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
                style={{
                  border: `3px solid ${eventData.colors.secondary}60`,
                  boxShadow: `0 0 20px ${eventData.colors.primary}30`,
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              />
            </AnimatePresence>

            {/* Mode Switcher */}
            <div className="absolute top-4 right-4">
              <div className="flex gap-1 bg-black/20 backdrop-blur-sm rounded-lg p-1">
                {slideshowModes.map((mode) => {
                  const IconComponent = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => handleModeChange(mode.id as SlideshowMode)}
                      className={`p-2 rounded-md transition-colors ${
                        selectedMode === mode.id
                          ? "bg-white text-black"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                      title={mode.name}
                    >
                      <IconComponent size={16} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode Info */}
            <div
              className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: eventData.colors.primary + "80",
                color: "white",
              }}
            >
              Classic Mode
            </div>
          </div>
        );
    }
  };

  const SidebarSection = ({
    title,
    icon: Icon,
    isActive,
    onClick,
  }: {
    id: string;
    title: string;
    icon: any;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all`}
      style={{
        background: isActive
          ? `linear-gradient(to right, ${eventData.colors.primary}, ${eventData.colors.secondary})`
          : "transparent",
        color: isActive ? "white" : eventData.colors.primary,
      }}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{title}</span>
    </button>
  );

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${eventData.colors.secondary}20, ${eventData.colors.primary}10)`,
      }}
    >
      {/* Sidebar */}
      <div className="w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200 flex flex-col shadow-xl">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/host")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1
                className="text-lg font-semibold"
                style={{ color: eventData.colors.primary }}
              >
                Event Builder
              </h1>
              <p className="text-sm text-gray-600">
                Design your event experience
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-white"
              style={{
                background: `linear-gradient(to right, ${eventData.colors.primary}, ${eventData.colors.secondary})`,
              }}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-2">
          <SidebarSection
            id="details"
            title="Event Details"
            icon={Settings}
            isActive={activeSection === "details"}
            onClick={() => setActiveSection("details")}
          />
          <SidebarSection
            id="photos"
            title="Photos"
            icon={Image}
            isActive={activeSection === "photos"}
            onClick={() => setActiveSection("photos")}
          />
          <SidebarSection
            id="design"
            title="Design & Colors"
            icon={Palette}
            isActive={activeSection === "design"}
            onClick={() => setActiveSection("design")}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {activeSection === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={eventData.name}
                    onChange={(e) =>
                      setEventData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventData.date}
                    onChange={(e) =>
                      setEventData((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={eventData.startTime}
                      onChange={(e) =>
                        setEventData((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={eventData.endTime}
                      onChange={(e) =>
                        setEventData((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={eventData.location}
                    onChange={(e) =>
                      setEventData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Event location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Guests
                  </label>
                  <input
                    type="number"
                    value={eventData.expectedGuests}
                    onChange={(e) =>
                      setEventData((prev) => ({
                        ...prev,
                        expectedGuests: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={eventData.description}
                    onChange={(e) =>
                      setEventData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Tell guests about your event..."
                  />
                </div>
              </motion.div>
            )}

            {activeSection === "photos" && (
              <motion.div
                key="photos"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Manage Photos
                  </h3>

                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                      isDragging
                        ? "bg-opacity-5"
                        : "border-gray-300 hover:border-opacity-50"
                    }`}
                    style={{
                      borderColor: isDragging
                        ? eventData.colors.primary
                        : undefined,
                      backgroundColor: isDragging
                        ? eventData.colors.primary + "0D"
                        : undefined,
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag & drop photos here or
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="font-medium text-sm hover:opacity-80"
                      style={{ color: eventData.colors.primary }}
                    >
                      browse files
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Sample Photos Button */}
                  <button
                    onClick={generateSamplePhotos}
                    className="w-full p-3 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: eventData.colors.secondary + "33",
                      color: eventData.colors.primary,
                    }}
                  >
                    Add Sample Photos for Preview
                  </button>

                  {/* Photo Grid */}
                  {previewPhotos.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          Photos ({previewPhotos.length})
                        </h4>
                        <button
                          onClick={() => setPreviewPhotos([])}
                          className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Clear All
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {previewPhotos.map((photo) => (
                          <div key={photo.id} className="relative group">
                            <img
                              src={photo.src}
                              alt="Preview"
                              className="w-full h-20 object-cover rounded-lg"
                              style={{
                                border: `2px solid ${eventData.colors.secondary}`,
                              }}
                            />
                            <button
                              onClick={() =>
                                setPreviewPhotos((prev) =>
                                  prev.filter((p) => p.id !== photo.id),
                                )
                              }
                              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeSection === "design" && (
              <motion.div
                key="design"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Color Themes
                  </h3>
                  <div className="space-y-3">
                    {colorThemes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => handleThemeChange(theme)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          selectedTheme.id === theme.id
                            ? "border-opacity-100 bg-opacity-5"
                            : "border-gray-200 hover:border-opacity-50"
                        }`}
                        style={{
                          borderColor:
                            selectedTheme.id === theme.id
                              ? theme.primary
                              : undefined,
                          backgroundColor:
                            selectedTheme.id === theme.id
                              ? theme.primary + "0D"
                              : undefined,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: theme.primary }}
                            />
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: theme.secondary }}
                            />
                          </div>
                          <span className="font-medium">{theme.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handlePublish}
            className="w-full py-3 rounded-lg font-medium transition-all transform hover:scale-105 text-white"
            style={{
              background: `linear-gradient(to right, ${eventData.colors.primary}, ${eventData.colors.secondary})`,
            }}
          >
            Publish Event
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 relative">
        {isPreviewMode ? (
          // Full Preview Mode
          <div className="relative h-full bg-gray-900">
            {renderSlideshowPreview()}

            {/* Exit Preview Button */}
            <button
              onClick={() => setIsPreviewMode(false)}
              className="absolute top-6 right-6 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        ) : (
          // Builder Mode
          <div className="h-full flex items-center justify-center p-8">
            <div className="max-w-4xl w-full">
              {/* Header */}
              <div className="text-center mb-8">
                <h2
                  className="text-3xl font-bold mb-2"
                  style={{ color: eventData.colors.primary }}
                >
                  {eventData.name}
                </h2>
                <p className="text-gray-600">
                  Design your perfect event slideshow experience
                </p>
              </div>

              {/* Preview Canvas */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
                <div
                  className="p-4"
                  style={{
                    background: `linear-gradient(to right, ${eventData.colors.primary}, ${eventData.colors.secondary})`,
                  }}
                >
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-white/30" />
                      <span className="font-medium">
                        {
                          slideshowModes.find((m) => m.id === selectedMode)
                            ?.name
                        }{" "}
                        Mode
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm opacity-75">
                        {previewPhotos.length} photos
                      </div>
                      {/* Mode Switcher */}
                      <div className="flex gap-1 bg-black/20 rounded-lg p-1">
                        {slideshowModes.map((mode) => {
                          const IconComponent = mode.icon;
                          return (
                            <button
                              key={mode.id}
                              onClick={() =>
                                handleModeChange(mode.id as SlideshowMode)
                              }
                              className={`p-2 rounded-md transition-colors ${
                                selectedMode === mode.id
                                  ? "bg-white text-black"
                                  : "text-white/70 hover:text-white hover:bg-white/10"
                              }`}
                              title={mode.name}
                            >
                              <IconComponent size={16} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="aspect-video bg-gray-900 relative">
                  {renderSlideshowPreview()}

                  {/* Mode Info Overlay */}
                  {previewPhotos.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg"
                    >
                      <div className="text-sm font-medium">
                        {
                          slideshowModes.find((m) => m.id === selectedMode)
                            ?.name
                        }
                      </div>
                      <div className="text-xs opacity-75">
                        {
                          slideshowModes.find((m) => m.id === selectedMode)
                            ?.description
                        }
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={() => setActiveSection("photos")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: eventData.colors.secondary + "33",
                    color: eventData.colors.primary,
                  }}
                >
                  <Upload className="w-4 h-4" />
                  Add Photos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
