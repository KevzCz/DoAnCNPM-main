import React, { useState, useContext } from 'react';
import { Container, Row, Col, Form, FormGroup, Button } from 'reactstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import loginImg from '../assets/images/login.png';
import userIcon from '../assets/images/user.png';
import AuthContext from '../context/AuthContext';
import '../styles/login.css';

const Login = () => {
    const [credentials, setCredentials] = useState({ phone_number: '', password: '' });
    const [errorMessages, setErrorMessages] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.id]: e.target.value });
        setErrorMessages(''); // Reset error messages on input change
    };

    const handleClick = async (e) => {
        e.preventDefault();
        try {
            console.log('Login attempt with credentials:', credentials);  // Log the credentials being sent
            const res = await axios.post('http://localhost:3000/login', credentials);
            login(res.data.token, res.data.user);
            if (res.data.user.role === 'NVQL_CT') {
                navigate('/admin');
            } else {
                navigate('/home');
            }
        } catch (err) {
            setErrorMessages('Incorrect phone number or password.');
            console.error('Login error:', err.response.data);  // Log the error response
        }
    };

    return (
        <section>
            <Container>
                <Row>
                    <Col lg="8" className="m-auto">
                        <div className="login__container d-flex justify-content-between">
                            <div className="login__img">
                                <img src={loginImg} alt="" />
                            </div>
                            <div className="login__form">
                                <div className="user">
                                    <img src={userIcon} alt="" />
                                </div>
                                <h2>Login</h2>
                                <Form onSubmit={handleClick}>
                                    <FormGroup>
                                        <input
                                            type="text"
                                            placeholder="Phone Number"
                                            required
                                            id="phone_number"
                                            pattern="^0[0-9]{9}$"
                                            title="Phone number should be in the format 0937195324"
                                            onChange={handleChange}
                                            value={credentials.phone_number}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            required
                                            id="password"
                                            onChange={handleChange}
                                            value={credentials.password}
                                        />
                                    </FormGroup>
                                    {errorMessages && (
                                        <div className="error-message">{errorMessages}</div>
                                    )}
                                    <Button className="btn secondary__btn auth__btn" type="submit">
                                        Login
                                    </Button>
                                </Form>
                                <p>Don't have an account? <Link to="/register">Create</Link></p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Login;
