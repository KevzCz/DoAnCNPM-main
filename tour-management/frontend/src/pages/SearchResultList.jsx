import React, { useEffect, useState } from "react";
import { Col, Row, Card, CardBody } from "reactstrap";
import { Link, useLocation } from "react-router-dom";
import "../styles/SearchResultList.css"; // Import the new CSS file

const SearchResultList = () => {
  const [results, setResults] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams(location.search);
      const locationParam = params.get('location');
      const priceParam = params.get('price');
      const maxGroupSizeParam = params.get('maxGroupSize');

      console.log('Fetching tours with params:', { locationParam, priceParam, maxGroupSizeParam });

      try {
        const response = await fetch(`http://localhost:3000/tours?location=${locationParam}&price=${priceParam}&maxGroupSize=${maxGroupSizeParam}`);
        const data = await response.json();

        console.log('Fetched data:', data);

        setResults(data.tours);
      } catch (error) {
        console.error("Error fetching tours:", error);
      }
    };

    fetchData();
  }, [location.search]);

  const TourCard = ({ tour }) => {
    const { tour_id, name, image_url, price, max_seats, avg_rating, reviews = [], status, itinerary = [] } = tour;
    const defaultImage = "https://img.freepik.com/free-photo/painting-mountain-lake-with-mountain-background_188544-9126.jpg";

    return (
      <div className="tour-card">
        <Card>
          <div className="tour-img">
            <img 
              src={image_url || defaultImage} 
              alt={name} 
              onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }} 
            />
            {max_seats > 0 && <span>Featured</span>}
          </div>
          <CardBody>
            <div className="card-top d-flex align-items-center justify-content-between">
              <span className="tour-location d-flex align-items-center gap-1">
                <i className="ri-map-pin-line"></i> {tour.location || "N/A"}
              </span>
              <span className="tour-rating d-flex align-items-center gap-1">
                <i className="ri-star-fill"></i> {Math.floor(avg_rating || 0)}
                {reviews.length > 0 && <span>({reviews.length})</span>}
              </span>
            </div>
            <h5 className="tour-title">
              <Link to={`/tours/${tour_id}`}>{name}</Link>
            </h5>
            <div className="card-bottom d-flex align-items-center justify-content-between mt-3">
              <h5>
                $<Link to={`/tours/${tour_id}`}>{Math.floor(price)}</Link> <span> /per person</span>
              </h5>
              <div className="d-flex flex-column align-items-center">
                <button className="btn booking-btn">
                  <Link to={`/tours/${tour_id}`}>Book Now</Link>
                </button>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-between mt-2">
              <span>Status: {status}</span>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  return (
    <section className="search-results-container">
      <Row className="search-results-row">
        {results.length > 0 ? (
          results.map((tour) => (
            <Col lg="3" className="search-results-col" key={tour.tour_id}>
              <TourCard tour={tour} />
            </Col>
          ))
        ) : (
          <Col lg="12">
            <h5 className="no-results-message">No tours found</h5>
          </Col>
        )}
      </Row>
    </section>
  );
};

export default SearchResultList;
