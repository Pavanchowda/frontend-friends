import React, { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
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

    return (
        <>
            <Nav
                background="turquoise"
                activeKey={location.pathname}
                style={{ justifyContent: "flex-end" }}
            >
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
                        <Nav.Item>
                            <Nav.Link as={Link} to="/friends">Friends List</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={Link} to="/SignOut" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Sign Out</Nav.Link>
                        </Nav.Item>
                    </>
                )}
            </Nav>
            <Outlet context={{ isLoggedIn, handleLogin, handleLogout, userEmail , setIsLoggedIn, setUserEmail}} />
        </>
    );
}

export default Landing;
