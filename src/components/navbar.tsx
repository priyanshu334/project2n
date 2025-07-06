"use client";
import Image from "next/image";
import Logo from "@/app/favicon.ico";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-3 h-16 border-b border-gray-200 bg-white shadow-sm">
      {/* Logo and Brand */}
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 flex-shrink-0">
          <Image
            src={Logo}
            alt="Logo"
            fill
            className="object-contain rounded-lg"
            sizes="40px"
            priority
          />
        </div>
        <h1 className="text-xl font-semibold text-gray-800 tracking-tight">
          Ecommerce Management
        </h1>
      </div>

      {/* User Avatar with Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative w-9 h-9 rounded-full ring-2 ring-gray-200 hover:ring-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <Avatar className="w-full h-full">
              <AvatarImage
                className="rounded-full object-cover"
                src="https://github.com/shadcn.png"
                alt="User avatar"
              />
              <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-medium rounded-full flex items-center justify-center w-full h-full">
                CN
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-56 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          <DropdownMenuLabel className="text-sm font-medium text-gray-700 px-3 py-2">
            Signed in as
          </DropdownMenuLabel>
          <DropdownMenuItem 
            disabled 
            className="text-sm text-gray-500 px-3 py-2 cursor-default"
          >
            admin@example.com
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1 border-gray-200" />
          <DropdownMenuItem 
            onClick={handleLogout}
            className="text-sm text-red-600 hover:bg-red-50 px-3 py-2 cursor-pointer transition-colors duration-150"
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}