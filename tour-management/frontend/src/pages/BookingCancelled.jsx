import React from "react";
import { Container, Row, Col, Button } from "reactstrap";
import { Link } from "react-router-dom";
import "../styles/booking-cancelled.css"; // Make sure this path is correct

const BookingCancelled = () => {
  return (
    <section>
      <Container>
        <Row>
          <Col lg="12" className="pt-5 text-center">
            <div className="cancelled__message">
              <span>
                <i class="ri-close-circle-line"></i>
              </span>
              <h1 className="mb-3 fw-fw-semibold">No Problem</h1>
              <h3 className="mb-4">your payment has been cancelled</h3>
              <Button className="btn primary__btn w-25">
                <Link to="/home">Back to Home</Link>
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default BookingCancelled;
