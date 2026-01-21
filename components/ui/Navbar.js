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

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isHome = pathname === "/" || pathname === "/dashboard";

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

                {/* Mobile: Three dots button */}
                <button
                  onClick={() => setOpen(!open)}
                  className="md:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  aria-label="Menu"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {open && (
                  <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden text-sm z-50">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-400 flex items-center justify-center text-white font-bold text-lg">
                          {user.email?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.email.split("@")[0]}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Signed in
                          </p>
                        </div>
                      </div>

                      
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <DropdownItem href="/profile" icon={<User size={18} />}>
                        Profile
                      </DropdownItem>
                      <DropdownItem href="/dashboard" icon={<Users size={18} />}>
                        Dashboard
                      </DropdownItem>
                      <DropdownItem
                        href="/subscription"
                        icon={<LayoutDashboard size={18} />}
                        badge="PRO"
                      >
                        Subscription
                      </DropdownItem>
                      <DropdownItem href="/settings" icon={<Settings size={18} />}>
                        Settings
                      </DropdownItem>
                      <DropdownItem href="/help" icon={<HelpCircle size={18} />}>
                        Help center
                      </DropdownItem>
                    </div>

                    {/* Logout */}
                    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                      <LogoutButton className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-sm font-medium text-red-600 dark:text-red-400">
                        <LogOut size={16} />
                        Sign out
                      </LogoutButton>
                    </div>
                  </div>
                )}
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