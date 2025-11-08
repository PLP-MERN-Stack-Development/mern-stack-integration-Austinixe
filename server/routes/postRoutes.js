import express from 'express';
import {
    getPosts,
    createPost,
    getPost,
    updatePost,
    deletePost
} from '../controllers/postController.js';
// 🔑 IMPORT the protection middleware
import { protect } from '../middleware/authMiddleware.js'; 
// 🔑 IMPORT the validation middleware
import { validatePostCreation } from '../middleware/postValidation.js'; 

const router = express.Router();

// Public route to fetch all posts
router.route('/').get(getPosts);

// ✅ SECURE AND VALIDATE: Only logged-in users with valid input can create a post
router.route('/')
    .post(protect, validatePostCreation, createPost); 

// ✅ SECURE REMAINING ROUTES: Apply protection to routes that modify data (PUT, DELETE)
router.route('/:id')
    .get(getPost) // Public route
    .put(protect, updatePost)
    .delete(protect, deletePost);

export default router;