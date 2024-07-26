import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Form, FormGroup, Button } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "../styles/payment.css";

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [paymentMethod, setPaymentMethod] = useState("Momo");
  const [amount, setAmount] = useState(0);
  const [booking, setBooking] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    const fetchBookingDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Token is missing. Please log in again.");
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/bookings/${bookingId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const booking = await response.json();
          setBooking(booking);
          const calculatedAmount = booking.price * booking.seats + 10;
          setAmount(calculatedAmount);
        } else {
          alert("Error fetching booking details");
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleCancelPayment();
    } else {
      const timer = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const handleCancelPayment = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token is missing. Please log in again.");
      return;
    }

    const cancelData = {
      booking_id: bookingId,
    };

    try {
      const response = await fetch('http://localhost:3000/payments/cancel', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cancelData)
      });

      if (response.ok) {
        navigate("/booking-canceled");
      } else {
        alert("Error canceling payment");
      }
    } catch (error) {
      console.error('Error canceling payment:', error);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token is missing. Please log in again.");
      return;
    }

    const paymentData = {
      booking_id: bookingId,
      payment_method: paymentMethod
    };

    try {
      const response = await fetch('http://localhost:3000/payments/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        navigate("/thank-you");
      } else {
        alert("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  return (
    <Container>
      <Row>
        <Col lg="6" className="m-auto">
          <div className="payment">
            <h2 className="text-center">Payment Details</h2>
            <Form onSubmit={handlePayment}>
              <FormGroup>
                <label htmlFor="amount">Amount</label>
                <input type="number" id="amount" value={amount} readOnly className="form-control" />
              </FormGroup>
              <FormGroup>
                <label htmlFor="paymentMethod">Payment Method</label>
                <select id="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="form-control">
                  <option value="Momo">Momo</option>
                  <option value="VNPay">VNPay</option>
                </select>
              </FormGroup>
              <Button className="btn primary__btn w-100 mt-4" type="submit">
                Pay Now
              </Button>
              <Button className="btn secondary__btn w-100 mt-4" onClick={handleCancelPayment}>
                Cancel Payment
              </Button>
              <div className="timer mt-3 text-center">
                <p>Time left: {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? '0' : ''}{timeLeft % 60} minutes</p>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Payment;
