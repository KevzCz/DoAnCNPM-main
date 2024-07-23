import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../styles/admin.css";

const AddLocation = () => {
  const [name, setName] = useState('');
  const [tourId, setTourId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [tours, setTours] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showTourDropdown, setShowTourDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await axios.get('http://localhost:3000/tours');
        setTours(response.data.tours);
      } catch (error) {
        console.error('Error fetching tours:', error);
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

    fetchTours();
    fetchLocations();
  }, []);

  const createLocation = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/locations', { name });
      alert('Location created successfully');
      navigate('/admin');
    } catch (error) {
      console.error('Error creating location:', error);
    }
  };

  const addTourToLocation = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/tour-locations', { tour_id: tourId, location_id: locationId });
      alert('Tour added to location successfully');
      navigate('/admin');
    } catch (error) {
      console.error('Error adding tour to location:', error);
    }
  };

  const handleTourSelect = (tour) => {
    setTourId(tour.tour_id);
  };

  const handleLocationSelect = (location) => {
    setLocationId(location.location_id);
  };

  return (
    <div className="admin-container">
      <h1>Add Location</h1>
      <form onSubmit={createLocation} className="admin-form">
        <input 
          type="text" 
          placeholder="Location Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <button type="submit">Add Location</button>
        <button type="button" onClick={() => navigate('/admin')}>Back to Admin Panel</button>
      </form>

      <h1>Add Tour to Location</h1>
      <form onSubmit={addTourToLocation} className="admin-form">
        <div className="input-with-dropdown">
          <input
            type="text"
            placeholder="Tour ID"
            value={tourId}
            onFocus={() => setShowTourDropdown(true)}
            onBlur={() => setShowTourDropdown(false)}
            onChange={(e) => setTourId(e.target.value)}
            required
          />
          {showTourDropdown && (
            <div className="dropdown" onMouseDown={e => e.preventDefault()}>
              {tours.map(tour => (
                <div
                  key={tour.tour_id}
                  className="dropdown-item"
                  onClick={() => handleTourSelect(tour)}
                >
                  {tour.tour_id} - {tour.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="input-with-dropdown">
          <input
            type="text"
            placeholder="Location ID"
            value={locationId}
            onFocus={() => setShowLocationDropdown(true)}
            onBlur={() => setShowLocationDropdown(false)}
            onChange={(e) => setLocationId(e.target.value)}
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

        <button type="submit">Add Tour to Location</button>
        <button type="button" onClick={() => navigate('/admin')}>Back to Admin Panel</button>
      </form>
    </div>
  );
};

export default AddLocation;
