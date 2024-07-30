import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardBody, Col, Row, Container } from 'reactstrap';
import "../styles/admin.css";

const EditTour = () => {
  const { tourId } = useParams();
  const [tour, setTour] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    price: '',
    maxSeats: '',
    imageUrl: '',
    status: 'Không hoạt động',
  });
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTourDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/tours/${tourId}`);
        const tourData = response.data;
        setTour({
          name: tourData.name,
          description: tourData.description,
          startDate: tourData.start_date,
          endDate: tourData.end_date,
          price: tourData.price,
          maxSeats: tourData.max_seats,
          imageUrl: tourData.image_url,
          status: tourData.status,
        });
        setSelectedCategory(tourData.category_id);
        setSelectedLocation(tourData.location_id);
        setSchedules(tourData.itinerary);
      } catch (error) {
        console.error('Error fetching tour details:', error);
      }
    };

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

    const fetchTourCategories = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/tour-categories/${tourId}`);
        setSelectedCategory(response.data.categories[0]?.category_id || '');
      } catch (error) {
        console.error('Error fetching tour categories:', error);
      }
    };

    const fetchTourLocations = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/tour-locations/${tourId}`);
        setSelectedLocation(response.data.locations[0]?.location_id || '');
      } catch (error) {
        console.error('Error fetching tour locations:', error);
      }
    };

    fetchTourDetails();
    fetchCategories();
    fetchLocations();
    fetchTourCategories();
    fetchTourLocations();
  }, [tourId]);

  const updateTour = async (e) => {
    e.preventDefault();
    try {
      const updatedTour = {
        name: tour.name,
        description: tour.description,
        start_date: tour.startDate,
        end_date: tour.endDate,
        price: Math.max(0, tour.price),
        max_seats: Math.max(0, tour.maxSeats),
        image_url: tour.imageUrl,
        status: tour.status,
      };
      await axios.put(`http://localhost:3000/tours/${tourId}`, updatedTour);

      if (selectedCategory) {
        await axios.post('http://localhost:3000/tour-categories', {
          tour_id: tourId,
          category_id: selectedCategory,
        });
      }

      if (selectedLocation) {
        await axios.post('http://localhost:3000/tour-locations', {
          tour_id: tourId,
          location_id: selectedLocation,
        });
      }

      for (const schedule of schedules) {
        if (schedule.itinerary_id) {
          await axios.put(`http://localhost:3000/schedules/${schedule.itinerary_id}`, schedule);
        } else {
          await axios.post('http://localhost:3000/schedules', {
            tour_id: tourId,
            day_number: schedule.day_number,
            activity_description: schedule.activity_description,
            start_time: schedule.start_time,
            end_time: schedule.end_time
          });
        }
      }

      alert('Tour updated successfully');
      navigate('/admin');
    } catch (error) {
      console.error('Error updating tour:', error);
    }
  };

  const handleChange = (e) => {
    setTour({ ...tour, [e.target.name]: e.target.value });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category.category_id);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location.location_id);
  };

  const handleScheduleChange = (index, e) => {
    const updatedSchedules = [...schedules];
    updatedSchedules[index][e.target.name] = e.target.value;
    setSchedules(updatedSchedules);
  };

  const addNewSchedule = () => {
    setSchedules([...schedules, { day_number: '', activity_description: '', start_time: '', end_time: '' }]);
  };

  const removeSchedule = (index) => {
    const updatedSchedules = schedules.filter((_, i) => i !== index);
    setSchedules(updatedSchedules);
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
                <i className="ri-map-pin-line"></i> {location || "N/A"}
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
    name: tour.name,
    image_url: tour.imageUrl,
    price: tour.price,
    max_seats: tour.maxSeats,
    location: selectedLocation,
    status: tour.status,
    itinerary: schedules
  };

  return (
    <Container>
      <Row>
        <Col lg="8">
          <div className="admin-container">
            <h1>Edit Tour</h1>
            <form onSubmit={updateTour} className="admin-form">
              <input
                type="text"
                placeholder="Name"
                name="name"
                value={tour.name}
                onChange={handleChange}
                required
              />
              <textarea
                placeholder="Description"
                name="description"
                value={tour.description}
                onChange={handleChange}
                required
              ></textarea>
              <input
                type="date"
                placeholder="Start Date"
                name="startDate"
                value={tour.startDate}
                onChange={handleChange}
                required
              />
              <input
                type="date"
                placeholder="End Date"
                name="endDate"
                value={tour.endDate}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                placeholder="Price"
                name="price"
                value={tour.price}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                placeholder="Max Seats"
                name="maxSeats"
                value={tour.maxSeats}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                placeholder="Image URL"
                name="imageUrl"
                value={tour.imageUrl}
                onChange={handleChange}
                required
              />
              <select
                name="status"
                value={tour.status}
                onChange={handleChange}
                required
              >
                <option value="Không hoạt động">Không hoạt động</option>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Đã kết thúc">Đã kết thúc</option>
                <option value="Hết chỗ">Hết chỗ</option>
              </select>

              <div className="input-with-dropdown">
                <input
                  type="text"
                  placeholder="Select Category"
                  value={categories.find(category => category.category_id === selectedCategory)?.name || ''}
                  onFocus={() => setShowCategoryDropdown(true)}
                  onBlur={() => setShowCategoryDropdown(false)}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required
                />
                {showCategoryDropdown && (
                  <div className="dropdown" onMouseDown={(e) => e.preventDefault()}>
                    {categories.map((category) => (
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
                  value={locations.find(location => location.location_id === selectedLocation)?.name || ''}
                  onFocus={() => setShowLocationDropdown(true)}
                  onBlur={() => setShowLocationDropdown(false)}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  required
                />
                {showLocationDropdown && (
                  <div className="dropdown" onMouseDown={(e) => e.preventDefault()}>
                    {locations.map((location) => (
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

              <h2>Itinerary</h2>
              <table className="itinerary-table">
                <thead>
                  <tr>
                    <th>Itinerary ID</th>
                    <th>Day Number</th>
                    <th>Activity Description</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule, index) => (
                    <tr key={index}>
                      <td>{schedule.itinerary_id || "New"}</td>
                      <td>
                        <input
                          type="number"
                          placeholder="Day Number"
                          name="day_number"
                          value={schedule.day_number}
                          onChange={(e) => handleScheduleChange(index, e)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Activity Description"
                          name="activity_description"
                          value={schedule.activity_description}
                          onChange={(e) => handleScheduleChange(index, e)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          placeholder="Start Time"
                          name="start_time"
                          value={schedule.start_time}
                          onChange={(e) => handleScheduleChange(index, e)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          placeholder="End Time"
                          name="end_time"
                          value={schedule.end_time}
                          onChange={(e) => handleScheduleChange(index, e)}
                          required
                        />
                      </td>
                      <td>
                        <button type="button" onClick={() => removeSchedule(index)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" onClick={addNewSchedule}>Add New Schedule</button>

              <button type="submit" className="create-tour-button">Update Tour</button>
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

export default EditTour;
