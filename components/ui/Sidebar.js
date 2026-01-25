"use client";

import {
  Home,
  Wallet,
  BarChart3,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import { useUI } from "@/components/providers/UIProvider";

export default function Sidebar() {
  const { sidebarOpen, closeSidebar } = useUI();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeSidebar}
        className={`fixed inset-0 bg-black/40 transition-opacity duration-300
        ${sidebarOpen ? "opacity-100 z-[50]" : "opacity-0 pointer-events-none z-[50]"}`}
      />

      {/* SIDEBAR WRAPPER */}
      <aside
        className={`fixed left-0 top-0 h-screen flex z-[60]
        transition-transform duration-300 ease-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* ICON RAIL */}
        <div className="w-16 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-5 gap-6">
          <RailIcon active><Home /></RailIcon>
          <RailIcon><Wallet /></RailIcon>
          <RailIcon><BarChart3 /></RailIcon>
          <RailIcon><CreditCard /></RailIcon>
          <RailIcon><Settings /></RailIcon>
        </div>

        {/* MAIN PANEL */}
        <div className="w-[280px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between p-5">
          <div>
            <h2 className="text-lg font-semibold mb-6">
              Cash Flow
            </h2>

            <NavItem label="Dashboard" />
            <NavItem label="Balance" />
            <NavItem label="Reports" />
            <NavItem label="Accounting" />
            <NavItem label="Make Payment" />

            {/* Premium Card */}
            <div className="mt-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4">
              <p className="font-semibold">Get more power</p>
              <p className="text-xs opacity-90 mt-1">
                Unlock premium features
              </p>
              <button className="mt-4 w-full py-2 rounded-lg bg-white/20 hover:bg-white/30 transition text-sm">
                Upgrade
              </button>
            </div>
          </div>

          {/* Bottom */}
          <div className="space-y-4">
            <button className="w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center gap-2 text-sm">
              <HelpCircle size={16} />
              Support
            </button>

            <LogoutButton className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-500">
              <LogOut size={16} />
              Sign out
            </LogoutButton>
          </div>
        </div>
      </aside>
    </>
  );
}

/* --- helpers --- */

function RailIcon({ children, active }) {
  return (
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition
        ${
          active
            ? "bg-blue-600 text-white"
            : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
    >
      {children}
    </div>
  );
}

function NavItem({ label }) {
  return (
    <div className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-sm">
      {label}
    </div>
  );
}
