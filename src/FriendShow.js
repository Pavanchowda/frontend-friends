// Example in React
import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';

function FriendShow() {
  const [friend, setFriend] = useState(null);
  const { id } = useParams();
  const history = useHistory();

  useEffect(() => {
    axios.get(`/api/v1/friends/${id}`)
      .then(response => setFriend(response.data))
      .catch(error => console.error(error));
  }, [id]);

  const handleBack = () => {
    history.push('/friends');
  };

  if (!friend) return <p>Loading...</p>;

  return (
    <div>
      <h1>Friend Details</h1>
      <p>Name: {friend.name}</p>
      <p>Email: {friend.email}</p>
      <button onClick={handleBack}>Back</button>
    </div>
  );
}

export default FriendShow;
