// src/components/dashboard/CreateEventModal.tsx

import React, { memo, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string }) => void;
}

const CreateEventModal = memo(
  ({ isOpen, onClose, onSubmit }: CreateEventModalProps) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
          onSubmit({
            name: name.trim(),
            description: description.trim() || undefined,
          });
          setName("");
          setDescription("");
        }
      },
      [name, description, onSubmit],
    );

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-sp_dark_surface rounded-2xl p-6 w-full max-w-md border border-sp_eggshell/30 dark:border-sp_lightgreen/20"
        >
          <h2 className="text-xl font-bold mb-4 text-sp_darkgreen dark:text-sp_dark_text">
            Create New Event
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-sp_green dark:text-sp_dark_muted">
                Event Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-sp_eggshell/50 dark:border-sp_lightgreen/30 rounded-xl px-4 py-3 bg-white dark:bg-sp_dark_bg text-sp_darkgreen dark:text-sp_dark_text focus:ring-2 focus:ring-sp_midgreen focus:border-transparent transition-all"
                placeholder="Wedding Reception, Company Party, etc."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-sp_green dark:text-sp_dark_muted">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-sp_eggshell/50 dark:border-sp_lightgreen/30 rounded-xl px-4 py-3 bg-white dark:bg-sp_dark_bg text-sp_darkgreen dark:text-sp_dark_text focus:ring-2 focus:ring-sp_midgreen focus:border-transparent transition-all"
                placeholder="Optional description..."
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-sp_eggshell/50 dark:border-sp_lightgreen/30 py-3 rounded-xl hover:bg-sp_eggshell/10 dark:hover:bg-sp_lightgreen/10 text-sp_green dark:text-sp_dark_text transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-sp_midgreen to-sp_green text-white py-3 rounded-xl hover:shadow-lg transition-all"
              >
                Create Event
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  },
);

CreateEventModal.displayName = "CreateEventModal";

export default CreateEventModal;
