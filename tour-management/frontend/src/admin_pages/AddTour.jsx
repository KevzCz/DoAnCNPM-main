import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../styles/admin.css";

const AddTour = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeDays, setActiveDays] = useState('');
  const [price, setPrice] = useState('');
  const [maxSeats, setMaxSeats] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('Không hoạt động');

  const navigate = useNavigate();

  const createTour = async (e) => {
    e.preventDefault();
    try {
      const newTour = {
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        active_days: activeDays,
        price: Math.max(0, price),
        max_seats: Math.max(0, maxSeats),
        image_url: imageUrl,
        status
      };
      await axios.post('http://localhost:3000/tours', newTour);
      alert('Tour created successfully');
      navigate('/admin');
    } catch (error) {
      console.error('Error creating tour:', error);
    }
  };

  return (
    <div className="admin-container">
      <h1>Create Tour</h1>
      <form onSubmit={createTour} className="admin-form">
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
        <input type="date" placeholder="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        <input type="date" placeholder="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        <input type="number" placeholder="Active Days" value={activeDays} onChange={(e) => setActiveDays(e.target.value)} required />
        <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <input type="number" placeholder="Max Seats" value={maxSeats} onChange={(e) => setMaxSeats(e.target.value)} required />
        <input type="text" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
        <select value={status} onChange={(e) => setStatus(e.target.value)} required>
          <option value="Không hoạt động">Không hoạt động</option>
          <option value="Hoạt động">Hoạt động</option>
          <option value="Đã kết thúc">Đã kết thúc</option>
          <option value="Hết chỗ">Hết chỗ</option>
        </select>
        <button type="submit" className="create-tour-button">Create Tour</button>
      </form>
    </div>
  );
};

export default AddTour;
