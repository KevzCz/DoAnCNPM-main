import React, { useState, useEffect } from "react";
import "./booking.css";
import { Form, FormGroup, ListGroup, ListGroupItem, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";

const Booking = ({ tour, avgRating }) => {
  const { price, reviews } = tour;
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    userId: "", // dynamic
    userEmail: "",
    fullName: "",
    phone: "",
    guestSize: 1,
    bookAt: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.phone_number) {
        try {
          const response = await fetch(`http://localhost:3000/user/profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await response.json();
          setCredentials(prev => ({
            ...prev,
            userId: data.user_id,
            userEmail: data.phone_number,
            fullName: data.name,
            phone: data.phone_number,
          }));
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const serviceFee = 10;
  const totalAmount = Number(price) * Number(credentials.guestSize) + Number(serviceFee);

  const handleClick = (e) => {
    e.preventDefault();
    // Send booking data to server
    navigate("/thank-you");
  };

  return (
    <div className="booking">
      <div className="booking__top d-flex align-items-center justify-content-between">
        <h3>${price} <span>/per person</span></h3>
        <span className="tour__rating d-flex align-items-center gap-1">
          <i className="ri-star-fill"></i>
          {avgRating === 0 ? null : avgRating} ({reviews?.length})
        </span>
      </div>
      {/* booking form start */}
      <div className="booking__form">
        <h5>Information</h5>
        <Form className="booking__info-form" onSubmit={handleClick}>
          <FormGroup>
            <input
              type="text"
              placeholder="Full Name"
              id="fullName"
              required
              value={credentials.fullName}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <input
              type="text"
              placeholder="Phone"
              id="phone"
              required
              value={credentials.phone}
              onChange={handleChange}
              pattern="0[0-9]{9}"
              title="Phone number must start with 0 and be 10 digits long"
            />
          </FormGroup>
          <FormGroup className="d-flex align-items-center gap-3">
            <input
              type="date"
              id="bookAt"
              required
              onChange={handleChange}
            />
            <input
              type="number"
              placeholder="Guest"
              id="guestSize"
              required
              value={credentials.guestSize}
              onChange={handleChange}
            />
          </FormGroup>
        </Form>
      </div>
      {/* booking form end */}
      {/* booking bottom  */}
      <div className="booking__bottom">
        <ListGroup>
          <ListGroupItem className="border-0 px-0">
            <h5 className="d-flex align-items-center gap-1">
              ${price}
              <i className="ri-close-line"></i> 1 person
            </h5>
            <span> ${price}</span>
          </ListGroupItem>
          <ListGroupItem className="border-0 px-0">
            <h5>Service charge</h5>
            <span> ${serviceFee}</span>
          </ListGroupItem>
          <ListGroupItem className="border-0 px-0 total">
            <h5>Total</h5>
            <span> ${totalAmount}</span>
          </ListGroupItem>
        </ListGroup>
        <Button className="btn primary__btn w-100 mt-4" onClick={handleClick}>
          Book Now
        </Button>
      </div>
    </div>
  );
};

export default Booking;
