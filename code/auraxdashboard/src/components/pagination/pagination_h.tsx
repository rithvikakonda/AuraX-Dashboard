import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setCurrentPage,
  setItemsPerPage,
} from "@/redux/features/clientSlice";
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

const PaginationH: React.FC<PaginationProps> = ({ totalItems }) => {
  const dispatch = useAppDispatch();
  const { currentPage, itemsPerPage } = useAppSelector((state) => state.clients);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const pageSizes = [5, 10, 20];

  const handlePageChange = (pageNumber: number) => {
    dispatch(setCurrentPage(pageNumber));
    // Scroll to top of client list
    document
      .querySelector(".client-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    dispatch(setItemsPerPage(newPageSize));
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
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
              <DropdownMenuItem
                key={size}
                onClick={() => handlePageSizeChange(size)}
              >
                {size}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={handlePrevPage}
          disabled={currentPage === 1 || totalPages <= 1}
          className={`transition transform hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed}`}
        >
          <ChevronLeft />
        </Button>
        <span className="mx-2">
          Page {currentPage} of {Math.max(1, totalPages)}
        </span>
        <Button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || totalPages <= 1}
          className={`transition transform hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed}`}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
};

export default PaginationH;
