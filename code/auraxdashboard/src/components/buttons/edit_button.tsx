"use client";

import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditButtonProps {
  imageId: string;
  versionId: string;
}

const EditButton: React.FC<EditButtonProps> = ({ imageId, versionId }) => {  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full hover:bg-gray-100 cursor-pointer"
            aria-label="Edit image"
            onClick={() => window.location.href=`/studio?imageId=${imageId}&versionId=${versionId}`}
          >
            <PencilIcon className="h-4 w-4 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Edit</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default EditButton;
