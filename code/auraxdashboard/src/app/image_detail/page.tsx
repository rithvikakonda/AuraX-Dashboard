"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Footer from "@/components/footer";
import BackButton from "@/components/buttons/back_button";
import Header from "@/components/header";
import DownloadButton from "@/components/buttons/download_button";
import EditButton from "@/components/buttons/edit_button"; // Import the new edit button component
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  ShowAddNewVersionModal,
  getClientDetails,
  ImageVersion,
  setImageId,
} from "@/redux/features/clientDetailSlice";
import { useSearchParams } from "next/navigation";
import AddVersionModal from "@/components/modals/add_version_modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import ReplaceButton from "@/components/buttons/replace_button";
import ReplaceGenerated from "@/components/modals/replace_generated_modal";

const defaultVersion: ImageVersion = {
  versionId: "",
  promptUsed: "",
  modelUsed: "",
  generatedImageUrl: "",
  upscaledImageUrl: ""
};

export default function ImageDetail() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>("");

  const { images, AddNewVersionModal, clientId, ReplaceGeneratedModal } = useAppSelector(
    (state) => state.client_detail
  );

  const imageIdParam = searchParams.get("imageId") || "";
  const versionIdParam = searchParams.get("versionId");

  // Find the current image from the client_detail slice
  const currentImage = images.find(img => img.imageId === imageIdParam) || {
    imageId: "",
    originalImageUrl: "",
    promptUsed: "",
    modelUsed: "",
    versions: []
  };

  // Find the currently selected version using versionIdParam
  const currentVersion: ImageVersion = versionIdParam
    ? currentImage.versions.find(version => version.versionId === versionIdParam) ||
    (currentImage.versions[0] || defaultVersion)
    : (currentImage.versions[0] || defaultVersion);

  useEffect(() => {
    const clientIdParam = searchParams.get("clientId");

    const effectiveClientId = clientIdParam || clientId;
    if (
      effectiveClientId &&
      (images.length === 0 || clientIdParam !== clientId)
    ) {
      dispatch(getClientDetails(effectiveClientId));
    }
  }, [searchParams, images, dispatch, clientId]);

  useEffect(() => {
    if (currentVersion) {
      setGeneratedImageUrl(currentVersion.generatedImageUrl);
    }
  }, [currentVersion]);

  const handleAddNewVersion = (imageId: string) => {
    dispatch(setImageId(imageId))
    dispatch(ShowAddNewVersionModal(true));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header title="IMAGE DETAIL">
        <div className="w-8"></div>
      </Header>
      <BackButton />

      <main className="flex-1 p-6 w-full">
        <Card className="w-full">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Image ID: {currentImage.imageId}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Version ID: {currentVersion.versionId}
                </p>
              </div>
              <Button
                onClick={() => handleAddNewVersion(imageIdParam)}
                className="gap-2 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add new version
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {/* Details Section */}
            <Card className="mb-6">
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <span className="font-semibold min-w-24">Prompt:</span>
                    <span className="text-muted-foreground">{currentVersion.promptUsed}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold min-w-24">AI Model:</span>
                    <Badge variant="outline">{currentVersion.modelUsed}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator className="my-6" />

            {/* Images Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Original Image */}
              <Card>
                <CardHeader className="pb-2 pt-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Original Image</CardTitle>
                    <div className="flex space-x-1">
                      <DownloadButton
                        imageUrl={currentImage.originalImageUrl}
                        filename="original_image.png"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <AspectRatio ratio={4 / 3} className="bg-muted overflow-hidden rounded-md border">
                    <Image
                      src={currentImage.originalImageUrl || "/placeholder.png"}
                      alt="Original Image"
                      fill
                      className="object-contain"
                    />
                  </AspectRatio>
                </CardContent>
              </Card>

              {/* Generated Image */}
              <Card>
                <CardHeader className="pb-2 pt-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Generated Image</CardTitle>
                    <div className="flex space-x-1">
                      {!currentVersion.upscaledImageUrl && <EditButton imageId={imageIdParam} versionId={versionIdParam || ""} />}
                      {!currentVersion.upscaledImageUrl && <ReplaceButton imageId={imageIdParam} versionId={versionIdParam || ""} />}
                      <DownloadButton
                        imageUrl={generatedImageUrl}
                        filename="generated_image.png"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <AspectRatio ratio={4 / 3} className="bg-muted overflow-hidden rounded-md border">
                    <Image
                      src={generatedImageUrl || "/placeholder.png"}
                      alt="Generated Image"
                      fill
                      className="object-contain"
                    />
                  </AspectRatio>
                </CardContent>
              </Card>

              {/* Upscaled Image */}
              <Card>
                <CardHeader className="pb-2 pt-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Upscaled Image</CardTitle>
                    {currentVersion.upscaledImageUrl &&
                      <div className="flex space-x-1">
                        <EditButton imageId={imageIdParam} versionId={versionIdParam || ""} />
                        <DownloadButton
                          imageUrl={currentVersion.upscaledImageUrl}
                          filename="upscaled_image.png"
                        />
                      </div>
                    }
                  </div>
                </CardHeader>
                <CardContent>
                  <AspectRatio ratio={4 / 3} className="bg-muted overflow-hidden rounded-md border">
                    {currentVersion.upscaledImageUrl ? (
                      <Image
                        src={currentVersion.upscaledImageUrl}
                        alt="Upscaled Image"
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        No upscaled image available
                      </div>
                    )}
                  </AspectRatio>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />

      {AddNewVersionModal.isOpen ? <AddVersionModal /> : ""}
      {ReplaceGeneratedModal.isOpen ? <ReplaceGenerated setGeneratedImageUrl={setGeneratedImageUrl} /> : ""}
    </div>
  );
}
