import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = window.location.search ? window.location.search : "";
    navigate(`/auth${params}`);
  }, [navigate]);

  return <div>Loading...</div>;
};

export default Login;
