import React from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setCurrentPage, setItemsPerPage } from "@/redux/features/clientDetailSlice";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"

interface PaginationProps {
    totalItems: number;
}

const PaginationCD: React.FC<PaginationProps> = ({ totalItems }) => {
    const dispatch = useAppDispatch();
    const { pagination } = useAppSelector((state) => state.client_detail);
    const { currentPage, itemsPerPage } = pagination;

    const pageSizes = [5, 10, 20]

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const handlePrevious = () => {
        if (currentPage > 1) {
            dispatch(setCurrentPage(currentPage - 1));
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            dispatch(setCurrentPage(currentPage + 1));
        }
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setItemsPerPage(Number(e.target.value)));
        dispatch(setCurrentPage(1));
    };
    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center">
                <Label className="mr-2">Page Size:</Label>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="border p-2 rounded w-[100px] flex justify-between items-center"
                        >
                            {itemsPerPage}
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[100px]">
                        {pageSizes.map((size) => (
                            <DropdownMenuItem key={size} onClick={() => handlePageSizeChange({ target: { value: size } })}>
                                {size}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    className={`ml-2 shadow-md ${currentPage <= 1 ? 'bg-gray-300' : 'bg-black'
                        } text-white px-3 py-2 rounded-lg transition transform hover:scale-105 hover:shadow-xl ${currentPage <= 1 ? 'cursor-not-allowed' : 'hover:cursor-pointer'
                        }`}
                    onClick={handlePrevious}
                    disabled={currentPage <= 1}
                >
                    <ChevronLeft />
                </Button>
                <div className="flex flex-col justify-center mx-2">
                    <span className="text-center min-w-[100px] mt-1">
                        Page {currentPage} of {totalPages || 1}
                    </span>
                </div>
                <Button
                    className={`ml-2 shadow-md ${currentPage >= totalPages ? 'bg-gray-300' : 'bg-black'
                        } text-white px-3 py-2 rounded-lg transition transform hover:scale-105 hover:shadow-xl ${currentPage >= totalPages ? 'cursor-not-allowed' : 'hover:cursor-pointer'
                        }`}
                    onClick={handleNext}
                    disabled={currentPage >= totalPages}
                >
                    <ChevronRight />
                </Button>
            </div>
        </div>
    );
};

export default PaginationCD;
