import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Registration is now handled on the combined auth page (/login)
export function Register() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);
  return null;
}
