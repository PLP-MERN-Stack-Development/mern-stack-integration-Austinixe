import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// 1. ADD THE MISSING IMPORT
import { AuthProvider } from './context/AuthContext'; 

// You might also need your CSS import if it was removed:
// import './index.css' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. ADD THE CRITICAL WRAPPER */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)