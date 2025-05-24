"use client"

import React, { useEffect } from 'react'
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setImageId, setVersionId, fetchImageUrl } from "@/redux/features/studioSlice";
import TopMenu from '@/components/studio/top_menu';
import LeftMenu from '@/components/studio/left_menu';
import RightMenu from '@/components/studio/right_menu';
import FabricCanvas from '@/components/studio/fabric_canvas';

const Studio = () => {
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const { imageId, versionId, imageUrl } = useAppSelector((state) => state.studio);

    useEffect(() => {
        const imageIdParam = searchParams.get("imageId");
        const versionIdParam = searchParams.get("versionId");

        // Set image and version IDs from URL parameters if they exist
        if (imageIdParam) {
            dispatch(setImageId(imageIdParam));
        }
        if (versionIdParam) {
            dispatch(setVersionId(versionIdParam));
        }
        if (imageId && versionId) {
            dispatch(fetchImageUrl({ imageId, versionId }));
        }
    }, [searchParams, dispatch, imageId, versionId]);

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden">
            {/* Top bar */}
            <div className="flex-none">
                <TopMenu />
            </div>
            
            {/* Main content area with left sidebar, canvas, and right sidebar */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left sidebar */}
                <div className="flex-none">
                    <LeftMenu />
                </div>
                
                {/* Main canvas area */}
                <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center">
                    {imageUrl ? (
                        <FabricCanvas />
                    ) : (
                        <div className="text-muted-foreground">
                            Loading image...
                        </div>
                    )}
                </div>
                
                {/* Right sidebar - always visible */}
                <div className="flex-none">
                    <RightMenu />
                </div>
            </div>
        </div>
    )
}

export default Studio
