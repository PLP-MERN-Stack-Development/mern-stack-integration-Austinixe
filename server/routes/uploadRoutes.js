import express from 'express';
import { uploadImage } from '../middleware/uploadMiddleware.js'; // Import the middleware
import asyncHandler from 'express-async-handler';

const router = express.Router();

// @desc    Upload image file
// @route   POST /api/upload
// @access  Private (Authentication is handled implicitly via the post creation process, 
// but we still want to ensure a file is present.)
router.post('/', uploadImage, asyncHandler(async (req, res) => {
    // Multer handles the file upload and attaches the file object to req.file
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded.');
    }
    
    // On successful upload, return the file path (relative to the server)
    // The client will use this path to save in the Post.featuredImage field
    res.status(200).json({ filePath: `/uploads/${req.file.filename}` });
}));

export default router;