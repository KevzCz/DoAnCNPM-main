import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/tourRevenue.css';

const TourRevenue = () => {
  const [revenues, setRevenues] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchRevenues();
  }, []);

  const fetchRevenues = async (params = {}) => {
    try {
      const response = await axios.get('/api/tour-revenues', { params });
      setRevenues(response.data);
    } catch (error) {
      console.error('Error fetching tour revenues:', error);
    }
  };

  const handleFilter = () => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    fetchRevenues(params);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    fetchRevenues();
  };

  return (
    <div className="container-tour-revenue">
      <h1 className="h1-tour-revenue">Tour Revenue</h1>
      <div className="date-filter-tour-revenue">
        <input 
          type="date" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)} 
        />
        <input 
          type="date" 
          value={endDate} 
          onChange={(e) => setEndDate(e.target.value)} 
        />
        <button onClick={handleFilter}>Filter</button>
        <button onClick={handleReset}>Reset</button>
      </div>
      <table className="table-tour-revenue">
        <thead>
          <tr>
            <th className="th-tour-revenue">Revenue ID</th>
            <th className="th-tour-revenue">Tour ID</th>
            <th className="th-tour-revenue">Total Revenue</th>
            <th className="th-tour-revenue">Total Bookings</th>
            <th className="th-tour-revenue">Revenue Date</th>
          </tr>
        </thead>
        <tbody>
          {revenues.map((revenue) => (
            <tr key={revenue.revenue_id} className="tr-tour-revenue">
              <td className="td-tour-revenue">{revenue.revenue_id}</td>
              <td className="td-tour-revenue">{revenue.tour_id}</td>
              <td className="td-tour-revenue">{revenue.total_revenue}</td>
              <td className="td-tour-revenue">{revenue.total_bookings}</td>
              <td className="td-tour-revenue">{new Date(revenue.revenue_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TourRevenue;
