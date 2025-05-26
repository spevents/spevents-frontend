// src/pages/dashboard/DashboardPage.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Plus,
  Calendar,
  Users,
  Camera,
  Settings,
  MoreVertical,
  Eye,
  Edit,
} from "lucide-react";

export function DashboardPage() {
  const [events] = useState([
    {
      id: 1,
      name: "Sarah & Mike's Wedding",
      date: "2024-03-15",
      guests: 120,
      photos: 45,
      status: "active",
    },
    {
      id: 2,
      name: "Tech Conference 2024",
      date: "2024-03-20",
      guests: 300,
      photos: 89,
      status: "upcoming",
    },
  ]);

  return (
    <div className="min-h-screen bg-timberwolf">
      {/* Header */}
      <header className="bg-white border-b border-sage/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brunswick-green rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-brunswick-green">
                spevents
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 border border-sage/30 text-hunter-green hover:bg-sage/10 px-4 py-2 rounded-lg text-sm transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <div className="w-8 h-8 bg-sage/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-brunswick-green">
                  JD
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-brunswick-green mb-2">
            Welcome back, John!
          </h2>
          <p className="text-hunter-green">
            Manage your events and create amazing photo experiences.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Events", value: "12", icon: Calendar },
            { label: "Active Events", value: "3", icon: Eye },
            { label: "Total Photos", value: "1,247", icon: Camera },
            { label: "Total Guests", value: "2,840", icon: Users },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="border border-sage/20 bg-white/80 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-hunter-green">{stat.label}</p>
                    <p className="text-2xl font-bold text-brunswick-green">
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className="w-8 h-8 text-sage" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Events Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-brunswick-green">
              Your Events
            </h3>
            <Link
              to="/dashboard/create-event"
              className="flex items-center gap-2 bg-brunswick-green hover:bg-hunter-green text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </Link>
          </div>

          {events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="w-12 h-12 text-sage" />
              </div>
              <h4 className="text-xl font-semibold text-brunswick-green mb-2">
                No events yet, you're no fun! 😄
              </h4>
              <p className="text-hunter-green mb-6">
                Create your first event and start collecting amazing photos from
                your guests.
              </p>
              <Link
                to="/dashboard/create-event"
                className="inline-flex items-center gap-2 bg-brunswick-green hover:bg-hunter-green text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Your First Event
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="border border-sage/20 hover:border-fern-green transition-colors bg-white/80 backdrop-blur-sm rounded-lg">
                    <div className="pb-3 p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-brunswick-green text-lg font-bold">
                            {event.name}
                          </h3>
                          <p className="text-hunter-green">
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="relative">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {event.status}
                      </div>
                    </div>
                    <div className="p-6 pt-0">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-sage" />
                          <span className="text-hunter-green">
                            {event.guests} guests
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-sage" />
                          <span className="text-hunter-green">
                            {event.photos} photos
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button className="flex-1 flex items-center justify-center gap-1 border border-sage/30 text-hunter-green hover:bg-sage/10 py-2 px-3 rounded-lg text-sm transition-colors">
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-1 bg-brunswick-green hover:bg-hunter-green text-white py-2 px-3 rounded-lg text-sm transition-colors">
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
