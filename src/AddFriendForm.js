import React, { useState } from 'react';
import axios from 'axios';

const AddFriendForm = ({ onAddFriend,handleClose }) => {
  const [newFriend, setNewFriend] = useState({
    first_name: '',
    last_name: '',
    email: '',
    twitter: '',
    phone: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFriend((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAddFriend = async () => {
    console.log(sessionStorage.getItem('user_id'), "pavan")
    try {
      const userId = sessionStorage.getItem('user_id');
      let friend = {
        ...newFriend,
        user_id: userId
      }
      const response = await axios.post('http://localhost:3000/api/v1/friends', {friend}
    //   , {
    //     headers: {
    //       // Include the Authorization header if required
    //       Authorization: `Bearer ${localStorage.getItem('token')}`,
    //     },}
    );
      if (response.data.success) {
        onAddFriend(response.data.friend);
        setNewFriend({
          first_name: '',
          last_name: '',
          email: '',
          twitter: '',
          phone: ''
        });
      }
    } catch (error) {
      console.error('Failed to add friend:', error);
    }
  };

  return (
    <div className="add-friend-form">
      <h3>Add New Friend</h3>
      <input
        type="text"
        name="first_name"
        value={newFriend.first_name}
        onChange={handleInputChange}
        placeholder="First Name"
      />
      <input
        type="text"
        name="last_name"
        value={newFriend.last_name}
        onChange={handleInputChange}
        placeholder="Last Name"
      />
      <input
        type="email"
        name="email"
        value={newFriend.email}
        onChange={handleInputChange}
        placeholder="Email"
      />
      <input
        type="text"
        name="twitter"
        value={newFriend.twitter}
        onChange={handleInputChange}
        placeholder="Twitter"
      />
      <input
        type="text"
        name="phone"
        value={newFriend.phone}
        onChange={handleInputChange}
        placeholder="Phone"
      />
      <button onClick={handleAddFriend}>Add Friend</button>
      <button onClick={handleClose}>Close</button>
    </div>
  );
};

export default AddFriendForm;
