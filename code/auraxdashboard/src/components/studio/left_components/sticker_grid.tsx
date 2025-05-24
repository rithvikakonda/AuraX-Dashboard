

import React from 'react';
import { Button } from "@/components/ui/button";
import Image from 'next/image';

interface StickerGridProps {
  stickers: string[];
  onSelect: (stickerUrl: string) => void;
  searchMode?: boolean;
}

const StickerGrid: React.FC<StickerGridProps> = ({ stickers, onSelect, searchMode = false }) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {stickers.length > 0 ? (
        stickers.map((stickerUrl, index) => (
          <Button
            key={`${stickerUrl}-${index}`}
            variant="outline"
            className="p-1 h-14 flex items-center justify-center bg-background/50 hover:bg-background/80"
            onClick={() => onSelect(stickerUrl)}
          >
            
            <div className="flex items-center justify-center w-full h-full">
              <Image
                src={stickerUrl}
                alt={`Sticker ${index + 1}`}
                width={39}
                height={39}
                className="object-contain"
              />
            </div>
          </Button>
        ))
      ) : (
        <div className="col-span-4 text-center py-8 text-muted-foreground">
          {searchMode ? "No stickers found" : "No stickers available"}
        </div>
      )}
    </div>
  );
};

export default StickerGrid;