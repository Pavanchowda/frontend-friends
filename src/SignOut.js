import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

const SignOut = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn, setUserEmail } = useOutletContext();

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail(''); // Clear the user email
    navigate('/SignIn'); // Redirect to SignIn page
  };

  return (
    <button onClick={handleLogout}>
      Sign Out
    </button>
  );
};

export default SignOut;
