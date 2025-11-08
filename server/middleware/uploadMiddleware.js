import multer from 'multer';
import path from 'path';

// Define storage location and filename format
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Files will be saved in the 'uploads' directory in the server root
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Create a unique filename: fieldname-timestamp.ext
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

// Define file filter (only accept images)
const fileFilter = (req, file, cb) => {
    // Check file types (jpg, jpeg, png, gif)
    const filetypes = /jpe?g|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        // Reject file if it's not an image
        cb(new Error('Only images (jpg, jpeg, png, gif) are allowed!'));
    }
};

// Initialize multer upload configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5, // Limit file size to 5MB
    }
});

// Export a handler for single file uploads (field name 'image')
export const uploadImage = upload.single('image');