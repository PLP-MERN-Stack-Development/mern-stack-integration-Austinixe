import express from 'express';
import {
    getCategories,
    createCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js'; 
// Note: We'll implement validation for categories later, but keep it simple for now.

const router = express.Router();

// Public route: GET all categories (needed for post forms)
router.route('/').get(getCategories);
// Private route: POST a new category (only admins/logged-in users should create categories)
router.route('/').post(protect, createCategory);

export default router;