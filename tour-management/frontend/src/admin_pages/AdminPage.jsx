import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/admin.css';

const AdminPage = () => {
    return (
        <div className="admin-container">
            <h1>Admin Dashboard</h1>
            <div className="admin-links">
                <Link to="/add-tour" className="admin-link">Add Tour</Link>
                <Link to="/add-schedule" className="admin-link">Add Schedule</Link>
                <Link to="/add-location" className="admin-link">Add Location</Link>
            </div>
        </div>
    );
};

export default AdminPage;
