import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditFriendForm.css'

const EditFriendForm = ({ friend, handleClose, handleUpdate }) => {
  const [formData, setFormData] = useState(friend);

  useEffect(() => {
    setFormData(friend);
  }, [friend]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const Field = ({ label, id, ...rest }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} {...rest} />
    </div>
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:3000/api/v1/friends/${friend.id}`, formData)
      .then(response => {
        handleUpdate(response.data);
        handleClose();
      })
      .catch(error => console.error('Error updating friend:', error));
  };

  if (!friend) return null;

  return (
    <div className="popup">
      <div className="popup-content">
        <h1>Edit Friend</h1>
        <form onSubmit={handleSubmit}>
          <label>
            First Name:
            <input
              type="text"
              name="first_name"
              value={formData.first_name || ''}
              onChange={handleChange}
              required
            />
          </label>
          <Field type="text" label="First Name" name="first_name" value={formData.first_name || ''} onChange={handleChange} required/>
          <label>
            Last Name:
            <input
              type="text"
              name="last_name"
              value={formData.last_name || ''}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Phone:
            <input
              type="text"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Twitter:
            <input
              type="text"
              name="twitter"
              value={formData.twitter || ''}
              onChange={handleChange}
            />
          </label>
          <button type="submit">Update</button>
          <button type="button" onClick={handleClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default EditFriendForm;
