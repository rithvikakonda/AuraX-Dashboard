import React, { useState } from "react";
import ImageHolder from "../image_holders/image_holder";
import axios from "axios";
import { ShowAddNewImageModal, AddToImages } from "@/redux/features/clientDetailSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Button } from "@/components/ui/button";
import {
  X,
  Upload,
  ImagePlus,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AlertCircle,
  CheckCircle
} from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const AddImageModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const [image, setImage] = useState<File | null>(null);
  const { clientId, AddNewImageModal } = useAppSelector((state) => state.client_detail);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    type: "error" | "success";
  }>({
    show: false,
    message: "",
    type: "error",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      setAlert({
        show: true,
        message: "Please provide an image",
        type: "error",
      });
      return;
    };

    // Create FormData object
    const formData = new FormData();
    formData.append("clientId", clientId);
    formData.append("image", image);
    // for (const [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }

    setLoading(true);

    // Now you can submit this formData to your endpoint
    try {
      axios
        .post(`${baseUrl}/images/add_new_image`, formData)
        .then((response) => {
          dispatch(AddToImages(response.data.newImage))
          setLoading(false);
          setAlert({
            show: true,
            message: "Image added successfully",
            type: "success",
          });
        })
        .catch((error) => {
          setLoading(false);
          console.error("Upload error:", error);
        })
    } catch (error) {
      console.error("Upload error:", error);
      setLoading(false);
    }
  };

  const closeAlert = () => {
    setAlert({ ...alert, show: false });

    // If it was a success alert, close the modal after acknowledging
    if (alert.type === "success") {
      dispatch(ShowAddNewImageModal(false));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg shadow-lg w-[425px] max-w-[95vw] relative border">
        <Button
          onClick={() => dispatch(ShowAddNewImageModal(false))}
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 rounded-full h-8 w-8 cursor-pointer"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="mb-6 flex items-center gap-2">
          <ImagePlus className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Add New Image</h2>
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-upload" className="text-sm font-medium flex items-center gap-1">
              Original Image <span className="text-destructive">*</span>
            </Label>
            <ImageHolder setImage={setImage} />
            <p className="text-xs text-muted-foreground">Upload an image to add to this client&apos;s collection</p>
          </div>

          {alert.show && (
            <Alert variant={alert.type === "error" ? "destructive" : "default"}>
              <AlertDescription className="flex items-center gap-2">
                {alert.type === "error" ? (
                  <span className="text-destructive">{alert.message}</span>
                ) : (
                  <span className="text-green-600">{alert.message}</span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch(ShowAddNewImageModal(false))}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="gap-2"
            >
              {loading ? "Uploading..." : (
                <>
                  <Upload className="h-4 w-4" /> Submit
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      <AlertDialog open={alert.show} onOpenChange={(open) => !open && closeAlert()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {alert.type === "success" ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Success
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Error
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {alert.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={closeAlert}>
              {alert.type === "success" ? "Continue" : "Try Again"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AddImageModal;
