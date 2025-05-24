import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

const phoneValidationSchema = z.string().refine((value) => {
  const validationRules = {
    IN: /^\+91[6-9]\d{9}$/,
    US: /^\+1[2-9]\d{9}$/,
    UK: /^\+44\d{10}$/,
    CA: /^\+1[2-9]\d{9}$/,
    AU: /^\+61[45]\d{8}$/,
    BR: /^\+55[1-9]\d{10,11}$/,
    UAE: /^\+971[5-9]\d{8}$/,
    SG: /^\+65[689]\d{7}$/,
  };
  return Object.values(validationRules).some(regex => regex.test(value));
}, {
  message: "Invalid phone number. Please use a valid international format with country code."
});

export const ClientValidationSchema = z.object({
  clientName: z.string()
    .min(2, { message: "Client name must be at least 2 characters long" })
    .max(50, { message: "Client name cannot exceed 50 characters" })
    .regex(/^[a-zA-Z\s]+$/, { message: "Client name can only contain letters and spaces" }),

  contactInfo: z.object({
    email: z.string()
      .email({ message: "Invalid email address" })
      .max(100, { message: "Email cannot exceed 100 characters" }),
    phone: phoneValidationSchema,
    countryCode: z.string().optional()
  })
});

interface IVersion extends Document {
  versionId: string;
  modelUsed: string;
  promptUsed: string;
  generatedImageUrl: string;
  upscaledImageUrl?: string;
}

interface IImage extends Document {
  imageId: string;
  originalImageUrl: string;
  promptUsed: string;
  modelUsed: string;
  versions: IVersion[];
}

interface IClient extends Document {
  clientId: string;
  clientName: string;
  contactInfo: {
    email: string;
    phone: string;
    countryCode?: string;
  };
  images: IImage[];
}

const VersionSchema: Schema = new Schema({
  versionId: { type: String, required: true },
  modelUsed: { type: String, required: true },
  promptUsed: { type: String, required: true },
  generatedImageUrl: { type: String, required: true },
  upscaledImageUrl: { type: String },
});

const ImageSchema: Schema = new Schema({
  imageId: { type: String, required: true },
  originalImageUrl: { type: String, required: true },
  versions: { type: [VersionSchema], default: [] },
});

const ClientSchema: Schema = new Schema({
  clientName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    validate: {
      validator: function (value: string) {
        return /^[a-zA-Z\s]+$/.test(value);
      },
      message: 'Client name can only contain letters and spaces'
    }
  },
  contactInfo: {
    email: {
      type: String,
      required: true,
      validate: {
        validator: function (value: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: () => 'Invalid email address'
      }
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (value: string) {
          const validationRules = {
            IN: /^\+91[6-9]\d{9}$/,
            US: /^\+1[2-9]\d{9}$/,
            UK: /^\+44\d{10}$/,
            CA: /^\+1[2-9]\d{9}$/,
          };
          return Object.values(validationRules).some(regex => regex.test(value));
        },
        message: () => 'Invalid phone number format'
      }
    },
    countryCode: {
      type: String,
      enum: ['IN', 'US', 'UK', 'CA']
    }
  },
  images: { type: [ImageSchema], default: [] },
});

const Client = mongoose.model<IClient>('Client', ClientSchema);

export default Client;
