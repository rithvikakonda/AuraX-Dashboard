import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addSticker, setActiveStickerCategory } from "@/redux/features/studioSlice";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import StickerGrid from './sticker_grid'; // Import your StickerGrid component

const Stickers = () => {
  const dispatch = useAppDispatch();
  // Get the entire state to adapt to its structure
  const studioState = useAppSelector((state) => state.studio);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStickers, setFilteredStickers] = useState<string[]>([]);

  // Adapting to whatever structure exists in Redux
  const activeStickerCategory = studioState.activeStickerCategory;
  const stickerCategories = studioState.stickerCategories || [];
  
  // Try different possible paths in the Redux state to find stickers
  const getStickersByCategory = (category: string) => {
    // First approach - if stickers is an object with categories as keys
    if (studioState.stickers && typeof studioState.stickers === 'object' && !Array.isArray(studioState.stickers)) {
      return studioState.stickers[category] || [];
    }
    
    // Second approach - if there's a stickerLibrary object
    if (studioState.stickerLibrary && typeof studioState.stickerLibrary === 'object') {
      return studioState.stickerLibrary[category] || [];
    }
    
    // Fallback to empty array if structure is unknown
    return [];
  };

  // Get all stickers across categories for search
  const getAllStickers = () => {
    // First approach
    if (studioState.stickers && typeof studioState.stickers === 'object' && !Array.isArray(studioState.stickers)) {
      return Object.values(studioState.stickers).flat();
    }
    
    // Second approach
    if (studioState.stickerLibrary && typeof studioState.stickerLibrary === 'object') {
      return Object.values(studioState.stickerLibrary).flat();
    }
    
    return [];
  };

  // Update filtered stickers when search query or category changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      // No search - show current category
      setFilteredStickers(getStickersByCategory(activeStickerCategory));
    } else {
      // Search across all categories
      const lowerSearchTerm = searchQuery.toLowerCase();
      const allStickers = getAllStickers();
      const filtered = allStickers.filter((url: string) => 
        url.toLowerCase().includes(lowerSearchTerm)
      );
      setFilteredStickers(filtered);
    }
  }, [searchQuery, activeStickerCategory, studioState]);

  const categoryEmojis: Record<string, string> = {
    Emoji: '😊',
    Animals: '🐾',
    Food: '🍔',
    Travel: '✈️',
    Objects: '💡',
    Love: '💚',
  };

  const handleAddSticker = (imageUrl: string) => {
    // Create a new sticker object as expected by your Redux
    dispatch(addSticker({ imageUrl }));
  };

  const handleCategoryChange = (category: string) => {
    dispatch(setActiveStickerCategory(category));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 relative">
        <Input
          placeholder="Search stickers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 text-sm"
        />
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>

      {!searchQuery && (
        <Tabs
          value={activeStickerCategory}
          onValueChange={handleCategoryChange}
          className="w-full mb-4"
        >
          <TabsList className="grid grid-cols-6 h-auto">
            {stickerCategories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="text-xs py-1.5 flex items-center justify-center"
              >
                <span className="text-lg">{categoryEmojis[category] || '❓'}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Ensure the ScrollArea takes the remaining height */}
      <ScrollArea className="flex-1 min-h-0 pr-2">
        <StickerGrid
          stickers={filteredStickers}
          onSelect={handleAddSticker}
          searchMode={Boolean(searchQuery)}
        />
      </ScrollArea>
    </div>
  );
};

export default Stickers;