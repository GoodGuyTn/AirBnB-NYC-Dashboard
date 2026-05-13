"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Overview & Supply", path: "/" },
  { name: "Pricing & Value", path: "/pricing" },
  { name: "Host Performance", path: "/hosts" },
  { name: "Customer Experience", path: "/experience" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col">
      <div className="mb-8 mt-4">
        <h1 className="text-xl font-bold text-center">NYC Airbnb Dashboard</h1>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`block px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? "bg-blue-600 text-white font-semibold"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-8 pb-4 text-sm text-center text-slate-500">
        &copy; 2026 Nhóm 4
      </div>
    </div>
  );
}
