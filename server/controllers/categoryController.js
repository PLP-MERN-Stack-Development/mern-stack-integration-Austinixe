import Category from '../models/Category.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({});
    res.status(200).json(categories);
});

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private (Requires JWT)
export const createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Category name is required');
    }

    // Check if category already exists
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
        res.status(400);
        throw new Error('Category already exists');
    }

    const category = await Category.create({ name });
    res.status(201).json(category);
});