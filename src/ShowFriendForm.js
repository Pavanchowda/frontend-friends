import React from 'react';
import './ShowFriendForm.css'; 


const ShowFriendForm = ({ friend, handleClose }) => {
    if (!friend) return null;
    return (
        <div className="popup">
        <div className="popup-content">
          <h1>Friend Details</h1>
          <p>Name: {friend.first_name} {friend.last_name}</p>
          <p>Email: {friend.email}</p>
          <p>Phone: {friend.phone}</p>
          <p>Twitter: {friend.twitter}</p>
          <button onClick={handleClose}>Back</button>
        </div>
      </div>
    );
};

export default ShowFriendForm;
