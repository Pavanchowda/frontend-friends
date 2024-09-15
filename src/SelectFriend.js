import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form } from 'react-bootstrap';

function SelectFriend({ onSelect }) {
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        // Fetch friends from the API
        const fetchFriends = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/v1/friends', {
                    withCredentials: true,
                });
                setFriends(response.data.friends || []);
            } catch (error) {
                console.error('Error fetching friends:', error);
            }
        };

        fetchFriends();
    }, []);

    return (
        <Form.Group controlId="friendSelect">
            <Form.Label>Select Friend</Form.Label>
            <Form.Control as="select" onChange={(e) => onSelect(e.target.value)}>
                <option value="">Select a friend</option>
                {friends.map((friend) => (
                    <option key={friend.id} value={friend.id}>
                        {friend.first_name} {friend.last_name}
                    </option>
                ))}
            </Form.Control>
        </Form.Group>
    );
}

export default SelectFriend;
