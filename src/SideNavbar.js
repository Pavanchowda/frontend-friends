// components/SideNavbar.js
import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './SideNavbar.css'

function SideNavbar() {
    return (
        <div className="side-navbar">
            <Nav className="flex-column"> {/* Flex-column for vertical stacking */}
                <Nav.Item className="nav-item">
                    <Nav.Link as={Link} to="/friends">Friends List</Nav.Link>
                </Nav.Item>
                <Nav.Item className="nav-item">
                    <Nav.Link as={Link} to="/orders">Orders</Nav.Link>
                </Nav.Item>
            </Nav>
        </div>
    );
}

export default SideNavbar;
