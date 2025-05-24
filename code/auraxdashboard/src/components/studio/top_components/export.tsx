import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setIsExporting, setExportFormat, setIsSaving } from "@/redux/features/studioSlice";

const Export = () => {
  const { width, height, exportFormat } = useAppSelector((state) => state.studio);
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  
  const saveImage = () => {
    setOpen(false);
    // Dispatch the exporting action
    dispatch(setIsSaving(true));
  }
  
  const exportImage = () => {
    setOpen(false);
    // Dispatch the exporting action
    dispatch(setIsExporting(true));
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(true)}
              className="h-9"
            >
              <Share className="h-5 w-5" />
              <span className="ml-2">Export</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="z-50">
            <p>Export</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Image</DialogTitle>
            <DialogDescription>Choose your export settings</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="format" className="text-right">
                Format
              </Label>
              <Select value={exportFormat} onValueChange={(value) => dispatch(setExportFormat(value as "png" | "jpg" | "webp"))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpg">JPG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="format" className="text-right">
                Resolution
              </Label>
              <div className="col-span-3 flex items-center">
                <span>{`${width} × ${height}`}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" onClick={saveImage}>
              Save
            </Button>
            <Button type="button" onClick={exportImage}>
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Export;
