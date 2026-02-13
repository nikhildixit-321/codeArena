import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { FaGoogle, FaGithub, FaTimes } from "react-icons/fa";

const Register = ({ onSwitch }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { username, email, password });
      onSwitch(); // Switch to login after successful registration
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleOAuth = (provider) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiUrl}/auth/${provider}`;
  };

  return (
    <div className="relative w-[380px] bg-gray-950 border border-gray-800 rounded-xl p-6 text-white shadow-2xl">
      {/* Close */}
      <button className="absolute top-3 right-3 text-gray-400 hover:text-white">
        <FaTimes />
      </button>

      <h2 className="text-2xl font-semibold text-center mb-1">
        Join Arena ⚔️
      </h2>
      <p className="text-sm text-gray-400 text-center mb-6">
        Register to start competing
      </p>

      {error && <div className="text-red-500 text-xs text-center mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full mb-3 p-3 bg-gray-900 rounded border border-gray-700 outline-none focus:border-purple-500 text-sm"
          required
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full mb-3 p-3 bg-gray-900 rounded border border-gray-700 outline-none focus:border-purple-500 text-sm"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full mb-4 p-3 bg-gray-900 rounded border border-gray-700 outline-none focus:border-purple-500 text-sm"
          required
        />

        <button
          type="submit"
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded font-semibold transition"
        >
          Create Account
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
        Sign up with Google
      </button>

      <button 
        onClick={() => handleOAuth('github')}
        className="w-full flex items-center justify-center gap-3 py-3 border border-gray-700 rounded hover:bg-gray-900 transition"
      >
        <FaGithub />
        Sign up with GitHub
      </button>

      <p className="text-sm text-center text-gray-400 mt-4">
        Already have an account?{" "}
        <span
          onClick={onSwitch}
          className="text-purple-500 cursor-pointer hover:underline font-bold"
        >
          Sign In
        </span>
      </p>
    </div>
  );
};

export default Register;
