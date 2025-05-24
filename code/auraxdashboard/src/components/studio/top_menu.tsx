import React, { useState } from "react";
import Export from "./top_components/export";
import Undo from "./top_components/undo";
import Redo from "./top_components/redo";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

// ...existing imports...

const TopMenu = () => {
  const router = useRouter();
  const [showBackWarning, setShowBackWarning] = useState(false);

  const handleBack = () => {
    setShowBackWarning(true);
  };
  
  const confirmNavigation = () => {
    router.back();
  };
  
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col h-13 border-b bg-background px-4 relative">
        <div className="flex justify-between items-center w-full absolute top-2 left-0 right-0 px-4">
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="ml-2">Back</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Back to previous page</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <AlertDialog open={showBackWarning} onOpenChange={setShowBackWarning}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
                  <AlertDialogDescription>
                    All unsaved progress will be lost. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmNavigation}>
                    Yes, leave page
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex justify-center">
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Undo />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Undo</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Redo />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Redo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex gap-1">
            <Export />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopMenu;
