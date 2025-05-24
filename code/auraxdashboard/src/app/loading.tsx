// app/dashboard/loading.tsx
"use client"

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className={cn("h-8 w-8 animate-spin text-gray-500")} />
      <span className="ml-2 text-gray-500 text-lg">Loading...</span>
    </div>
  );
}
