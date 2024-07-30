import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import "../styles/adminAdd.css";

const UpdateLocation = () => {
  const { id } = useParams();
  const [name, setName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/locations/${id}`);
        setName(response.data.name);
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    fetchLocation();
  }, [id]);

  const updateLocation = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/locations/${id}`, { name });
      alert('Location updated successfully');
      navigate('/admin');
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  return (
    <div className="admin-container-one">
      <h1>Update Location</h1>
      <form onSubmit={updateLocation} className="admin-form-one">
        <input 
          type="text" 
          placeholder="Location Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <button type="submit" className="create-tour-button-one">Update Location</button>
        <button type="button" className="create-tour-button-one" onClick={() => navigate('/admin')}>Back to Admin Panel</button>
      </form>
    </div>
  );
};

export default UpdateLocation;
