'use client';

import React from 'react';
import { Download } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DownloadButtonProps {
  imageUrl: string;
  filename?: string;
}

export default function DownloadButton({ imageUrl, filename }: DownloadButtonProps) {
  const handleDownload = async () => {
    if (!imageUrl) return;

    try {
      // Try to fetch the image first (this handles CORS and remote images better)
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`);
      }

      // Convert the response to a blob
      const blob = await response.blob();

      // Create a blob URL
      const blobUrl = URL.createObjectURL(blob);

      // Create a link element
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);

      // Fallback to direct download if fetch fails
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename || 'image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleDownload}
            className="bg-black text-white
            rounded-full w-8 h-8 flex items-center justify-center
            shadow-md hover:shadow-lg transition transform hover:scale-105 cursor-pointer"
            aria-label={`Download ${filename || 'image'}`}
            disabled={!imageUrl}
          >
            <Download size={16} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Download Image</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}