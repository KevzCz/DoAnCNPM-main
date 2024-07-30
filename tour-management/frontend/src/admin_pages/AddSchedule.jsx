import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../styles/admin.css";

const AddSchedule = () => {
  const [dayNumber, setDayNumber] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [tourId, setTourId] = useState('');
  const [tours, setTours] = useState([]);
  const [showTourDropdown, setShowTourDropdown] = useState(false);
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

    fetchTours();
  }, []);

  const createSchedule = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/schedules', {
        tour_id: tourId,
        day_number: dayNumber,
        activity_description: activityDescription,
        start_time: startTime,
        end_time: endTime
      });
      alert('Schedule created successfully');
      navigate('/admin');
    } catch (error) {
      console.error('Error creating schedule:', error);
    }
  };

  const handleTourSelect = (tour) => {
    setTourId(tour.tour_id);
  };

  return (
    <div className="admin-container">
      <h1>Add Schedule</h1>
      <form onSubmit={createSchedule} className="admin-form">
        <div className="input-with-button">
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
        </div>
        <input type="number" placeholder="Day Number" value={dayNumber} onChange={(e) => setDayNumber(e.target.value)} required />
        <textarea placeholder="Activity Description" value={activityDescription} onChange={(e) => setActivityDescription(e.target.value)} required></textarea>
        <input type="time" placeholder="Start Time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        <input type="time" placeholder="End Time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        <button type="submit" className="create-tour-button">Add Schedule</button>
        <button type="button" className="create-tour-button" onClick={() => navigate('/admin')}>Back to Admin Panel</button>
      </form>
    </div>
  );
};

export default AddSchedule;
