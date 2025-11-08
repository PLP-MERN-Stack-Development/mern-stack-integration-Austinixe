import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Comment content cannot be empty'],
        trim: true,
    },
    // Reference to the post the comment belongs to
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    // Reference to the user who wrote the comment
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
});

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;