import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ReactDOM from 'react-dom';
import Landing from './Landing';
import FriendList from './Friends';
import SignIn from './SignIn';
import SignUp from './SignUp';
import SignOut from './SignOut';
import ForgotPassword from './ForgotPassword';
import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

ReactDOM.render(
  <Router>
    <React.StrictMode>
      <Routes>
        <Route path="/" element={<Landing />}>
        <Route index element={<SignIn />} />
          <Route path="SignIn" element={<SignIn />} />
          <Route path="SignUp" element={<SignUp />} />
          <Route path="friends" element={<FriendList />} />
          <Route path="SignOut" element={<SignOut />} /> 
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
      </Routes>
    </React.StrictMode>
  </Router>,
  document.getElementById('root')
);
