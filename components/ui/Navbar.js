"use client";

import { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  User,
  LayoutDashboard,
  Trophy,
  Plus,
  LogOut,
  Share2,
  Settings,
  HelpCircle,
  Users,
} from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import { usePathname, useRouter } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton.js";
import { useUI } from "@/components/providers/UIProvider";


export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isHome = pathname === "/" || pathname === "/dashboard";
  const { toggleSidebar } = useUI();


  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-black/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-3 flex items-center justify-between">
        {/* LEFT - Logo + Back */}
        <div className="flex items-center gap-3">
          {!isHome && (
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition text-xl"
              aria-label="Go back"
            >
              ←
            </button>
          )}

          <a
            href="/"
            className="font-bold text-2xl tracking-tight select-none"
          >
            trohfy<span className="text-green-500">.</span>
          </a>
        </div>

        {/* RIGHT - Navigation */}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {/* Desktop Menu - visible on md+ */}
              <div className="hidden md:flex items-center gap-6">
                <NavLink href="/dashboard" active={pathname.startsWith("/dashboard")}>
                  Dashboard
                </NavLink>
                <NavLink href="/tournaments" active={pathname.startsWith("/tournaments")}>
                  Tournaments
                </NavLink>
                <NavLink href="/community" active={pathname === "/community"}>
                  Community
                </NavLink>

                <a
                  href="/tournaments/join"
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition shadow-sm"
                >
                  Join
                </a>
              </div>

              {/* User Menu / Avatar Dropdown Trigger */}
              <div className="relative" ref={dropdownRef}>
                {/* Desktop: Avatar button */}
                <button
                  onClick={() => setOpen(!open)}
                  className="hidden md:flex items-center gap-2 hover:opacity-90 transition"
                  aria-label="User menu"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-400 to-gray-400 flex items-center justify-center text-white font-bold shadow-sm">
                    {user.email?.[0]?.toUpperCase() || "?"}
                  </div>
                </button>

               <button
  onClick={toggleSidebar}
  className="md:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition"
>
  <MoreVertical className="w-5 h-5" />
</button>
              </div>
            </>
          ) : (
            <a
              href="/auth/login"
              className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition"
            >
              Login
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}

/* Helpers */

function NavLink({ href, children, active = false }) {
  return (
    <a
      href={href}
      className={`text-sm font-medium transition ${
        active
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
      }`}
    >
      {children}
    </a>
  );
}

function DropdownItem({ href, icon, children, badge }) {
  return (
    <a
      href={href}
      className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-200"
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-500 dark:text-gray-400 w-5">{icon}</span>
        <span>{children}</span>
      </div>

      {badge && (
        <span className="px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
          {badge}
        </span>
      )}
    </a>
  );
}