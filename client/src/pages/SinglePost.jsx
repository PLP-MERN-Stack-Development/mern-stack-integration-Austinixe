import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SinglePost() {
    const { id } = useParams(); // Gets the 'id' from the URL
    const navigate = useNavigate();
    const { user } = useAuth(); // Get authenticated user for permission checks
    
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newCommentContent, setNewCommentContent] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthor, setIsAuthor] = useState(false);
    const [commentSubmitting, setCommentSubmitting] = useState(false);

    // --- Data Fetching Functions ---

    // Fetch comments for the current post
    const fetchComments = async () => {
        try {
            const res = await axios.get(`/api/posts/${id}/comments`);
            setComments(res.data);
        } catch (err) {
            console.error("Error fetching comments:", err);
        }
    };

    // Fetch post data
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get(`/api/posts/${id}`);
                const fetchedPost = res.data;
                setPost(fetchedPost);

                // Check authorization using robust string comparison
                if (user && fetchedPost.author && String(user._id) === String(fetchedPost.author._id)) {
                    setIsAuthor(true);
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching post:", err);
                if (err.response && err.response.status === 404) {
                    setError("Post not found.");
                } else {
                    setError("Failed to load post details.");
                }
                setLoading(false);
            }
        };

        if (id) {
            fetchPost();
            fetchComments(); // Fetch comments immediately after post fetch starts
        } 
    }, [id, user]);

    // --- Handlers ---

    // Handler for post deletion
    const handleDelete = async () => {
        // NOTE: Using window.confirm/alert for confirmation as standard practice
        if (!user || !user.token) return;

        if (!window.confirm("Are you sure you want to delete this post?")) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.delete(`/api/posts/${id}`, config);
            alert("Post deleted successfully!");
            navigate('/'); // Redirect to homepage
        } catch (err) {
            console.error("Delete failed:", err.response?.data?.message || err.message);
            alert("Failed to delete post. Check permissions.");
        }
    };

    // Handler for comment submission
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newCommentContent.trim() || !user) return;

        setCommentSubmitting(true);

        try {
            const token = user.token;
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };
            const payload = { content: newCommentContent };

            // POST to the protected comment creation endpoint
            const res = await axios.post(`/api/posts/${id}/comments`, payload, config);
            
            // Add the new comment to the state immediately (Optimistic UI update)
            setComments(prevComments => [res.data, ...prevComments]); 
            setNewCommentContent(''); // Clear the input field
            
        } catch (err) {
            console.error("Comment submission failed:", err.response?.data?.message || err.message);
            alert("Failed to submit comment. Please ensure you are logged in.");
        } finally {
            setCommentSubmitting(false);
        }
    };


    // --- Rendering ---
    
    if (loading) {
        return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading post...</div>;
    }
    if (error) {
        return <div style={{ textAlign: "center", marginTop: "50px", color: 'red' }}>Error: {error}</div>;
    }
    if (!post) {
        return <div style={{ textAlign: "center", marginTop: "50px" }}>Post data is empty.</div>;
    }
    
    const formattedDate = new Date(post.createdAt).toLocaleDateString();

    return (
        <div style={pageContainerStyle}>
            
            {/* Post Content Area */}
            <div style={postContainerStyle}>
                {post.featuredImage && (
                    <img 
                        src={`http://localhost:5000${post.featuredImage}`} 
                        alt={post.title} 
                        style={imageStyle}
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                    />
                )}
                <h1>{post.title}</h1>
                
                <div style={metaStyle}>
                    <p>By: **{post.author?.name || 'Unknown Author'}**</p>
                    <p>Category: **{post.category?.name || 'Uncategorized'}**</p>
                    <p>Published: {formattedDate}</p>
                </div>
                
                <div style={contentStyle}>
                    <p>{post.content}</p>
                </div>

                {/* Edit/Delete buttons visible only to the author */}
                {isAuthor && (
                    <div style={buttonGroupStyle}>
                        <button 
                            onClick={() => navigate(`/edit/${post._id}`)} 
                            style={editButtonStyle}
                        >
                            Edit Post
                        </button>
                        <button 
                            onClick={handleDelete} 
                            style={deleteButtonStyle}
                        >
                            Delete Post
                        </button>
                    </div>
                )}
                
                <Link to="/" style={backLinkStyle}>&larr; Back to all posts</Link>
            </div>


            {/* Comments Section */}
            <div style={commentsSectionStyle}>
                <h2>Comments ({comments.length})</h2>

                {/* Comment Submission Form (Visible only when logged in) */}
                {user ? (
                    <form onSubmit={handleCommentSubmit} style={commentFormStyle}>
                        <textarea
                            value={newCommentContent}
                            onChange={(e) => setNewCommentContent(e.target.value)}
                            placeholder="Write your comment here..."
                            rows="4"
                            required
                            style={commentInputStyle}
                            disabled={commentSubmitting}
                        ></textarea>
                        <button type="submit" disabled={commentSubmitting} style={submitCommentButtonStyle}>
                            {commentSubmitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </form>
                ) : (
                    <p style={{ textAlign: 'center', margin: '20px' }}>
                        Please <Link to="/login">log in</Link> to leave a comment.
                    </p>
                )}


                {/* Display Existing Comments */}
                <div style={commentListStyle}>
                    {comments.length > 0 ? (
                        comments.map(comment => (
                            <div key={comment._id} style={commentItemStyle}>
                                <div style={commentHeaderStyle}>
                                    <strong>{comment.author?.name || 'Unknown'}</strong>
                                    <span style={{ fontSize: '0.8em', color: '#888' }}>
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p style={{ marginTop: '5px' }}>{comment.content}</p>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', color: '#888' }}>No comments yet. Be the first!</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// Basic Inline Styles
const pageContainerStyle = {
    maxWidth: '1000px',
    margin: '30px auto',
    padding: '0 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
};

const postContainerStyle = {
    padding: '30px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    backgroundColor: '#f9f9f9',
};

const imageStyle = {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '20px',
};

const metaStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95em',
    color: '#444',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
    marginBottom: '20px',
};

const contentStyle = {
    lineHeight: '1.7',
    fontSize: '1.1em',
    whiteSpace: 'pre-wrap', 
};

const buttonGroupStyle = {
    marginTop: '20px',
    borderTop: '1px solid #eee',
    paddingTop: '15px',
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
};

const editButtonStyle = {
    padding: '8px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
};

const deleteButtonStyle = {
    padding: '8px 15px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
};

const backLinkStyle = {
    display: 'block',
    marginTop: '30px',
    color: '#007bff',
    textDecoration: 'none',
    textAlign: 'left',
};

// --- Comments Styles ---

const commentsSectionStyle = {
    padding: '30px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
    backgroundColor: 'white',
};

const commentFormStyle = {
    marginBottom: '20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '20px',
};

const commentInputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    resize: 'vertical',
    marginBottom: '10px',
};

const submitCommentButtonStyle = {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    float: 'right',
};

const commentListStyle = {
    clear: 'both',
    paddingTop: '10px',
};

const commentItemStyle = {
    border: '1px solid #eee',
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '6px',
    backgroundColor: '#fafafa',
};

const commentHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 'bold',
    color: '#333',
    borderBottom: '1px dashed #ddd',
    paddingBottom: '5px',
};