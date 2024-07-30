import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Form, FormGroup, ListGroup, ListGroupItem, Button } from "reactstrap";
import { useParams, useNavigate } from "react-router-dom";
import avatar from "../assets/images/avatar.jpg";
import Newletters from "./../shared/Newletters";
import AuthContext from "../context/AuthContext";
import "../styles/tour-details.css";

const Booking = ({ tour, avgRating }) => {
  const { price, reviews, status } = tour;
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [fullname, setFullName] = useState("");
  const [credentials, setCredentials] = useState({
    userId: "",
    fullName: "",
    phone: "",
    guestSize: 0, // Default to 0 meaning only the user
    bookAt: "",
    passengers: []
  });

  useEffect(() => {
    if (user) {
      setCredentials((prev) => ({
        ...prev,
        userId: user.user_id,
        fullName: user.name,
        phone: user.phone_number,
        birth_date: user.birth_date,
        gender: user.gender,
      }));
    }
  }, [user]);

  const fetchUserDetails = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setCredentials((prev) => ({
        ...prev,
        fullName: data.name,
        birth_date: data.birth_date,
        gender: data.gender
      }));
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleGuestChange = (e) => {
    const guestSize = parseInt(e.target.value, 10);
    const passengers = guestSize > 0 ? [...Array(guestSize)].map((_, index) => ({
      name: "",
      birth_date: "",
      gender: "Nam"
    })) : [];
    setCredentials((prev) => ({ ...prev, guestSize, passengers }));
  };

  const handlePassengerChange = (index, e) => {
    const updatedPassengers = [...credentials.passengers];
    updatedPassengers[index][e.target.id] = e.target.value;
    setCredentials((prev) => ({ ...prev, passengers: updatedPassengers }));
  };

  const serviceFee = 10;
  const totalAmount = Math.floor(Number(price) * (Number(credentials.guestSize) + 1) + Number(serviceFee));

  const handleClick = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token is missing. Please log in again.");
      return;
    }
  
    if (!credentials.bookAt) {
      alert("Booking date cannot be null.");
      return;
    }
    
    const bookingData = {
      tour_id: tour.tour_id,
      bookAt: credentials.bookAt,
      guestSize: credentials.guestSize,
      passengers: credentials.passengers,
    };
  
    fetch('http://localhost:3000/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.booking_id) {
        // Insert payment after successful booking
        const paymentData = {
          booking_id: data.booking_id,
          payment_method: "Momo", // You can change this to whatever method you want
        };
  
        fetch('http://localhost:3000/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(paymentData)
        })
        .then(response => response.json())
        .then(paymentResponse => {
          if (paymentResponse.status === 'Chờ thanh toán') {
            navigate(`/payment/${data.booking_id}`);
          } else {
            alert("Payment failed. Please try again.");
          }
        })
        .catch(error => console.error('Error:', error));
      } else {
        alert("Booking failed. Please try again.");
      }
    })
    .catch(error => console.error('Error:', error));
  };
  

  return (
    <div className="booking">
      <div className="booking__top d-flex align-items-center justify-content-between">
        <h3>
          ${Math.floor(price)} <span>/per person</span>
        </h3>
        <span className="tour__rating d-flex align-items-center gap-1">
          <i className="ri-star-fill"></i>
          {avgRating === 0 ? null : avgRating} ({reviews?.length})
        </span>
      </div>
      <div className="booking__form">
        <h5>Information</h5>
        <Form className="booking__info-form" onSubmit={handleClick}>
          <FormGroup>
            <input type="text" placeholder="Full Name" id="fullName" required value={credentials.fullName} readOnly />
          </FormGroup>
          <FormGroup>
            <input type="text" placeholder="Phone" id="phone" required value={credentials.phone} readOnly />
          </FormGroup>
          <FormGroup className="d-flex align-items-center gap-3">
            <input type="date" id="bookAt" required onChange={handleChange} />
            <input type="number" placeholder="Guest" id="guestSize" min="0" required onChange={handleGuestChange} />
          </FormGroup>
          {credentials.guestSize > 0 && credentials.passengers.map((passenger, index) => (
            <div key={index}>
              <h6>Passenger {index + 1}</h6>
              <FormGroup>
                <input type="text" placeholder="Name" id="name" required value={passenger.name} onChange={(e) => handlePassengerChange(index, e)} />
              </FormGroup>
              <FormGroup>
                <input type="date" placeholder="Birth Date" id="birth_date" required value={passenger.birth_date} onChange={(e) => handlePassengerChange(index, e)} />
              </FormGroup>
              <FormGroup>
                <select id="gender" required value={passenger.gender} onChange={(e) => handlePassengerChange(index, e)}>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </FormGroup>
            </div>
          ))}
        </Form>
      </div>
      <div className="booking__bottom">
        <ListGroup>
          <ListGroupItem className="border-0 px-0">
            <h5 className="d-flex align-items-center gap-1">
              ${Math.floor(price)}
              <i className="ri-close-line"></i> {credentials.guestSize + 1} person{credentials.guestSize + 1 > 1 ? 's' : ''}
            </h5>
            <span> ${Math.floor(price) * (credentials.guestSize + 1)}</span>
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
        <Button 
          className="btn primary__btn w-100 mt-4" 
          type="submit" 
          onClick={handleClick} 
          disabled={status === 'Hết chỗ'}
        >
          Book Now
        </Button>
      </div>
    </div>
  );
};


