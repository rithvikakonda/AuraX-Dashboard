import express from 'express'
const ClientRouter = express.Router()

import Client from '../../models/model';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

ClientRouter.get('/get_clients', async (req, res) => {
    try {
        const clients = await Client.find({}, { clientName: 1, contactInfo: 1 });
        const transformedClients = clients.map(client => ({
            clientId: client._id!.toString(),
            name: client.clientName,
            email: client.contactInfo?.email,
            phone: client.contactInfo?.phone,
            countryCode: client.contactInfo?.countryCode,
        }));
        
        res.status(200).json({
            success: true,
            message: 'Clients retrieved successfully',
            transformedClients
        });
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve clients'
        });
    }
});

ClientRouter.post('/delete_client', async (req, res) => {
    try {
        const { email } = req.body
        const client = await Client.findOne({ "contactInfo.email": email });
        const filesToDelete: string[] = [];

        if (!client) {
            res.status(404).json({
                success: false,
                message: 'Client not found'
            });
            return
        }

        client.images.forEach((image) => {
            if (image.originalImageUrl && image.originalImageUrl.includes('/uploads/')) {
                filesToDelete.push(image.originalImageUrl);
            }
            if (image.versions && image.versions.length > 0) {
                image.versions.forEach(version => {
                    if (version.generatedImageUrl && version.generatedImageUrl.includes('/uploads/')) {
                        filesToDelete.push(version.generatedImageUrl);
                    }

                    if (version.upscaledImageUrl && version.upscaledImageUrl.includes('/uploads/')) {
                        filesToDelete.push(version.upscaledImageUrl);
                    }
                });
            }
        });
        for (const url of filesToDelete) {
            try {
                const filename = url.split('/uploads/')[1];
                const filepath = path.join(__dirname, '../../../uploads', filename);

                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                    console.log(`Deleted file: ${filepath}`);
                }
            } catch (err) {
                console.error(`Failed to delete file from ${url}:`, err);
            }
        }
        const updatedClient = await Client.findOneAndDelete(
            { "contactInfo.email": email }
        );
        if (client) {
            res.status(200).json({
                success: true,
                message: 'Client deleted successfully',
            });
        } else {
            // document not found
            res.status(404).json({
                success: false,
                message: 'Client not found',
            });
        }
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete client'
        });
    }
});

ClientRouter.post('/add_new_client', async (req, res) => {
    try {
        const { name, email, phone, phoneCode, countryCode } = req.body;
        if (!name || !email || !phone || !phoneCode) {
            res.status(400).json({
                success: false,
                message: 'Client name, email, phone number and country code are required'
            });
            return;
        }

        // check for existence of the client with same email
        const clientExists = await Client.exists({ "contactInfo.email": email });
        if (clientExists) {
            res.status(400).json({
                success: false,
                message: 'Client with the given email already exists'
            });
            return;
        }

        const formattedPhone = `${phoneCode}${phone}`;
        const newClient = new Client({
            clientName: name,
            contactInfo: {
                email,
                phone: formattedPhone,
                countryCode
            },
            images: []
        });

        const savedClient = await newClient.save();
        res.status(201).json({
            success: true,
            message: 'Client added successfully',
        });
    } catch (error) {
        console.error('Error adding client:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add client'
        });
    }
});

ClientRouter.post('/get_client_details', async (req, res) => {
    try {
        const { clientId } = req.body

        if (!clientId) {
            res.status(400).json({
                success: false,
                message: 'Client ID is required'
            });
            return;
        }

        const objectId = new mongoose.Types.ObjectId(clientId);
        const clientData = await Client.findOne({ _id: objectId })
        if (clientData == null) {
            res.status(404).json({
                success: false,
                message: 'Client not found',
            });
        }

        // console.log(clientData)

        res.status(200).json({
            success: true,
            data: 'successfully retrieved clientDetails',
            clientData
        });
    } catch (error) {
        console.error('Error fetching client details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve client details'
        });
    }
});

export default ClientRouter
