"use client";
import { redirect } from "next/navigation";
import LogoutButton from "../../components/LogoutButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simple client-side auth check
  if (
    typeof window !== "undefined" &&
    window.localStorage.getItem("loggedIn") !== "true"
  ) {
    window.location.href = "/";
    return null;
  }
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100">
      {/* Fixed Top Bar */}
      <header className="bg-white border-b border-gray-200 shadow-sm z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-blue-700">Task Management</h2>
        </div>
        <div className="flex items-center gap-4">
          <LogoutButton />
        </div>
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-8">{children}</div>
    </div>
  );
}
