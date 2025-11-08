import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path"; // 🔑 NEW IMPORT
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js"; 
import categoryRoutes from "./routes/categoryRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js"; // 🔑 NEW IMPORT

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes); 
app.use("/api/categories", categoryRoutes);

// 🔑 NEW ROUTE: Mount the Upload Router
app.use("/api/upload", uploadRoutes); 

// 🔑 NEW: Serve static files from the 'uploads' folder
const uploadDir = path.resolve('uploads'); // Resolves the path to the uploads folder
app.use('/uploads', express.static(uploadDir));

app.get("/", (req, res) => {
  res.send("MERN Blog API is running...");
});

// NOTE: You must also ensure your error handling middleware is added here, 
// likely as the last `app.use()` call before app.listen.

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));