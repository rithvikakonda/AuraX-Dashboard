"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const NotFound: React.FC = () => {
  const router = useRouter();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <Header title="PAGE NOT FOUND">
        <div className="w-8" />
      </Header>

      {/* Main Content */}
      <main className="flex-1 p-6 w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <h1 className="text-9xl font-bold text-[#111] mb-4">404</h1>
            <h2 className="text-3xl font-bold text-black mb-6">Page Not Found</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <div className="border-t border-black w-32 mx-auto mb-8"></div>
            <Link href="/" className="inline-block">
              <Button 
                onClick={() => router.push('/')}
                className="transition transform hover:scale-105 hover:shadow-xl hover:cursor-pointer"
              >
                Return to Home
              </Button>
            </Link>
          </div>
          
          <div className="w-full max-w-md">
            <div className="bg-black h-2 rounded-t-lg"></div>
            <div className="border-x border-b border-black rounded-b-lg p-4 bg-gray-50">
              <p className="text-black font-semibold">Looking for something?</p>
              <p className="text-gray-600 text-sm mt-2">
                If you were expecting to find something here, please contact support or check your URL.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default NotFound;