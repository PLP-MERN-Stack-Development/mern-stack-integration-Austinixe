import { body, validationResult } from 'express-validator';

// Validation rules for creating a new post
export const validatePostCreation = [
    // Check if title exists and is not empty
    body('title')
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),

    // Check if content exists and is not empty
    body('content')
        .notEmpty()
        .withMessage('Content is required')
        .isLength({ min: 10 })
        .withMessage('Content must be at least 10 characters long'),

    // Check if category exists and is a valid MongoDB ID
    body('category')
        .notEmpty()
        .withMessage('Category ID is required')
        .isMongoId()
        .withMessage('Category ID must be a valid MongoDB ID'),

    // Middleware to handle validation results
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Return a 400 Bad Request with the validation errors
            return res.status(400).json({ 
                errors: errors.array({ onlyFirstError: true }),
                message: 'Validation failed'
            });
        }
        next();
    }
];