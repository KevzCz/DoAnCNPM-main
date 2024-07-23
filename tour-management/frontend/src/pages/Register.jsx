import React, { useState } from "react";
import { Container, Row, Col, Form, FormGroup, Button } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import registerImg from "../assets/images/register.png";
import userIcon from "../assets/images/user.png";
import "../styles/login.css";

const Register = () => {
  const [credentials, setCredentials] = useState({
    phone_number: '',
    name: '',
    gender: '',
    birth_date: '',
    password: '',
    rePassword: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const calculateAge = (birthday) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleClick = async (e) => {
    e.preventDefault();
    if (credentials.password !== credentials.rePassword) {
      alert('Passwords do not match!');
      return;
    }
    if (calculateAge(credentials.birth_date) < 18) {
      alert('You must be at least 18 years old to register.');
      return;
    }
    console.log('Phone Number:', credentials.phone_number);  // Log phone number
    console.log('Password:', credentials.password);  // Log password
    try {
      const res = await axios.post('http://localhost:3000/register', credentials);
      alert('Registration successful!');
      navigate('/login');
    } catch (err) {
      alert('Registration failed: ' + err.response.data);
    }
  };

  return (
    <section>
      <Container>
        <Row>
          <Col lg="8" className="m-auto">
            <div className="login__container d-flex justify-content-between">
              <div className="login__img">
                <img src={registerImg} alt="" />
              </div>
              <div className="login__form">
                <div className="user">
                  <img src={userIcon} alt="" />
                </div>
                <h2>Register</h2>
                <Form onSubmit={handleClick}>
                  <FormGroup>
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      id="name"
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <input
                      type="text"
                      placeholder="Phone Number"
                      required
                      id="phone_number"
                      pattern="^0[0-9]{9}$"
                      title="Phone number should be in the format 0937195324"
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <select
                      required
                      id="gender"
                      onChange={handleChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </FormGroup>
                  <FormGroup>
                    <input
                      type="date"
                      placeholder="Birthday"
                      required
                      id="birth_date"
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <input
                      type="password"
                      placeholder="Password"
                      required
                      id="password"
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <input
                      type="password"
                      placeholder="Re-enter Password"
                      required
                      id="rePassword"
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <Button className="btn secondary__btn auth__btn" type="submit">
                    Create Account
                  </Button>
                </Form>
                <p>
                  Already have an account? <Link to="/login">Login</Link>
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Register;
