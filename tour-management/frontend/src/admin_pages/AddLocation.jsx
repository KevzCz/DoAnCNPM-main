import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../styles/adminAdd.css";

const AddLocation = () => {
  const [name, setName] = useState('');
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('http://localhost:3000/locations');
        setLocations(response.data.locations);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

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

  return (
    <div className="admin-container-one">
      <h1>Add Location</h1>
      <form onSubmit={createLocation} className="admin-form-one">
        <input 
          type="text" 
          placeholder="Location Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <button type="submit" className="create-tour-button-one">Add Location</button>
        <button type="button" className="create-tour-button-one" onClick={() => navigate('/admin')}>Back to Admin Panel</button>
      </form>
      <div className="location-list-one">
        <h2>Available Locations</h2>
        <ul className="location-items-one">
          {locations.map((location) => (
            <li key={location.location_id} onClick={() => navigate(`/update-location/${location.location_id}`)}>
              {location.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AddLocation;
