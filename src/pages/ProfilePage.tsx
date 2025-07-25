import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Edit3,
  Save,
  X,
  Shield,
  Settings,
  ArrowLeft,
  Bell,
  Smartphone,
  CreditCard,
  HelpCircle,
} from "lucide-react";
import { updateProfile } from "firebase/auth";
import { useAuth } from "../components/auth/AuthProvider";
import { userService } from "../lib/userService";
import { eventService } from "@/eventService";
import { useNavigate } from "react-router-dom";

interface UserStats {
  totalEvents: number;
  totalPhotos: number;
  joinDate: string;
}

const sidebarItems = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "apps", label: "Apps", icon: Smartphone },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "help", label: "Help", icon: HelpCircle },
];

export default function ProfilePage() {
  const { user, firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [profileData, setProfileData] = useState({
    displayName: user?.name || "",
    email: user?.email || "",
    photoURL: user?.photoURL || "",
  });

  useEffect(() => {
    loadUserStats();
  }, [user]);

  const loadUserStats = async () => {
    if (!user) return;

    try {
      const events = await eventService.getUserEvents();
      const totalPhotos = events.reduce(
        (sum, event) => sum + (event.photoCount || 0),
        0,
      );

      setStats({
        totalEvents: events.length,
        totalPhotos,
        joinDate: "2024",
      });
    } catch (error) {
      console.error("Failed to load user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!firebaseUser || !user) return;

    setSaving(true);
    try {
      await updateProfile(firebaseUser, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL,
      });

      await userService.updateUserProfile(user.id, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      displayName: user?.name || "",
      email: user?.email || "",
      photoURL: user?.photoURL || "",
    });
    setIsEditing(false);
  };

  const handleBack = () => {
    navigate("/host");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sp_eggshell flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-sp_green border-b-transparent"></div>
      </div>
    );
  }

  const renderProfileContent = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-sp_lightgreen/20">
        <div className="relative">
          {profileData.photoURL ? (
            <img
              src={profileData.photoURL}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-sp_lightgreen/20 flex items-center justify-center">
              <User className="w-6 h-6 text-sp_green" />
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-medium text-sp_darkgreen">
            {profileData.displayName || "Unnamed User"}
          </h2>
          <p className="text-sp_green text-sm">{profileData.email}</p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-sp_darkgreen mb-2">
            Display Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={profileData.displayName}
              onChange={(e) =>
                setProfileData((prev) => ({
                  ...prev,
                  displayName: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-sp_lightgreen/30 rounded-lg bg-white text-sp_darkgreen focus:ring-1 focus:ring-sp_green focus:border-sp_green outline-none"
            />
          ) : (
            <div className="px-3 py-2 bg-sp_eggshell/50 rounded-lg text-sp_darkgreen">
              {profileData.displayName || "Not set"}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-sp_darkgreen mb-2">
            Email Address
          </label>
          <div className="px-3 py-2 bg-sp_eggshell/50 rounded-lg text-sp_darkgreen flex items-center justify-between">
            <span>{profileData.email}</span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-sp_green/10 text-sp_green text-xs rounded-full">
              <Shield className="w-3 h-3" />
              Verified
            </span>
          </div>
          <p className="text-xs text-sp_green/70 mt-1">
            Email cannot be changed here
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="pt-6 border-t border-sp_lightgreen/20">
        <h3 className="text-sm font-medium text-sp_darkgreen mb-3">
          Statistics
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-semibold text-sp_darkgreen">
              {stats?.totalEvents || 0}
            </div>
            <div className="text-xs text-sp_green">Events</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-sp_darkgreen">
              {stats?.totalPhotos || 0}
            </div>
            <div className="text-xs text-sp_green">Photos</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-sp_darkgreen">
              {stats?.joinDate || "2024"}
            </div>
            <div className="text-xs text-sp_green">Member since</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlaceholderContent = (section: string) => (
    <div className="text-center py-12">
      <div className="w-12 h-12 bg-sp_lightgreen/20 rounded-full flex items-center justify-center mx-auto mb-4">
        {(() => {
          const item = sidebarItems.find((item) => item.id === section);
          const Icon = item?.icon || Settings;
          return <Icon className="w-6 h-6 text-sp_green" />;
        })()}
      </div>
      <h3 className="text-lg font-medium text-sp_darkgreen mb-2">
        {sidebarItems.find((item) => item.id === section)?.label || "Settings"}
      </h3>
      <p className="text-sp_green">This section is coming soon.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-sp_eggshell">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-sp_lightgreen/20 min-h-screen">
          <div className="p-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sp_green hover:text-sp_darkgreen mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Host</span>
            </button>

            <h1 className="text-lg font-semibold text-sp_darkgreen mb-6">
              Settings
            </h1>

            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeSection === item.id
                        ? "bg-sp_green text-white"
                        : "text-sp_darkgreen hover:bg-sp_eggshell/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-2xl mx-auto px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-semibold text-sp_darkgreen">
                  {sidebarItems.find((item) => item.id === activeSection)
                    ?.label || "Profile"}
                </h1>
                <p className="text-sp_green text-sm mt-1">
                  {activeSection === "profile"
                    ? "Manage your account information"
                    : "Configure your preferences"}
                </p>
              </div>

              {activeSection === "profile" && (
                <div className="flex gap-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-sp_green hover:bg-sp_midgreen text-white text-sm rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 border border-sp_lightgreen/30 hover:bg-sp_eggshell/50 text-sp_darkgreen text-sm rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-sp_green hover:bg-sp_midgreen text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save"}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl border border-sp_lightgreen/20 p-6"
            >
              {activeSection === "profile"
                ? renderProfileContent()
                : renderPlaceholderContent(activeSection)}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
