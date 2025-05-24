import express from 'express'
const ImageRouter = express.Router()

import { ObjectId } from "mongodb";
import Client from '../../models/model';
import multer from "multer";
import fs from 'fs';
const path = require('path');

// Ensure "uploads" directory exists
const UPLOADS_DIR = "uploads/";
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

const storage = multer.diskStorage({
    destination: function (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
        cb(null, 'uploads/')
    },
    filename: function (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
});
const upload = multer({ storage });

ImageRouter.post('/add_new_version', upload.single('generatedImage'), async (req, res) => {
    try {
        const { imageID, aiModel, prompt } = req.body;

        if (!imageID || !aiModel || !prompt) {
            res.status(400).json({
                success: false,
                message: 'Image ID, AI model, and prompt are required'
            });
            return;
        }

        let url = req.file?.filename
        if (url) {
            url = `http://localhost:${process.env.PORT}/uploads/${url}`
        }

        const versionId = new ObjectId();

        const newVersion = {
            versionId: versionId.toString(),
            generatedImageUrl: url,
            upscaledImageUrl: "",
            modelUsed: aiModel,
            promptUsed: prompt
        };

        // Update the database
        const updateResult = await Client.findOneAndUpdate(
            { "images.imageId": imageID },
            {
                $push: {
                    "images.$.versions": newVersion
                }
            },
            { new: true }
        );
        if (!updateResult) {
            // Find the image in the updated document
            res.status(400).json({
                success: false,
                message: 'Invalid Image Id'
            });
            return
        }
        const updatedImage = updateResult.images.find(img => img.imageId === imageID);
        if (updatedImage && updatedImage.versions && updatedImage.versions.length > 0) {
            // Get the last version (the one we just added)
            const latestVersion = updatedImage.versions[updatedImage.versions.length - 1];
            // console.log("Latest version added:", latestVersion);
            // console.log("AI Model in saved version:", latestVersion.model);
            res.status(201).json({
                success: true,
                message: 'Version added successfully',
                latestVersion
            });
            return
        } else {
            res.status(500).json({
                success: false,
                message: 'Database error in /add_new_version'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server side error in /add_new_version'
        });
    }
});

ImageRouter.post('/replace_generated', upload.single('generatedImage'), async (req, res) => {
    try {
        const { imageID, versionId, aiModel, prompt } = req.body;

        if (!imageID || !versionId || !aiModel || !prompt) {
            res.status(400).json({
                success: false,
                message: 'Image ID, Version ID, AI model, and prompt are required'
            });
            return;
        }

        let url = req.file?.filename
        if (url) {
            url = `http://localhost:${process.env.PORT}/uploads/${url}`
        } else {
            res.status(400).json({
                success: false,
                message: 'Generated image file is required'
            });
            return;
        }

        const oldClient = await Client.findOneAndUpdate(
            {
                "images.imageId": imageID,
                "images.versions.versionId": versionId
            },
            {
                $set: {
                    "images.$[img].versions.$[ver].generatedImageUrl": url,
                    "images.$[img].versions.$[ver].modelUsed": aiModel,
                    "images.$[img].versions.$[ver].promptUsed": prompt
                }
            },
            {
                arrayFilters: [
                    { "img.imageId": imageID },
                    { "ver.versionId": versionId }
                ],
                new: false // ← returns document BEFORE update
            }
        );

        if (!oldClient) {
            res.status(404).json({
                success: false,
                message: "Client with given image/version not found"
            });
            return;
        }

        let oldUrl = "";

        for (const image of oldClient.images) {
            if (image.imageId === imageID) {
                for (const version of image.versions) {
                    if (version.versionId === versionId) {
                        oldUrl = version.generatedImageUrl || "";
                        break;
                    }
                }
                break;
            }
        }

        if (oldUrl && oldUrl !== url) {
            const oldFilename = oldUrl.split("/uploads/")[1];
            if (oldFilename) {
                const oldFilePath = path.join(__dirname, "../../../uploads", oldFilename);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
        }

        res.status(200).json({
            success: true,
            message: 'Generated image replaced successfully',
            updatedUrl: url,
        });
        return
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server side error in /replace_generated'
        });
        return
    }
});

ImageRouter.post('/add_new_image', upload.single("image"), async (req, res) => {
    try {
        let { clientId } = req.body;
        // console.log(req.body, req.file)
        let url = req.file?.filename
        if (url) {
            url = `http://localhost:${process.env.PORT}/uploads/${url}`
        }

        // add it to db
        // check for the existence of the client
        const client = await Client.findById(clientId);
        if (!client) {
            res.status(404).json({ error: "Client not found" });
            return
        }

        const imageId = new ObjectId();
        const newImage = {
            imageId: imageId.toString(),
            originalImageUrl: url,
            versions: [] // Empty versions array initially
        };

        const newDoc = await Client.findByIdAndUpdate(
            clientId,
            { $push: { images: newImage } },
            { new: true } // Return the updated document
        );
        // console.log(newDoc)

        if (newDoc == null) {
            res.status(400).json({
                success: false,
                message: 'Invalid client'
            });
            return;
        }

        res.json({
            message: "Image uploaded successfully",
            newImage: newDoc?.images.at(-1)
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

ImageRouter.post('/add_upscaled_image', upload.single("image"), async (req, res) => {
    console.log(req.body, req.file)
    try {
        let { imageId, versionId } = req.body;
        let url = req.file?.filename
        if (!url) {
            res.status(400).json({ message: "Image file is required" });
            return;
        }
        if (url) {
            url = `http://localhost:${process.env.PORT}/uploads/${url}`
        }

        const client = await Client.findOne({
            "images.imageId": imageId,
            "images.versions.versionId": versionId
        });

        if (!client) {
            res.status(404).json({ message: "Client with given image/version not found" });
            return;
        }

        // Loop to find the exact version object
        let oldUrl = "";
        for (const image of client.images) {
            if (image.imageId === imageId) {
                for (const version of image.versions) {
                    if (version.versionId === versionId) {
                        oldUrl = version.upscaledImageUrl || "";
                        version.upscaledImageUrl = url;
                        break;
                    }
                }
                break;
            }
        }

        // Delete old file if it exists
        if (oldUrl && oldUrl.trim() !== "") {
            const oldFilename = oldUrl.split("/uploads/")[1];
            const oldFilePath = path.join(__dirname, "../../../uploads", oldFilename);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
                console.log("Old upscaled image deleted:", oldFilename);
            }
        }

        await client.save();
        res.status(200).json({
            message: "Upscaled image uploaded and saved successfully",
            imageUrl: url
        });

        return;
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

export default ImageRouter
