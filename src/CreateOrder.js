import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateOrder.css';

function CreateOrder() {

  const navigate = useNavigate();

  const { friendId } = useParams();

  const [order, setOrder] = useState({
    item: '',
    quantity: '',
    price: '',
    friend_id: ''
  });

  const [friends, setFriends] = useState([]);
  const [selectedFriendId, setSelectedFriendId] = useState('');

  useEffect(() => {
    const fetchAllFriends = async () => {
      try {
        let user_id = sessionStorage.getItem('user_id');
        let allFriends = [];
        let page = 1;
        let totalPages = 1;
    
        do {
          const response = await axios.get(`http://localhost:3000/api/v1/friends?user_id=${user_id}&page=${page}`, {
            withCredentials: true,
          });
          allFriends = [...allFriends, ...response.data.friends]; // Append friends from the current page
          totalPages = response.data.total_pages; // Update total pages
          page += 1;
        } while (page <= totalPages);
    
        setFriends(allFriends); // Set all friends at once
        console.log('Fetched all friends:', allFriends);
      } catch (error) {
        console.error('Error fetching all friends:', error);
      }
    };
    fetchAllFriends();
  }, []);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrder((prevOrder) => ({
      ...prevOrder,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("friendId:", friendId);
    console.log("Order data:", order);
    if (!selectedFriendId) {
      alert("Please select a friend.");
      return;
    }

    const formattedOrder = {
      order: {
        order_name: order.item,       // Adjust field names here
        order_date: new Date().toISOString(), // Provide current date and time
        amount: parseFloat(order.price), // Ensure price is a number
        friend_id: selectedFriendId
      }
    };

    try {
      // Ensure you are using backticks for template strings
      const response = await axios.post(
        `http://localhost:3000/api/v1/friends/${selectedFriendId}/orders`, // Correct URL interpolation
        formattedOrder,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data.success, "response.data.success")
      console.log(response.status, "response.status")

      if (response.status === 201) {
        alert("Order has been added");
        navigate('/orders');
        // Optionally navigate or update state
      }
    } catch (error) {
      if (error.response) {
        console.log('Error data:', error.response.data);  // This should provide more details
        console.log('Error status:', error.response.status);
        console.log('Error headers:', error.response.headers);
      } else {
        console.log('Error message:', error.message);
      }
    }
  };

  return (
    <div className="create-order-container">
      <h1>Create Order</h1>
      <form className="create-order-form" onSubmit={handleSubmit}>
        <fieldset className="fieldset">
          <label htmlFor="item">Item</label>
          <div style={{ marginLeft: '50px' }}> 
          <input
            type="text"
            name="item"
            value={order.item}
            onChange={handleChange}
            placeholder="Item"
            required
          />
          </div>
        </fieldset>
        <fieldset className="fieldset">
          <label htmlFor="quantity">Quantity</label>
          <div style={{ marginLeft: '20px' }}> 
          <input
            type="number"
            name="quantity"
            value={order.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            required
          />
          </div>
        </fieldset>
        <fieldset className="fieldset">
          <label htmlFor="price">Price</label>
          <div style={{ marginLeft: '40px' }}> 
          <input
            type="number"
            name="price"
            value={order.price}
            onChange={handleChange}
            placeholder="Price"
            required
          />
          </div>
        </fieldset>
        <fieldset className="fieldset">
          <label htmlFor="friend_id">Friend</label>
          <div style={{ marginLeft: '30px' }}> 
          <select
            name="friend_id"
            value={selectedFriendId}
            onChange={(e) => setSelectedFriendId(e.target.value)}
            required
          >
            <option value="">Select a friend</option>
            {friends.map((friend) => (
              <option key={friend.id} value={friend.id}>
                {`${friend.first_name} ${friend.last_name}`}
              </option>
            ))}
          </select>
          </div>
        </fieldset>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default CreateOrder;
