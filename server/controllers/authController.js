import User from "../models/User.js";
import jwt from "jsonwebtoken";
// 🛑 NOTE: bcryptjs import removed because password comparison is now handled by the model.

// Generate JWT token (This helper function is correct)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc Register new user (This function is correct)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password, 
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// @desc Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // ✅ FIX: Use the user.matchPassword method and combine checks
    if (user && (await user.matchPassword(password))) {
        // SUCCESS: Credentials are valid
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        // FAILURE: User not found OR password did not match
        return res.status(401).json({ message: "Invalid credentials" });
    }

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};