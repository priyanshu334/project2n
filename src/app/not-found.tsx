"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
      <div className="bg-white text-gray-800 p-10 rounded-2xl shadow-xl max-w-md text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4 mx-auto" />
        <h1 className="text-4xl font-bold mb-2">Oops! Page Not Found</h1>
        <p className="mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button
          onClick={() => router.push("/")}
          className="bg-indigo-500 hover:bg-indigo-600 text-white w-full"
        >
          Go Back Home
        </Button>
      </div>
    </div>
  );
}
