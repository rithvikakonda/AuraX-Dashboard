"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ImageHolderProps {
    setImage: (image: File | null) => void;
}

const ImageHolder: React.FC<ImageHolderProps> = ({ setImage }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragCounter, setDragCounter] = useState(0);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setDragCounter((prev) => prev - 1);
        if (dragCounter <= 1) setIsDragging(false); // Ensures we only reset when truly leaving
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (event.dataTransfer.files.length > 0) {
            setImage(event.dataTransfer.files[0]);
            setPreview(URL.createObjectURL(event.dataTransfer.files[0]));
        }
        setIsDragging(false)
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setImage(event.target.files[0]);
            setPreview(URL.createObjectURL(event.target.files[0]));
        }
    };

    return (
        <div
            className={`h-[200px] w-full border-1 overflow-hidden flex items-center justify-center p-6 rounded-lg text-center text-gray-500 cursor-pointer transition-all relative ${isDragging ? "border border-black shadow-lg" : "border-dashed border-black"
                }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById("fileInput")?.click()}
        >
            {preview ? (
                <Image src={preview} alt="Uploaded" fill className="h-full w-full object-contain" />
            ) : (
                <span>Drag and drop / Click to upload</span>
            )}
            <input
                id="fileInput"
                type="file"
                className="hidden"
                accept="image/*"
                name="uploadedImage"
                onChange={handleFileChange}
            />
        </div>
    );
};

export default ImageHolder;
