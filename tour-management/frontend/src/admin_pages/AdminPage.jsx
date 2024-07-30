import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/admin2.0.css';

const AdminPage = () => {
    return (
        <div className="admin-container">
            <h1>Admin Dashboard</h1>
            <div className="admin-links">
                <Link to="/tours/active" className="admin-link">Active Tours</Link>
                <Link to="/add-tour" className="admin-link">Add Tour</Link>
                <Link to="/add-location" className="admin-link">Add Location</Link>
                <Link to="/tours/unactive" className="admin-link">Inactive Tours</Link>
            </div>
        </div>
    );
};

export default AdminPage;
