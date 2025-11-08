import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

// Basic inline styles for the post card
const postCardStyle = {
    border: '1px solid #ccc',
    padding: '15px',
    margin: '10px',
    width: '300px',
    textAlign: 'left',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    backgroundColor: 'white',
    overflow: 'hidden',
};

// Basic inline styles for the search bar container
const controlContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    margin: '20px auto',
    maxWidth: '800px',
    padding: '10px',
};

const searchBarStyle = {
    display: 'flex',
    gap: '10px',
    width: '100%',
};

const searchInputStyle = {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1em',
    flexGrow: 1,
};

const actionButtonStyle = {
    padding: '10px 20px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
};

const paginationStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '20px',
    marginBottom: '40px',
};

const navButtonStyle = {
    padding: '8px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
};


export default function Home() {
    const { user, logout } = useAuth();
    
    // Post Data and Loading State
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search and Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState(''); // Triggers fetch
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const postsPerPage = 6; // Hardcoded limit for demonstration

    // Fetch Posts based on Search, Filter, and Page
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            setError(null);
            
            try {
                let url = `/api/posts?page=${currentPage}&limit=${postsPerPage}`;
                if (searchQuery) {
                    url += `&search=${encodeURIComponent(searchQuery)}`;
                }

                const res = await axios.get(url); 
                
                // Set post data and pagination meta data
                setPosts(res.data.posts);
                setTotalPages(res.data.totalPages);
                setCurrentPage(res.data.currentPage);

            } catch (err) {
                console.error("Error fetching posts:", err);
                setError("Failed to load posts.");
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [searchQuery, currentPage]); // Rerun fetch when searchQuery or currentPage changes


    const handleSearchClick = () => {
        // Reset to page 1 on new search query
        setCurrentPage(1);
        // Set the search query which triggers the useEffect
        setSearchQuery(searchTerm); 
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };


    // --- Conditional Rendering ---
    
    if (error) {
        return <div style={{ textAlign: "center", marginTop: "50px", color: 'red' }}>Error: {error}</div>;
    }
    
    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Welcome to MERN Blog</h1>

            {/* User Greeting and Logout Button */}
            {user ? (
                <>
                    <h3>Hello, {user.name || 'Blogger'} 👋</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                        <Link to="/create" style={{ textDecoration: 'none' }}>
                            <button style={{ ...actionButtonStyle, backgroundColor: '#28a745' }}>
                                Create New Post
                            </button>
                        </Link>
                        <button onClick={logout} style={{ ...actionButtonStyle, backgroundColor: '#dc3545' }}>
                            Logout
                        </button>
                    </div>
                </>
            ) : (
                <p>
                    Please <Link to="/login">login</Link> or <Link to="/register">register</Link>.
                </p>
            )}

            <hr style={{ margin: '30px auto', width: '80%', borderColor: '#ddd' }} />

            {/* Search Bar (Task 5) */}
            <div style={controlContainerStyle}>
                <div style={searchBarStyle}>
                    <input
                        type="text"
                        placeholder="Search titles or content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearchClick();
                        }}
                        style={searchInputStyle}
                        disabled={loading}
                    />
                    <button onClick={handleSearchClick} style={{...actionButtonStyle, backgroundColor: '#007bff'}} disabled={loading}>
                        {loading && searchQuery === searchTerm ? '...' : 'Search'}
                    </button>
                </div>
            </div>

            <h2>Latest Posts</h2>
            
            {loading ? (
                <div style={{ padding: '20px' }}>Loading posts...</div>
            ) : (
                <>
                    {posts.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
                            {posts.map(post => (
                                <div key={post._id} style={postCardStyle}>
                                    <Link to={`/posts/${post._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        {/* Display Image if present */}
                                        {post.featuredImage && (
                                            <img 
                                                src={`http://localhost:5000${post.featuredImage}`} 
                                                alt={post.title} 
                                                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} 
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x150/EEEEEE/333333?text=No+Image'; }}
                                            />
                                        )}
                                        <h3 style={{ marginTop: '10px', color: '#007bff' }}>{post.title}</h3>
                                    </Link>
                                    <p>{post.content.substring(0, 100)}...</p>
                                    <p style={{ fontSize: '0.9em', color: '#666' }}>
                                        Author: {post.author?.name || 'Unknown'} | Category: {post.category?.name || 'Uncategorized'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No posts found matching your criteria.</p>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={paginationStyle}>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || loading}
                                style={navButtonStyle}
                            >
                                Previous
                            </button>
                            <span>
                                Page **{currentPage}** of **{totalPages}**
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || loading}
                                style={navButtonStyle}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}