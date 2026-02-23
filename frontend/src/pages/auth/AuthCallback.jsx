import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { checkUser } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get('token');
      if (token) {
        localStorage.setItem('token', token);
        await checkUser();
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    };
    handleAuth();
  }, [searchParams, navigate, checkUser]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Logging you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
