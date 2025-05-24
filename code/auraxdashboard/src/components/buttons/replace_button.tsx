import React from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShowReplaceGeneratedModal, setImageIdReplacement, setVersionIdReplacement } from "@/redux/features/clientDetailSlice";
import { useAppDispatch } from "@/redux/hooks";

interface ReplaceButtonProps {
    imageId: string;
    versionId?: string;
}

const ReplaceButton: React.FC<ReplaceButtonProps> = ({ imageId, versionId }) => {
    const dispatch = useAppDispatch();

    const handleAddNewVersion = (e: React.MouseEvent, imageId: string) => {
        e.stopPropagation();
        dispatch(setImageIdReplacement(imageId));
        dispatch(setVersionIdReplacement(versionId || ""));
        dispatch(ShowReplaceGeneratedModal(true));
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-gray-100 cursor-pointer"
                        aria-label="Edit image"
                        onClick={(e) => handleAddNewVersion(e, imageId)}
                    >
                        <RefreshCw className="h-4 w-4 text-gray-600" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Replace</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

export default ReplaceButton
