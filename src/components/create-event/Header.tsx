// File: src/components/create-event/Header.tsx

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { colors } from "@/types/eventTypes";
import lightIcon from "@/assets/light-icon.svg";

export function Header() {
  const navigate = useNavigate();

  return (
    <header
      className="bg-white border-b"
      style={{ borderColor: `${colors.lightGreen}20` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/host/create")}
              className="flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-lg flex items-center justify-center">
                <img
                  src={lightIcon || "/placeholder.svg"}
                  alt="Spevents"
                  className="w-6 h-6 mx-auto"
                />
              </div>
              <h1
                className="text-2xl font-bold"
                style={{ color: colors.green }}
              >
                spevents
              </h1>
            </button>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/host/dashboard")}
            style={{
              borderColor: colors.lightGreen,
              color: colors.darkGreen,
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </header>
  );
}
