// cloudinaryUploader.js
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv'

dotenv.config()

// Cloudinary configuration
cloudinary.config({
  cloud_name: "dmmtivqan",
  api_key: "161289169244717",
  api_secret: process.env.Cloudnary_Secret_Key,
});

// Cloudinary storage setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'], // Allowed file formats
  },
});

const upload = multer({ storage });

export default upload.single('imageUrl'); // Middleware for single file upload
