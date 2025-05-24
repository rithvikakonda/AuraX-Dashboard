import express from 'express'
import Client from '../../models/model';
const StudioRouter = express.Router()

StudioRouter.post('/get_image', async (req, res) => {
    try {
        const { imageId, versionId } = req.body;

        if (!imageId || !versionId) {
            res.status(400).json({
                success: false,
                message: 'Both imageId and versionId are required',
            });
            return
        }

        const client = await Client.findOne({ "images.imageId": imageId });

        if (!client) {
            console.log("Client or image not found");
            res.status(404).json({
                success: false,
                message: 'Image with the given image id not found',
            });
            return
        }

        const image = client.images.find(img => img.imageId === imageId);
        if (!image) {
            console.log("Image not found in client.images array");
            res.status(404).json({
                success: false,
                message: 'Image with the given image id not found',
            });
            return
        }

        const versionData = image.versions.find(version => version.versionId === versionId);
        if (!versionData) {
            console.log("Version not found in image.versions");
            res.status(404).json({
                success: false,
                message: 'Image with given version id under the given image id not found',
            });
            return
        }

        const url = versionData.upscaledImageUrl?.trim()
            ? versionData.upscaledImageUrl
            : versionData.generatedImageUrl || "";

        res.status(200).json({
            success: true,
            message: 'Image retrieved successfully',
            url,
        });
        return

    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve image',
        });
        return
    }
});


export default StudioRouter;
