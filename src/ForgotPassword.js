import React, { useState } from 'react';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/v1/forgot-password', { email });
      setMessage('Password reset link has been sent to your email.');
      // Optionally, you can redirect or clear the form here
    } catch (error) {
      console.error('Error during password reset request:', error.response ? error.response.data : error.message);
      setMessage(error.response ? error.response.data.error : 'Error sending password reset link. Please try again.');
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleForgotPassword}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
      {message && <div className="message">{message}</div>} {/* Display message */}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default ForgotPassword;