const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [tourRating, setTourRating] = useState(null);
  const [buttonText, setButtonText] = useState("Submit");
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    name: '',
    gender: '',
    birth_date: '',
    role: '',
    phone_number: ''
  });
  const defaultImage = "https://img.freepik.com/free-photo/painting-mountain-lake-with-mountain-background_188544-9126.jpg";
  useEffect(() => {
    const token = localStorage.getItem("token");

    // Fetch tour details
    fetch(`http://localhost:3000/tours/${id}`)
      .then(response => response.json())
      .then(data => setTour(data));

    // Fetch user profile data
    fetch(`/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setUser(data);
      });
  }, [id]);

  const submitHandler = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to submit a review.");
      return;
    }
    const review = {
      user_id: user.user_id,
      tour_id: id,
      rating: tourRating,
      review_date: new Date().toISOString().split('T')[0]
    };

    try {
      const response = await fetch(`http://localhost:3000/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(review)
      });

      if (response.ok) {
        const newReview = await response.json();
        updateTourWithNewReview(newReview);
        setTourRating(null);
        setButtonText("Submitted");
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRatingClick = (rating) => {
    setTourRating(rating);
    setButtonText("Submit");
  };

  const updateTourWithNewReview = (newReview) => {
    setTour((prevTour) => {
      const updatedReviews = [...prevTour.reviews, newReview];
      const { totalRating, avgRating } = calculateAvgRating(updatedReviews);
      return {
        ...prevTour,
        reviews: updatedReviews,
        avgRating
      };
    });
  };

  const calculateAvgRating = (reviews) => {
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const avgRating = totalRating / reviews.length;
    return { totalRating, avgRating };
  };

  if (!tour) return <div>Loading...</div>;

  const {
    image_url,
    name,
    description,
    price,
    address,
    reviews,
    start_date,
    end_date,
    max_seats,
    seats_remaining,
    itinerary,
    category,
    location,
    status // Add the status here
  } = tour;

  const { totalRating, avgRating } = calculateAvgRating(reviews);

  const options = { day: "numeric", month: "long", year: "numeric" };

  return (
    <>
      <section>
        <Container>
          <Row>
            <Col lg="8">
              <div className="tour__content">
                <img src={image_url || defaultImage} alt="" />
                <div className="tour__info">
                  <h2>{name}</h2>
                  <div className="d-flex align-items-center gap-5">
                    <span className="tour__rating d-flex align-items-center gap-1">
                      <i className="ri-star-fill" style={{ color: "var(--secondary-color)" }}></i>
                      {avgRating === 0 ? null : avgRating}
                      {totalRating === 0 ? "Not rated" : <span>({reviews.length})</span>}
                    </span>
                    <span>
                      <i className="ri-map-pin-user-fill"></i> {address}
                    </span>
                    <span>
                      <i className="ri-information-line"></i> Status: {status} {/* Display the status */}
                    </span>
                  </div>
                  <div className="tour__extra-details">
                    <span>
                      <i className="ri-calendar-line"></i> Start Date: {new Date(start_date).toLocaleDateString("en-US", options)}
                    </span>
                    <span>
                      <i className="ri-calendar-line"></i> End Date: {new Date(end_date).toLocaleDateString("en-US", options)}
                    </span>
                    <span>
                      <i className="ri-money-dollar-circle-line"></i> {Math.floor(price)} /per person
                    </span>
                    <span>
                      <i className="ri-group-line"></i> Remaining seats: {seats_remaining}
                    </span>
                    <span>
                      <i className="ri-map-pin-fill"></i> Location: {location}
                    </span>
                    <span>
                      <i className="ri-price-tag-3-fill"></i> Category: {category}
                    </span>
                  </div>
                  <h5>Description</h5>
                  <p>{description}</p>
                  <h5>Itinerary</h5>
                  <ul>
                    {itinerary && itinerary.map((item, index) => (
                      <li key={index}>
                        <strong>Day {item.day_number}: </strong> {item.activity_description} (from {item.start_time} to {item.end_time})
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="tour__reviews mt-4">
                  <h4>Reviews({reviews.length} reviews)</h4>
                  <Form onSubmit={submitHandler}>
                    <div className="d-flex align-items-center gap-3 mb-4 rating__group">
                      {[...Array(6)].map((_, index) => (
                        <span 
                          key={index} 
                          onClick={() => handleRatingClick(index)} 
                          className={index <= tourRating ? "filled" : ""}
                        >
                          {index} <i className="ri-star-fill"></i>
                        </span>
                      ))}
                    </div>
                    <Button type="submit" className="btn primary__btn text-white">{buttonText}</Button>
                  </Form>
                </div>
              </div>
            </Col>
            <Col lg="4">
              <Booking tour={tour} avgRating={avgRating} />
            </Col>
          </Row>
        </Container>
      </section>
      <Newletters />
    </>
  );
};

export default TourDetails;
