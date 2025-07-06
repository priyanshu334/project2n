"use client";
import {
  Package,
  Layers,
  Box,
  Tag,
  Grid,
  DollarSign,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Products", icon: Package, href: "/dashboard/products" },
    { name: "Metals", icon: Layers, href: "/dashboard/metals" },
    { name: "Materials", icon: Box, href: "/dashboard/materials" },
    { name: "Item For", icon: Tag, href: "/dashboard/item-fors" },
    { name: "Category", icon: Grid, href: "/dashboard/categories" },
    {
      name: "Price Updates",
      icon: DollarSign,
      href: "/dashboard/price-updates",
    },
  ];

  return (
    <div className="relative">
      {/* Hamburger Icon */}
      <button
        className="fixed top-6 left-6 z-30 block md:hidden bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-gray-700" />
        ) : (
          <Menu className="w-5 h-5 text-gray-700" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative top-0 left-0 h-full bg-white shadow-xl md:shadow-none border-r border-gray-100 w-72 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-all duration-300 ease-in-out z-20 backdrop-blur-sm`}
      >
        <div className="flex flex-col justify-between h-full">
          <div className="p-6">
            {/* Header */}
            <div className="mb-12 pt-4 md:pt-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Grid className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
              </div>
              <p className="text-sm text-gray-500 ml-11">Management Portal</p>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              {menuItems.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:shadow-sm border border-transparent hover:border-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all duration-200">
                      <item.icon className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-gray-900">
                      {item.name}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all duration-200" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium">
                © {new Date().getFullYear()} Nandini Singh Verma
              </p>
              <p className="text-xs text-gray-400 mt-1">
                All rights reserved
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Background Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden z-10 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;