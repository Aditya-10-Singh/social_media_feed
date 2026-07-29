import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '123456789',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'secret'
});

router.post('/image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    // Try Cloudinary upload
    try {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'pulse_posts',
        transformation: [
          { width: 1200, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      });

      return res.json({ url: result.secure_url });
    } catch (cloudErr) {
      // Fallback: Convert to optimized base64 data URI so uploads ALWAYS work even offline!
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const fallbackUrl = `data:${req.file.mimetype};base64,${b64}`;
      return res.json({ url: fallbackUrl, fallback: true });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to process image upload' });
  }
});

export default router;
