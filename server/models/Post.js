import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Post title is required'],
        trim: true,
    },
    content: {
        type: String,
        required: [true, 'Post content is required'],
    },
    featuredImage: {
        type: String,
        default: 'placeholder.jpg',
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'A post must belong to a category'],
    },
    // 🛑 SLUG FIELD IS COMPLETELY REMOVED HERE
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// 🛑 pre('save') HOOK IS COMPLETELY REMOVED HERE as it depended on the slug field.

const Post = mongoose.model('Post', postSchema);
export default Post;