import React, { useState } from "react";
import ImageHolder2 from "../image_holders/image_holder_2";
import axios from "axios";
import {
  ShowAddNewVersionModal,
  AddToVersions,
  setNewVersionModel,
  setNewVersionPrompt
} from "@/redux/features/clientDetailSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  ChevronDown,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const AddVersionModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const [gen_image, set_gen_image] = useState<File | null>(null);
  const { AddNewVersionModal } = useAppSelector((state) => state.client_detail);
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

  const aiModels = ["Stable Diffusion", "DALL-E", "MidJourney"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const missingFields = [];

    if (!gen_image) missingFields.push("Generated Image");
    if (!AddNewVersionModal.prompt.trim()) missingFields.push("Prompt");
    if (!AddNewVersionModal.imageId) missingFields.push("Image ID");

    if (missingFields.length > 0) {
      // Show alert for missing fields
      setAlert({
        show: true,
        message: `Please provide the following required information: ${missingFields.join(
          ", "
        )}`,
        type: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("imageID", AddNewVersionModal.imageId);
    formData.append("generatedImage", gen_image);
    formData.append("aiModel", AddNewVersionModal.AIModel);
    formData.append("prompt", AddNewVersionModal.prompt);
    // for (const [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }

    setLoading(true);
    axios
      .post(`${baseUrl}/images/add_new_version`, formData)
      .then((response) => {
        console.log(response);
        dispatch(
          AddToVersions({
            latestVersion: response.data.latestVersion,
            imageId: AddNewVersionModal.imageId,
          })
        );
        setLoading(false);
        setAlert({
          show: true,
          message: "Version added successfully!",
          type: "success",
        });
      })
      .catch((error) => {
        console.error("Upload error:", error);
        setLoading(false);
      })
  };

  const closeAlert = () => {
    setAlert({ ...alert, show: false });

    // If it was a success alert, close the modal after acknowledging
    if (alert.type === "success") {
      dispatch(ShowAddNewVersionModal(false));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg shadow-lg w-[425px] max-w-[95vw] relative border">
        <Button
          onClick={() => dispatch(ShowAddNewVersionModal(false))}
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 rounded-full h-8 w-8 cursor-pointer"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="mb-6 flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Add New Version</h2>
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="generated-image" className="text-sm font-medium flex items-center gap-1">
              Generated Image <span className="text-destructive">*</span>
            </Label>
            <ImageHolder2 image={gen_image} setImage={set_gen_image} />
            <p className="text-xs text-muted-foreground">Upload the generated image for this version</p>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <Label htmlFor="ai-model" className="text-sm font-medium">
              AI Model <span className="text-destructive">*</span>
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  id="ai-model"
                  variant="outline"
                  className="w-full justify-between bg-background"
                >
                  <span className={!AddNewVersionModal.AIModel ? "text-muted-foreground" : ""}>
                    {AddNewVersionModal.AIModel || "Select AI Model"}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[calc(100%-24px)]">
                {aiModels.map((model) => (
                  <DropdownMenuItem
                    key={model}
                    onClick={() => dispatch(setNewVersionModel(model))}
                  >
                    {model}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-sm font-medium">
              Prompt <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="prompt"
              placeholder="Enter the prompt used to generate this image"
              value={AddNewVersionModal.prompt}
              className="min-h-[80px] resize-none"
              onChange={(e) => dispatch(setNewVersionPrompt(e.target.value))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch(ShowAddNewVersionModal(false))}
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

export default AddVersionModal;