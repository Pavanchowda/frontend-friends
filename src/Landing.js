import React, { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import SideNavbar from './SideNavbar';
import './SideNavbar.css'

import FriendList from './Friends';
import SignIn from './SignIn';
import SignUp from './SignUp';
import SignOut from './SignOut';

function Landing() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Check session storage to update login state on component mount
        const storedIsLoggedIn = sessionStorage.getItem('isAuthenticated') === 'true';
        const storedUserEmail = sessionStorage.getItem('userEmail') || '';

        setIsLoggedIn(storedIsLoggedIn);
        setUserEmail(storedUserEmail);
    }, []);

    const handleLogin = (email) => {
        setIsLoggedIn(true);
        setUserEmail(email);
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('userEmail', email);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserEmail(null);
        sessionStorage.removeItem('isAuthenticated');
        sessionStorage.removeItem('userEmail');
        navigate('/SignIn');
    };

    const linkStyle = {
        padding: '10px',
        borderRadius: '5px',
        display: 'block', // Ensure it displays as a block in the sidebar
        marginBottom: '10px',
        textDecoration: 'none', // Remove underline
    };

    const activeLinkStyle = {
        ...linkStyle,
        backgroundColor: '#007bff', // Active background color
        color: 'white',
        fontWeight: 'bold',
    };

    const inactiveLinkStyle = {
        ...linkStyle,
        backgroundColor: 'transparent', // Inactive background color
        color: '#007bff',
    };

   

    return (
        <div className="landing-container">
          
            <div >
                <Nav
                    background="turquoise"
                    activeKey={location.pathname}
                    style={{ justifyContent: "flex-end", backgroundColor:  '#d3d3d3', color: 'white',boxShadow: 'none'}}
                >
                    <div className="logo-container">
                        <Link to="/"><img src="/images/Friends-logo.png" alt="Friends Logo" className="logo-image" /></Link>
                    </div>
                    {!isLoggedIn ? (
                        <>
                            <Nav.Item>
                                <Nav.Link as={Link} to="/SignIn">Sign In</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link as={Link} to="/SignUp">Sign Up</Nav.Link>
                            </Nav.Item>
                        </>
                    ) : (
                        <>
                            {/* <Nav.Item>
                                <Nav.Link as={Link} to="/Orders">Orders</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link as={Link} to="/friends">Friends List</Nav.Link>
                            </Nav.Item> */}
                            <Nav.Item>
                                <Nav.Link as={Link} to="/SignOut" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Sign Out</Nav.Link>
                            </Nav.Item>
                        </>
                    )}
                </Nav>
                {isLoggedIn && (
                <Nav
                    className="flex-column side-navbar"
                    activeKey={location.pathname}
                    style={{ width: '200px', position: 'fixed',  left: '0', height: '100vh', backgroundColor: '#f8f9fa', padding: '20px' }}
                >
                    <Nav.Item>
                        <Nav.Link as={Link} to="/Orders" style={location.pathname === '/Orders' ? activeLinkStyle : inactiveLinkStyle}>Orders</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link as={Link} to="/friends" style={location.pathname === '/friends' ? activeLinkStyle : inactiveLinkStyle}>Friends List</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link as={Link} to="/invoices" style={location.pathname === '/invoices' ? activeLinkStyle : inactiveLinkStyle}>Invoices</Nav.Link>
                    </Nav.Item>
                </Nav>
            )}

                  <Outlet context={{ isLoggedIn, handleLogin, handleLogout, userEmail, setIsLoggedIn, setUserEmail }} />
               
            </div>
        </div>
    );
}

export default Landing;
