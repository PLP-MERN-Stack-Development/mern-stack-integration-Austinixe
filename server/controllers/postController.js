import Post from '../models/Post.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose'; 

// @desc    Get all posts (with optional search/filter/pagination)
// @route   GET /api/posts
// @access  Public
export const getPosts = asyncHandler(async (req, res) => {
    const { search, category, page = 1, limit = 10 } = req.query; 
    let query = {}; 
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // 1. Search Logic
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
        ];
    }

    // 2. Category Filter Logic
    if (category) {
        if (!mongoose.Types.ObjectId.isValid(category)) {
            res.status(400);
            throw new Error('Invalid Category ID format for filtering.');
        }
        query.category = category;
    }

    // 3. Count total documents matching the query (for total pages calculation)
    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limitNumber);

    // 4. Fetch posts with limit and skip for pagination
    const posts = await Post.find(query)
        .limit(limitNumber)
        .skip(skip)
        .populate('author', 'name')
        .populate('category', 'name')
        .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
        posts,
        currentPage: pageNumber,
        totalPages,
        totalPosts,
    });
});

// @desc    Get a specific post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPost = asyncHandler(async (req, res) => {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(404);
        throw new Error('Post not found (Invalid ID format)');
    }

    const post = await Post.findById(postId)
        .populate('author', 'name email')
        .populate('category', 'name');

    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }

    res.status(200).json(post);
});

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private 
export const createPost = asyncHandler(async (req, res) => {
    const { title, content, category, featuredImage } = req.body;

    if (!title || !content || !category) {
        res.status(400);
        throw new Error('Please add a title, content, and category.');
    }

    const post = await Post.create({
        title,
        content,
        category,
        featuredImage, 
        author: req.user._id,
    });

    res.status(201).json(post);
});

// @desc    Update an existing post
// @route   PUT /api/posts/:id
// @access  Private (Requires JWT and Author ownership)
export const updatePost = asyncHandler(async (req, res) => {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(404);
        throw new Error('Post not found (Invalid ID format)');
    }
    
    const post = await Post.findById(postId);

    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }

    if (!post.author.equals(req.user._id)) {
        res.status(403); 
        throw new Error('User not authorized to update this post');
    }

    const updatedPost = await Post.findByIdAndUpdate(
        postId,
        req.body,
        { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedPost);
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (Requires JWT and Author ownership)
export const deletePost = asyncHandler(async (req, res) => {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(404);
        throw new Error('Post not found (Invalid ID format)');
    }
    
    const post = await Post.findById(postId);

    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }

    if (!post.author.equals(req.user._id)) {
        res.status(403); 
        throw new Error('User not authorized to delete this post');
    }
    
    await post.deleteOne();

    res.status(200).json({ id: postId, message: 'Post removed successfully' });
});