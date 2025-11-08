import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

// Function to retrieve the full user object (including _id) from localStorage on app load
const getInitialUser = () => {
    try {
        // We now retrieve the whole 'user' object, not just the 'token'
        const storedUser = localStorage.getItem('user'); 
        if (storedUser) {
            return JSON.parse(storedUser); // Parse the stored JSON string back into an object
        }
        return null;
    } catch (e) {
        console.error("Error reading user from localStorage", e);
        return null;
    }
};

// Custom Hook
export const useAuth = () => useContext(AuthContext);

// Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getInitialUser());

    // Function to handle successful login
    const login = (userData, token) => {
        // Create a complete user object with the token and login status
        const fullUser = { ...userData, token, isLoggedIn: true };
        
        // CRITICAL FIX: Save the ENTIRE user object as a JSON string
        // This ensures the _id is available on reload for the isAuthor check.
        localStorage.setItem('user', JSON.stringify(fullUser));
        
        setUser(fullUser);
    };

    // Function to handle logout
    const logout = () => {
        // Remove the entire user object from localStorage
        localStorage.removeItem('user'); 
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};