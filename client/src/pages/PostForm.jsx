import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PostForm() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID for edit mode
    const isEditing = !!id; // Boolean flag: true if editing
    
    // State for form data
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: '', // Stores the category ID
        featuredImage: '', // Stores the image path URL from the server
    });
    
    // State for files and upload status
    const [imageFile, setImageFile] = useState(null); 
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if user is not logged in (Protected route check)
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);


    // Fetch Categories and Pre-fill Post Data (if editing)
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Categories
                const categoryRes = await axios.get('/api/categories');
                const fetchedCategories = categoryRes.data;
                setCategories(fetchedCategories);

                let defaultCategory = fetchedCategories.length > 0 ? fetchedCategories[0]._id : '';

                // 2. Fetch Post Data if in Edit Mode
                if (isEditing) {
                    const postRes = await axios.get(`/api/posts/${id}`);
                    const post = postRes.data;
                    
                    // Check authorization before setting state
                    if (String(user?._id) !== String(post.author?._id)) {
                        navigate('/'); // Redirect if not authorized
                        return;
                    }

                    // Set form data from existing post
                    setFormData({
                        title: post.title,
                        content: post.content,
                        category: post.category._id || defaultCategory,
                        featuredImage: post.featuredImage || '',
                    });

                } else {
                    // Set default category ID for creation mode
                    setFormData(prev => ({ ...prev, category: defaultCategory }));
                }

            } catch (err) {
                setMessage("Failed to load data.");
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isEditing, id, user, navigate]); // Dependencies adjusted for robust hook execution

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Helper function to upload the image file to the server
    const uploadFile = async (file) => {
        const data = new FormData();
        // The field name 'image' must match the multer configuration in uploadMiddleware.js
        data.append('image', file); 

        try {
             const token = user.token;
             const config = {
                headers: {
                    'Content-Type': 'multipart/form-data', // IMPORTANT for file uploads
                    Authorization: `Bearer ${token}`, 
                },
             };
             const uploadRes = await axios.post('/api/upload', data, config);
             // Return the file path provided by the backend (e.g., /uploads/12345.jpg)
             return uploadRes.data.filePath; 
        } catch (error) {
            console.error("Image upload failed:", error);
            setMessage("Image upload failed. Please try again.");
            throw new Error("Image upload failed."); // Throw error to halt submission
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');

        try {
            let imagePath = formData.featuredImage; // Start with existing image path

            // 1. Handle File Upload if a new file is selected
            if (imageFile) {
                imagePath = await uploadFile(imageFile);
            }

            // 2. Prepare the final payload for the Post API
            const finalPayload = {
                ...formData,
                featuredImage: imagePath,
            };

            const token = user.token; 
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, 
                },
            };

            let res;
            if (isEditing) {
                // PUT request for editing
                res = await axios.put(`/api/posts/${id}`, finalPayload, config);
                setMessage('Post updated successfully!');
            } else {
                // POST request for creation
                res = await axios.post("/api/posts", finalPayload, config);
                setMessage('Post created successfully!');
            }
            
            // Redirect to the post's detail page
            navigate(`/posts/${res.data._id}`); 
            
        } catch (error) {
            const errMsg = error.response?.data?.message || `Post ${isEditing ? 'update' : 'creation'} failed.`;
            setMessage(errMsg);
            console.error("Post submit error:", error.response?.data || error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading form...</div>;
    // Check for authorization issue right after loading finishes
    if (!user && !loading) {
        // This handles cases where user navigated directly without logging in
        navigate('/login');
        return null;
    }
    
    const formTitle = isEditing ? 'Edit Existing Post' : 'Create New Blog Post';
    const buttonText = isEditing ? 'Update Post' : 'Create Post';

    return (
        <div style={formContainerStyle}>
            <h2>{formTitle}</h2>
            <form onSubmit={handleSubmit} style={formStyle}>
                
                {/* Title */}
                <input
                    type="text"
                    name="title"
                    placeholder="Post Title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                />
                
                {/* Content */}
                <textarea
                    name="content"
                    placeholder="Write your content here..."
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows="10"
                    style={{...inputStyle, resize: 'vertical'}}
                />
                
                {/* Image Upload Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label>Featured Image (optional):</label>
                    <input
                        type="file"
                        name="image"
                        onChange={handleFileChange}
                        accept="image/*"
                        style={inputStyle}
                    />
                    {formData.featuredImage && (
                        <p style={{ fontSize: '0.8em', color: '#666' }}>Current: {formData.featuredImage}</p>
                    )}
                </div>

                {/* Category Dropdown */}
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                    disabled={categories.length === 0}
                >
                    {categories.length > 0 ? (
                        categories.map(cat => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))
                    ) : (
                        <option value="">No categories available</option>
                    )}
                </select>

                <button type="submit" disabled={isSubmitting || categories.length === 0} style={buttonStyle}>
                    {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : buttonText}
                </button>
                
                {message && <p style={{ color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
                
                <p style={{ marginTop: '10px' }}>
                    <Link to="/" style={{ textDecoration: 'none', color: '#007bff' }}>Back to Home</Link>
                </p>

            </form>
        </div>
    );
}

// Basic Inline Styles
const formContainerStyle = {
    maxWidth: '600px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
};

const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
};

const inputStyle = {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1em'
};

const buttonStyle = {
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
};