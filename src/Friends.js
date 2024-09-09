import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Plugin for tables in jsPDF
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './FriendList.css'; // Import your CSS for styling
import ShowFriendForm from './ShowFriendForm';
import EditFriendForm from './EditFriendForm';

function FriendList() {
  const [friends, setFriends] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [friendToDelete, setFriendToDelete] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showFriend, setShowFriend] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [twitterError, setTwitterError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [largeImageUrl, setLargeImageUrl] = useState(null);
  const [showLargeImage, setShowLargeImage] = useState(false);
  const [newFriend, setNewFriend] = useState({
    first_name: '',
    last_name: '',
    email: '',
    twitter: '',
    phone: ''
  });
  const friendsPerPage = 5;

  const navigate = useNavigate(); // Initialize useNavigate

  const fetchFriends = async (page = 1) => {
    try {
      let user_id = sessionStorage.getItem('user_id');
      const response = await axios.get(`http://localhost:3000/api/v1/friends?user_id=${user_id}&page=${page}`, {
        withCredentials: true, // Ensures cookies are sent
      });
      setFriends(response.data.friends);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.total_pages);
      console.log('Fetched friends:', response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  useEffect(() => {


    fetchFriends(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {

    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEdit = (friendId) => {
    axios.get(`http://localhost:3000/api/v1/friends/${friendId}`)
      .then(response => {
        setSelectedFriend(response.data);
        setShowEdit(true);
      })
      .catch(error => console.error(error));
  };

  const handleShow = (friendId) => {
    axios.get(`http://localhost:3000/api/v1/friends/${friendId}`)
      .then(response => {
        setSelectedFriend(response.data);
        setShowFriend(true);
      })
      .catch(error => console.error(error));
  };

  const handleUpdate = (updatedFriend) => {
    setFriends((prevFriends) =>
      prevFriends.map((friend) => (friend.id === updatedFriend.id ? updatedFriend : friend))
    );
    setShowEdit(false);
  };

  const handleImageClick = (url) => {
    setLargeImageUrl(url);
    setShowLargeImage(true);
  };

  const handleCloseLargeImage = () => {
    setShowLargeImage(false);
    setLargeImageUrl(null);
  };



  const handleDelete = async () => {
    try {
      // Check if the friend exists before attempting to delete
      const friendExists = friends.some(friend => friend.id === friendToDelete);
      if (!friendExists) {
        console.error('Friend does not exist.');
        setShowPopup(false);
        setFriendToDelete(null);
        return;
      }

      // Proceed with deletion if the friend exists
      await axios.delete(`http://localhost:3000/api/v1/friends/${friendToDelete}`);

      // Remove the friend from the current state
      const updatedFriends = friends.filter(friend => friend.id !== friendToDelete);

      // Determine if we need to fetch friends from the previous page
      if (updatedFriends.length === 0 && currentPage > 1) {
        // Go to the previous page if the current page becomes empty after deletion
        setCurrentPage(currentPage - 1);
      } else {
        // Otherwise, update the friends list in the current state
        setFriends(updatedFriends);
      }

      setShowPopup(false);
      setFriendToDelete(null);
    } catch (error) {
      console.error('Failed to delete friend:', error.response ? error.response.data : error.message);
    }
  };



  const confirmDelete = (id) => {
    setShowPopup(true);
    setFriendToDelete(id);
  };

  const validateEmail = (email) => {
    // Regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    // Allow only digits and require between 7 to 15 digits
    const phoneRegex = /^[0-9]{7,15}$/;
    return phoneRegex.test(phone);
  };

  const validateTwitterHandle = (handle) => {
    // Regular expression to validate Twitter handles (1-15 characters, no spaces or special characters except _)
    const twitterRegex = /^@?(\w){1,15}$/;
    return twitterRegex.test(handle);
  };

  const checkTwitterHandleExists = async (handle) => {
    const formattedHandle = handle.startsWith('@') ? handle.substring(1) : handle;

    try {
      // Example endpoint. Replace with the actual API call to check the existence of a Twitter handle.
      const response = await axios.get(`https://api.twitter.com/2/users/by/username/${formattedHandle}`, {
        headers: {
          Authorization: `Bearer YOUR_TWITTER_API_TOKEN` // Use your Twitter API Bearer Token here
        }
      });

      // If user is found, return true
      return response.status === 200;
    } catch (error) {
      console.error('Failed to verify Twitter handle:', error);
      return false; // Return false if there's an error or the user is not found
    }
  };


  const handleAddFriend = async () => {

    // Validation logic
    if (!validateEmail(newFriend.email)) {
      setEmailError('Please enter a valid email address.');
      return;
    } else {
      setEmailError('');
    }


    if (!newFriend.phone) {

      setPhoneError('Phone number is required.');
      return;
    } else if (!validatePhoneNumber(newFriend.phone)) {

      setPhoneError('Please enter a valid phone number with 7 to 15 digits.');
      return;
    } else {
      setPhoneError('');
    }

    // Check if the Twitter handle is valid
    if (!validateTwitterHandle(newFriend.twitter)) {
      setTwitterError('Please enter a valid Twitter handle (e.g., @username).');
      return;
    } else {
      setTwitterError('');
    }

    try {

      const userId = sessionStorage.getItem('user_id');
      const response = await axios.post('http://localhost:3000/api/v1/friends', {
        ...newFriend,
        user_id: userId
      });

      if (response.data.success) {
        console.log("Friend added successfully:", response.data.friend);

        // Update friends list in state
        setFriends(prevFriends => {
          const updatedFriends = [...prevFriends, response.data.friend];
          const totalFriends = updatedFriends.length;
          const newTotalPages = Math.ceil(totalFriends / friendsPerPage);

          // Update pagination state
          if (currentPage === newTotalPages || (totalFriends % friendsPerPage === 1 && totalFriends > friendsPerPage)) {
            setCurrentPage(newTotalPages);
          }

          return updatedFriends;
        });

        // Adjust pagination if needed
        const totalFriends = friends.length + 1;
        const newTotalPages = Math.ceil(totalFriends / friendsPerPage);
        if (currentPage === newTotalPages || (totalFriends % friendsPerPage === 1 && totalFriends > friendsPerPage)) {
          setCurrentPage(newTotalPages);
        }

        setNewFriend({
          first_name: '',
          last_name: '',
          email: '',
          twitter: '',
          phone: ''
        });
        setShowForm(false);

        navigate('/friends'); // Redirect to friend list page

      }
    } catch (error) {
      console.error('Failed to add friend:', error);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFriend((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleClose = () => {
    setShowForm(false);
    setShowFriend(false);
    setShowEdit(false);
  };

  // Function to export friends data to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(friends);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Friends');
    XLSX.writeFile(workbook, 'FriendsList.xlsx');
  };

  // Function to export friends data to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Friends List', 14, 16);
    doc.autoTable({
      startY: 20,
      head: [['Name', 'Email', 'Phone', 'Twitter']],
      body: friends.map(friend => [
        `${friend.first_name} ${friend.last_name}`,
        friend.email,
        friend.phone,
        friend.twitter
      ]),
    });
    doc.save('FriendsList.pdf');
  };

  const handleUpload = async (event, friendId) => {
    const file = event.target.files[0];
    if (!file) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await axios.post(`http://localhost:3000/api/v1/friends/${friendId}/upload_photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        // Reload friends to update UI with new photo
        fetchFriends();
      } else {
        console.error('Error uploading photo:', response.data);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };


  return (
    <div className="friend-list-container">
      <div className="top-section">

        {!showForm && (
          <button className="add-friend-btn" onClick={() => setShowForm(true)}>
            Add New Friend
          </button>
        )}
        {/* Conditionally render the download buttons */}
        {friends.length > 0 && !showForm && (
          <div className="button-container">
            <button className="action-btn-excel" onClick={exportToExcel}>Download Excel</button>
            <button className="action-btn-pdf" onClick={exportToPDF}>Download PDF</button>
          </div>
        )}
      </div>

      {showForm ? (
        <div className="add-friend-section">
          <button onClick={handleClose} className="back-button">Back</button>
          <div className="add-friend-fields">
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
            {emailError && <p style={{ color: 'red' }}>{emailError}</p>}
            <input
              type="text"
              name="twitter"
              value={newFriend.twitter}
              onChange={handleInputChange}
              placeholder="Twitter"
            />
            {twitterError && <p style={{ color: 'red' }}>{twitterError}</p>}
            <input
              type="text"
              name="phone"
              value={newFriend.phone}
              onChange={handleInputChange}
              placeholder="Phone"
            />
            {phoneError && <p style={{ color: 'red' }}>{phoneError}</p>}
            <button onClick={handleAddFriend}>Add Friend</button>
          </div>
        </div>
      ) : (
        <>
          {friends.length > 0 ? (

            <div className="table-wrapper">
              <h1>Friends List</h1>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Whatsapp</th>
                    <th>Twitter</th>
                  </tr>
                </thead>
                <tbody>
                  {friends.map((friend) => (
                    <tr key={friend?.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>

                          {friend.photo_url ? (
                            <img
                              src={friend.photo_url}
                              alt={`${friend?.first_name || ''} ${friend?.last_name || ''}`}
                              width="50"
                              height="50"
                              style={{ borderRadius: '50%', marginRight: '10px', cursor: 'pointer' }}
                              onClick={() => handleImageClick(friend.photo_url)}
                            />
                          ) : (
                            <div
                              style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                backgroundColor: '#ccc',
                                marginRight: '10px',
                              }}
                            />
                          )}
                          <span>{`${friend?.first_name || ''} ${friend?.last_name || ''}`}</span>
                        </div>
                      </td>

                      <td>
                        <a href={`mailto:${friend?.email}`} target="_blank" rel="noopener noreferrer">
                          {friend?.email || ''}
                        </a>
                      </td>
                      <td>
                        <a
                          href={`https://api.whatsapp.com/send?phone=${friend?.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {friend?.phone || ''}
                        </a>
                      </td>
                      <td>
                        <a href={`https://twitter.com/${friend?.twitter}`} target="_blank" rel="noopener noreferrer">
                          {friend?.twitter || ''}
                        </a>
                      </td>
                      <td>
                        <button className="action-btn" onClick={() => handleShow(friend.id)}>Show</button>
                        <button className="action-btn" onClick={() => handleEdit(friend.id)}>Edit</button>
                        <button className="action-btn delete-btn" onClick={() => confirmDelete(friend.id)}>Destroy</button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => handleUpload(event, friend.id)}
                          style={{ display: 'none' }}
                          id={`file-upload-${friend.id}`}
                        />
                        <button
                          onClick={() => document.getElementById(`file-upload-${friend.id}`).click()}
                          className="upload-button"
                          style={{
                            marginLeft: '10px',
                            padding: '5px 15px',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                          }}
                        >
                          Upload Photo
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Conditionally render pagination */}
              <div className="pagination">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                  Next
                </button>
              </div>
            </div>
          ) : (
            <p>There are no friends to show. If you want to add, click the 'Add New Friend' button.</p>
          )}
        </>
      )}

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <p>Are you sure you want to delete this friend?</p>
            <button className="action-btn delete-btn" onClick={handleDelete}>Yes</button>
            <button className="action-btn" onClick={() => setShowPopup(false)}>No</button>
          </div>
        </div>
      )}
      {showFriend && selectedFriend && (
        <ShowFriendForm friend={selectedFriend} handleClose={handleClose} />
      )}
      {showEdit && selectedFriend && (
        <EditFriendForm friend={selectedFriend} handleClose={handleClose} handleUpdate={handleUpdate} />
      )}

      {showLargeImage && (
        <div className="large-image-overlay">
          <div className="large-image-container">
            <img src={largeImageUrl} alt="Large view" />
            <button className="close-button" onClick={handleCloseLargeImage}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FriendList;
