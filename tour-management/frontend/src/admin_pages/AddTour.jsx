import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../styles/admin.css";
import { Col, Row, Card, CardBody, Container } from "reactstrap";
import { Link } from "react-router-dom";

const AddTour = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [price, setPrice] = useState('');
  const [maxSeats, setMaxSeats] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('Không hoạt động');
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:3000/categories');
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await axios.get('http://localhost:3000/locations');
        setLocations(response.data.locations);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchCategories();
    fetchLocations();
  }, []);

  const createTour = async (e) => {
    e.preventDefault();
    try {
      const newTour = {
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        price: Math.max(0, price),
        max_seats: Math.max(0, maxSeats),
        image_url: imageUrl,
        status,
      };
      const tourResponse = await axios.post('http://localhost:3000/tours', newTour);
      const tourId = tourResponse.data.tour_id;

      // Insert into tour-category table
      if (selectedCategory) {
        await axios.post('http://localhost:3000/tour-categories', {
          tour_id: tourId,
          category_id: selectedCategory,
        });
      }

      // Insert into tour-location table
      if (selectedLocation) {
        await axios.post('http://localhost:3000/tour-locations', {
          tour_id: tourId,
          location_id: selectedLocation,
        });
      }

      alert('Tour created successfully');
      navigate('/admin');
    } catch (error) {
      console.error('Error creating tour:', error);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category.category_id);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location.location_id);
  };

  const TourCard = ({ tour }) => {
    const { name, image_url, price, max_seats, location, status, itinerary = [] } = tour;
    const defaultImage = "https://img.freepik.com/free-photo/painting-mountain-lake-with-mountain-background_188544-9126.jpg";
  
    return (
      <div className="tour__card">
        <Card>
          <div className="tour__img">
            <img 
              src={image_url || defaultImage} 
              alt={name} 
              onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }} 
            />
            {max_seats > 0 && <span>Featured</span>}
          </div>
          <CardBody>
            <div className="card__top d-flex align-items-center justify-content-between">
              <span className="tour__location d-flex align-items-center gap-1">
                <i className="ri-map-pin-line"></i> {locations.find(loc => loc.location_id === location)?.name || "N/A"}
              </span>
              <span className="tour__rating d-flex align-items-center gap-1">
                <i className="ri-star-fill"></i> 0
              </span>
            </div>
            <h5 className="tour__title">
              {name}
            </h5>
            <div className="card__bottom d-flex align-items-center justify-content-between mt-3">
              <h5>
                ${price} <span> /per person</span>
              </h5>
              <button className="btn booking__btn">
                <Link to="#">Book Now</Link>
              </button>
            </div>
            <div className="d-flex align-items-center justify-content-between mt-2">
              <span>Status: {status}</span>
            </div>
            <div className="itinerary">
              <h6>Itinerary:</h6>
              <ul>
                {itinerary.length > 0 ? (
                  itinerary.map((item, index) => (
                    <li key={index}>
                      Day {item.day_number}: {item.activity_description} ({item.start_time} - {item.end_time})
                    </li>
                  ))
                ) : (
                  <li>No itinerary available</li>
                )}
              </ul>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const tourPreview = {
    name,
    image_url: imageUrl,
    price,
    max_seats: maxSeats,
    location: selectedLocation,
    status,
    itinerary: []
  };

  return (
    <Container>
      <Row>
        <Col lg="8">
          <div className="admin-container">
            <h1>Create Tour</h1>
            <form onSubmit={createTour} className="admin-form">
              <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
              <input type="date" placeholder="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              <input type="date" placeholder="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
              <input type="number" placeholder="Max Seats" value={maxSeats} onChange={(e) => setMaxSeats(e.target.value)} required />
              <input type="text" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
              
              <div className="input-with-dropdown">
                <input
                  type="text"
                  placeholder="Select Category"
                  value={selectedCategory}
                  onFocus={() => setShowCategoryDropdown(true)}
                  onBlur={() => setShowCategoryDropdown(false)}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required
                />
                {showCategoryDropdown && (
                  <div className="dropdown" onMouseDown={e => e.preventDefault()}>
                    {categories.map(category => (
                      <div
                        key={category.category_id}
                        className="dropdown-item"
                        onClick={() => handleCategorySelect(category)}
                      >
                        {category.category_id} - {category.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="input-with-dropdown">
                <input
                  type="text"
                  placeholder="Select Location"
                  value={selectedLocation}
                  onFocus={() => setShowLocationDropdown(true)}
                  onBlur={() => setShowLocationDropdown(false)}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  required
                />
                {showLocationDropdown && (
                  <div className="dropdown" onMouseDown={e => e.preventDefault()}>
                    {locations.map(location => (
                      <div
                        key={location.location_id}
                        className="dropdown-item"
                        onClick={() => handleLocationSelect(location)}
                      >
                        {location.location_id} - {location.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="create-tour-button">Create Tour</button>
            </form>
          </div>
        </Col>
        <Col lg="4">
          <h2>Preview</h2>
          <TourCard tour={tourPreview} />
        </Col>
      </Row>
    </Container>
  );
};

export default AddTour;
