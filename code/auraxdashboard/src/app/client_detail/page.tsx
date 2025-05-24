"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import BackButton from "@/components/buttons/back_button";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import PaginationCD from "@/components/pagination/pagination_cd";
import { useRouter } from "next/navigation";
import { ShowAddNewImageModal, ShowAddNewVersionModal, setTotalItems, getClientDetails, downloadUpscaledImages, clearDownloadStatus } from "@/redux/features/clientDetailSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import { setImageId } from "@/redux/features/clientDetailSlice";
import {
    ChevronDown, Plus, Search, Filter, Info, Loader2,
    CheckCircle2,
    XCircle,
    CloudDownload
} from 'lucide-react';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import AddImageModal from "@/components/modals/add_image_modal";
import AddVersionModal from "@/components/modals/add_version_modal";

const ClientDetail: React.FC = () => {
    const dispatch = useAppDispatch();
    const { clientId, clientName, AddNewVersionModal, AddNewImageModal, images, pagination, downloadStatus } = useAppSelector((state) => state.client_detail);
    const { currentPage, itemsPerPage } = pagination;
    const searchParams = useSearchParams()
    const router = useRouter();
    const options = ["No filter", "Stable Diffusion", "DALL-E", "MidJourney"]

    const [searchQuery, setSearchQuery] = useState("");
    const [modelFilter, setModelFilter] = useState("");

    useEffect(() => {
        // console.log(searchParams.get('id'))
        if (searchParams.get('id')) {
            dispatch(getClientDetails(searchParams.get('id')))
        }
    }, [dispatch, searchParams])

    useEffect(() => {
        dispatch(setTotalItems(images.length));
    }, [images.length, dispatch]);

    useEffect(() => {
        if (downloadStatus.type) {
            const timer = setTimeout(() => {
                dispatch(clearDownloadStatus());
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [downloadStatus.type, dispatch]);

    const filteredImages = images
        .map((image) => {
            const filteredVersions = image.versions.filter((version) => {
                const promptFilter = (searchQuery !== "" ? version.promptUsed?.toLowerCase().includes(searchQuery.toLowerCase()) : true);
                const aiModelFilter = (modelFilter !== "" ? version.modelUsed === modelFilter : true);
                return promptFilter && aiModelFilter;
            });

            // If at least one version matches, include the image with filtered versions
            if (filteredVersions.length > 0 || (modelFilter === "" && searchQuery === "")) {
                return {
                    ...image,
                    versions: filteredVersions,
                };
            }

            return null; // Exclude images with no matching versions
        })
        .filter((image) => image !== null);

    const getPaginatedImages = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredImages.slice(startIndex, endIndex);
    };

    const displayedImages = getPaginatedImages();

    const handleAddNewVersion = (e: React.MouseEvent, imageId: string) => {
        e.stopPropagation();
        dispatch(setImageId(imageId));
        dispatch(ShowAddNewVersionModal(true));
    };

    const handleDownloadUpscaledImages = (upscaledImageUrls: string[]) => {
        dispatch(downloadUpscaledImages(upscaledImageUrls));
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            {/* Header */}
            <Header title="CLIENT DETAIL">
                <div className="w-8" />
            </Header>

            {/* Back Button */}
            <BackButton />

            {/* Main Content */}
            <main id="main" className="flex-1 p-6 w-full">
                <Card className="w-full">
                    <CardHeader>
                        <div className="flex justify-between items-center flex-col sm:flex-row gap-2">
                            <div>
                                <CardTitle className="text-2xl font-bold">Client Information</CardTitle>
                                <CardDescription>Manage images and versions for this client</CardDescription>
                            </div>
                            <Button
                                onClick={() => dispatch(ShowAddNewImageModal(true))}
                                className="gap-2 cursor-pointer"
                            >
                                <Plus size={16} /> Add New Image
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">

                        <Card>
                            <CardContent className="flex flex-col sm:flex-row justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm text-muted-foreground">Client ID:</span>
                                        <Badge variant="outline">{clientId}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm text-muted-foreground">Client Name:</span>
                                        <span className="font-semibold">{clientName}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="outline" size="icon">
                                                    <Info className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>This client has {images.length} images</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Search & Filter */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Filter using prompt"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full sm:w-[200px] justify-between">
                                        <div className="flex items-center gap-2">
                                            <Filter className="h-4 w-4" />
                                            <span className="text-muted-foreground">
                                                {modelFilter || "Select Model"}
                                            </span>
                                        </div>
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[200px]">
                                    {options.map((option) => (
                                        <DropdownMenuItem
                                            key={option}
                                            onClick={() => setModelFilter(option === "No filter" ? "" : option)}
                                        >
                                            {option}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <Separator />

                        {/* Table */}
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted">
                                    <TableHead className="w-[100px]">Image ID</TableHead>
                                    <TableHead className="text-center">Original Image</TableHead>
                                    <TableHead className="text-center">Generated Image(s)</TableHead>
                                    <TableHead className="text-center">Upscaled Image(s)</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayedImages.length > 0 ? (
                                    displayedImages.map((image) => (
                                        <TableRow key={image.imageId}>
                                            {/* Image ID */}
                                            <TableCell className="font-medium">{image.imageId}</TableCell>

                                            {/* Original Image */}
                                            <TableCell>
                                                <div className="flex flex-col items-center space-y-2">
                                                    <div className="w-[120px]">
                                                        <AspectRatio ratio={3 / 4} className="bg-muted rounded-md overflow-hidden">
                                                            <Image
                                                                src={image.originalImageUrl}
                                                                alt="Original Image"
                                                                fill
                                                                className="object-contain"
                                                            />
                                                        </AspectRatio>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Generated Images */}
                                            <TableCell>
                                                <div className="flex flex-col gap-4">
                                                    {image.versions.map((version, vIdx) => (
                                                        <div
                                                            key={`gen-${vIdx}`}
                                                            className="flex flex-col items-center space-y-3"
                                                        >
                                                            <div className="w-[120px]">
                                                                <AspectRatio ratio={3 / 4} className="bg-muted rounded-md overflow-hidden">
                                                                    <Image
                                                                        src={version.generatedImageUrl}
                                                                        alt="Generated Image"
                                                                        fill
                                                                        className="object-contain cursor-pointer"
                                                                        onClick={() => router.push(`/image_detail?clientId=${clientId}&imageId=${image.imageId}&versionId=${version.versionId}`)}
                                                                    />
                                                                </AspectRatio>
                                                            </div>
                                                            <div className="text-xs space-y-1 w-full flex flex-col gap-1 text-center">
                                                                <HoverCard>
                                                                    <HoverCardTrigger asChild>
                                                                        <p className="truncate max-w-[120px] mx-auto">
                                                                            <span className="font-medium">Prompt:</span> {version.promptUsed}
                                                                        </p>
                                                                    </HoverCardTrigger>
                                                                    <HoverCardContent className="w-80">
                                                                        <div className="space-y-1">
                                                                            <p className="text-sm font-medium">Full Prompt</p>
                                                                            <p className="text-sm">{version.promptUsed}</p>
                                                                        </div>
                                                                    </HoverCardContent>
                                                                </HoverCard>
                                                                <p><span className="font-medium">AI Model:</span> <Badge variant="outline" className="text-xs">{version.modelUsed}</Badge></p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>

                                            {/* Upscaled Images */}
                                            <TableCell>
                                                <div className="flex flex-col gap-4">
                                                    {image.versions.map((version, vIdx) => {
                                                        if (version.upscaledImageUrl === "") {
                                                            return (
                                                                <div key={`up-${vIdx}`} className="flex flex-col items-center space-y-2 pb-13">
                                                                    <div className="w-[120px]">
                                                                        <AspectRatio ratio={3 / 4} className="bg-muted rounded-md overflow-hidden flex items-center justify-center">
                                                                            <span className="text-xs text-muted-foreground">Not available</span>
                                                                        </AspectRatio>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                        return (
                                                            <div key={`up-${vIdx}`} className="flex flex-col items-center space-y-2 pb-13">
                                                                <div className="w-[120px]">
                                                                    <AspectRatio ratio={3 / 4} className="bg-muted rounded-md overflow-hidden">
                                                                        <Image
                                                                            src={version.upscaledImageUrl}
                                                                            alt="Upscaled Image"
                                                                            fill
                                                                            className="object-contain cursor-pointer"
                                                                            onClick={() => router.push(`/image_detail?clientId=${clientId}&imageId=${image.imageId}&versionId=${version.versionId}`)}
                                                                        />
                                                                    </AspectRatio>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                onClick={(e) => handleAddNewVersion(e, image.imageId)}
                                                                variant="outline"
                                                                size="icon"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Add new version</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                onClick={() => handleDownloadUpscaledImages(image.versions.map((v) => v.upscaledImageUrl))}
                                                                // variant="outline"
                                                                disabled={downloadStatus.isLoading}
                                                                variant="outline"
                                                            >
                                                                <CloudDownload size={16} />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Download upscaled images</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            {images.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center space-y-3">
                                                    <p className="text-muted-foreground">No images found for this client</p>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => dispatch(ShowAddNewImageModal(true))}
                                                        className="gap-2"
                                                    >
                                                        <Plus size={16} /> Add First Image
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <Skeleton className="h-6 w-1/2 mx-auto" />
                                                    <p className="text-sm text-muted-foreground">
                                                        No results match your filter criteria
                                                    </p>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        <CardFooter className="flex justify-end">
                            <PaginationCD totalItems={filteredImages.length} />
                        </CardFooter>
                    </CardContent>
                </Card>
            </main>

            {/* Footer */}
            <Footer />

            {/* Modals */}
            {AddNewVersionModal.isOpen && <AddVersionModal />}
            {AddNewImageModal.isOpen && <AddImageModal />}
        </div>
    );
};

export default ClientDetail;
