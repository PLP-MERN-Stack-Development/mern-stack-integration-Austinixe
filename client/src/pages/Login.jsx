import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import the custom hook

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the global login function

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      ); // Destructure the token from the rest of the user data
      const { token, ...userData } = res.data; // Call the global login function to set state and localStorage

      login(userData, token);
      navigate("/"); // Redirect to home after successful login
    } catch (error) {
      // Use the error response message or a generic fallback
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
           {" "}
      <form onSubmit={handleSubmit} className="space-y-4 w-80">
                <h2 className="text-2xl font-bold">Login</h2>
               {" "}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
               {" "}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
                <button type="submit">Login</button>       {" "}
        {message && <p>{message}</p>}     {" "}
      </form>
         {" "}
    </div>
  );
}
