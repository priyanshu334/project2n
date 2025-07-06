"use client";
import { useState } from "react";
import {
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  MailIcon,
  ArrowRightIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

import Image from "next/image";
import LogoImage from "@/app/favicon.ico";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login submitted:", { email, password });
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-2/3 relative items-center justify-center border-r-2 m-8 ">
        <div className="absolute inset-0 "></div>
        <Link href="https://vardhaman-application-git-main-akshatrai220s-projects.vercel.app/">
          <div className="relative z-10 text-white text-center px-8">
            <Image
              src={LogoImage}
              alt="Login illustration"
              className="mx-auto"
              width={300}
              height={300}
            />
            <h2 className="text-2xl font-bold mb-4 text-black">
              VARDHAMAN JEWELLERS
            </h2>
            <p className="text-lg mb-8 text-black">
              building relationships that last generations.
            </p>
          </div>
        </Link>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/3 flex items-center justify-center my-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
            <p className="text-gray-600 mt-2">
              Enter your credentials to access your account
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MailIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <KeyRoundIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Sign In
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
