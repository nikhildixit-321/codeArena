import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaGoogle, FaGithub, FaTimes } from "react-icons/fa";

const Login = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `http://localhost:5000/api/auth/${provider}`;
  };

  return (
    <div className="relative w-[380px] bg-gray-950 border border-gray-800 rounded-xl p-6 text-white shadow-2xl">
      {/* Close */}
      <button className="absolute top-3 right-3 text-gray-400 hover:text-white">
        <FaTimes />
      </button>

      <h2 className="text-2xl font-semibold text-center mb-1">
        Welcome Back 👋
      </h2>
      <p className="text-sm text-gray-400 text-center mb-6">
        Login to enter the arena
      </p>

      {error && <div className="text-red-500 text-xs text-center mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full mb-3 p-3 bg-gray-900 rounded border border-gray-700 outline-none focus:border-purple-500"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full mb-4 p-3 bg-gray-900 rounded border border-gray-700 outline-none focus:border-purple-500"
          required
        />

        <button
          type="submit"
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded font-semibold transition"
        >
          Login
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-4 text-gray-400">
        <div className="flex-1 h-px bg-gray-700" />
        <span className="text-sm">OR</span>
        <div className="flex-1 h-px bg-gray-700" />
      </div>

      {/* Social */}
      <button 
        onClick={() => handleOAuth('google')}
        className="w-full mb-2 flex items-center justify-center gap-3 py-3 border border-gray-700 rounded hover:bg-gray-900 transition"
      >
        <FaGoogle />
        Continue with Google
      </button>

      <button 
        onClick={() => handleOAuth('github')}
        className="w-full flex items-center justify-center gap-3 py-3 border border-gray-700 rounded hover:bg-gray-900 transition"
      >
        <FaGithub />
        Continue with GitHub
      </button>

      <p className="text-sm text-center text-gray-400 mt-4">
        New here?{" "}
        <span
          onClick={onSwitch}
          className="text-purple-500 cursor-pointer hover:underline"
        >
          Create account
        </span>
      </p>
    </div>
  );
};

export default Login;
