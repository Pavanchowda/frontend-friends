import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import ForgotPassword from './ForgotPassword';
import FriendList from './Friends';
import './SignIn.css';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const { setIsLoggedIn, setUserEmail } = useOutletContext();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page

    try {
      const response = await axios.post('http://localhost:3000/api/v1/sessions', {
        email: email,
        password: password
      });
      console.log('Response:', response.data);

      if (response.data.success) {
        console.log('Sign-in successful:', response.data);
        // Save authentication state to session storage
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('user_id', response.data.user_id)
        setIsLoggedIn(true); // Update login state
        setUserEmail(email);
        navigate('/friends'); // Redirect if successful
      } else {
        setError(response.data.error); // Set error message if not successful
      }
      //  !error && navigate('/friends'); // Use relative path
      //   console.log("2")
    } catch (error) {
      console.error('Sign-in failed:', error.response?.data || error.message);
      setError('Invalid email or password');
    }
  };

  

  return (
    <div className="Auth-form-container">
      <form className="Auth-form" onSubmit={handleSubmit}>
        <div className="Auth-form-content">
          <h3 className="Auth-form-title">Sign In</h3>
          <div className="form-group mt-3">
            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control mt-1"
              placeholder="Enter email"
            />
          </div>
          <div className="form-group mt-3">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control mt-1"
              placeholder="Enter password"
            />
          </div>
          <div className="d-grid gap-2 mt-3">
            <button type="submit" className="btn btn-primary">
              Sign In
            </button>
          </div>
          <button onClick={() => navigate('/forgot-password')} className="forgot-password-btn">
            Forgot Password
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default SignIn;
