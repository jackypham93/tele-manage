import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'bootstrap-4-react';
import axios from 'axios';
const host = 'http://localhost:3001'

const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate();

  // Handler for username change
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  // Handler for password change
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = async () => {
    try {
      let res = await axios.post(`${host}/api/login`, {
        username: username,
        password: password
      })
      localStorage.setItem('TOKEN', res.data.token)
      localStorage.setItem('RIGHT', res.data.right)
      navigate('/dashboard');
    } catch (error) {
      navigate('/');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Login</h2>
      <Form>
        <Form.Group>
          <label htmlFor="inputEmail">Email address</label>
          <Form.Input style={{width: '50%'}} type="email" id="inputEmail" placeholder="Enter email" onChange={handleUsernameChange} />
        </Form.Group>
        <Form.Group>
          <label htmlFor="inputPassword">Password</label>
          <Form.Input style={{width: '50%'}} type="password" id="inputPassword" placeholder="Password" onChange={handlePasswordChange} />
        </Form.Group>
        <Button primary type="button" onClick={() => {
          handleLogin()
        }}>Submit</Button>
      </Form>
    </div>
  );
};

export default Login;
