import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, FormGroup, Input } from 'reactstrap';
import "../styles/booking-details.css";

const BookingDetails = () => {
  const { bookingId, guestSize } = useParams();
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState(Array.from({ length: guestSize }, () => ({ name: '', birth_date: '', gender: '' })));

  const handleChange = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('jwtToken');
    await fetch('http://localhost:3000/booking-details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ bookingId, passengers })
    });

    navigate('/thank-you');
  };

  return (
    <div className="booking-details">
      <h3>Enter Details for Additional Passengers</h3>
      <Form className="booking-details__form" onSubmit={handleSubmit}>
        {passengers.map((passenger, index) => (
          <div key={index}>
            <FormGroup>
              <Input
                type="text"
                placeholder="Name"
                value={passenger.name}
                onChange={(e) => handleChange(index, 'name', e.target.value)}
                required
              />
            </FormGroup>
            <FormGroup>
              <Input
                type="date"
                placeholder="Birth Date"
                value={passenger.birth_date}
                onChange={(e) => handleChange(index, 'birth_date', e.target.value)}
                required
              />
            </FormGroup>
            <FormGroup>
              <Input
                type="select"
                value={passenger.gender}
                onChange={(e) => handleChange(index, 'gender', e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </Input>
            </FormGroup>
          </div>
        ))}
        <Button type="submit" className="btn primary__btn">
          Submit
        </Button>
      </Form>
    </div>
  );
};

export default BookingDetails;
