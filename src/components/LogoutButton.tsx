"use client";
import { LogOut } from "lucide-react";

export default function LogoutButton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        // Dummy logout: redirect to login page
        window.location.href = "/";
      }}
      className={`rounded-full bg-red-100 hover:bg-red-200 p-2 text-red-600 flex items-center gap-1 shadow-sm transition ${className}`}
      title="Logout"
    >
      <LogOut size={18} />
      <span className="hidden sm:inline font-semibold text-xs">Logout</span>
    </button>
  );
}
