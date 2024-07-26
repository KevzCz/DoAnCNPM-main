import React, { useState, useEffect } from "react";
import CommonSection from "../shared/CommonSection";
import Newletters from "../shared/Newletters";
import SearchBar from "../shared/SearchBar";
import { Col, Container, Row, Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";
import "../styles/tour.css";

const Tour = () => {
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(0);
  const [tours, setTours] = useState([]);
  const [totalTours, setTotalTours] = useState(0);

  useEffect(() => {
    fetch(`http://localhost:3000/tours?page=${page + 1}&limit=8`)
      .then(response => response.json())
      .then(data => {
        setTours(data.tours);
        setTotalTours(data.total);
        const pages = Math.ceil(data.total / 8);
        setPageCount(pages);
      });
  }, [page]);

  const TourCard = ({ tour }) => {
    const { tour_id, name, image_url, price, max_seats, avg_rating, reviews = [] } = tour;
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
                <i className="ri-map-pin-line"></i> {tour.location}
              </span>
              <span className="tour__rating d-flex align-items-center gap-1">
                <i className="ri-star-fill"></i> {avg_rating || 0}
                {reviews.length > 0 && <span>({reviews.length})</span>}
              </span>
            </div>
            <h5 className="tour__title">
              <Link to={`/tours/${tour_id}`}>{name}</Link>
            </h5>
            <div className="card__bottom d-flex align-items-center justify-content-between mt-3">
              <h5>
                $<Link to={`/tours/${tour_id}`}>{Math.floor(price)}</Link> <span> /per person</span>
              </h5>
              <button className="btn booking__btn">
                <Link to={`/tours/${tour_id}`}>Book Now</Link>
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  return (
    <>
      <CommonSection title={"All Tours"} />
      <section>
        <Container>
          <Row>
            <SearchBar />
          </Row>
        </Container>
      </section>
      <section className="pt-0">
        <Container>
          <Row>
            {tours?.map((tour) => (
              <Col lg="3" className="mb-4" key={tour.tour_id}>
                <TourCard tour={tour} />
              </Col>
            ))}
            <Col lg="12">
              <div className="pagination d-flex align-items-center justify-content-center mt-4 gap-3">
                {[...Array(pageCount).keys()].map((number) => (
                  <span
                    key={number}
                    onClick={() => setPage(number)}
                    className={page === number ? "active__page" : ""}
                  >
                    {number + 1}
                  </span>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      <Newletters />
    </>
  );
};

export default Tour;
