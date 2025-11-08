import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import PostForm from "./pages/PostForm.jsx"; 
import SinglePost from "./pages/SinglePost.jsx"; 

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create" element={<PostForm />} /> 
        {/* Route for Editing: It loads the same PostForm component */}
        <Route path="/edit/:id" element={<PostForm />} />
        {/* Route for Viewing the single post */}
        <Route path="/posts/:id" element={<SinglePost />} />
      </Routes>
    </Router>
  );
}