import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

const BackButton = () => {
    const router = useRouter();

    return (
        <div className="flex items-center w-full px-6 mt-4 mb-2">
            <Button
                onClick={() => router.back()}
                className="cursor-pointer transition transform hover:scale-105 hover:shadow-xl hover:cursor-pointer"
            >
                <ChevronLeft size={24} />
            </Button>
        </div>
    );
};

export default BackButton;
