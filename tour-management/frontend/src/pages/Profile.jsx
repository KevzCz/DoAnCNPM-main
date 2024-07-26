import React, { useState, useEffect } from 'react';
import "../styles/profile.css";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        gender: '',
        birth_date: '',
        role: '',
        phone_number: ''
    });

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            const fetchUserProfile = async () => {
                try {
                    const response = await fetch(`/user/profile`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                        setProfileData({
                            name: userData.name || '',
                            gender: userData.gender || '',
                            birth_date: userData.birth_date ? addOneDay(userData.birth_date): '',
                            role: userData.role || '',
                            phone_number: userData.phone_number || ''
                        });
                        
                    } else {
                        console.error('Failed to fetch user profile');
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            };

            fetchUserProfile();
        } else {
            console.warn('User or token is not in localStorage');
        }
    }, []);
    const addOneDay = (dateString) => {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData({
            ...profileData,
            [name]: value
        });
    };

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/user/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: profileData.name,
                    gender: profileData.gender,
                    birth_date: profileData.birth_date
                })
            });

            if (response.ok) {
                alert('Profile updated successfully');
                const updatedUser = {
                    phone_number: profileData.phone_number,
                    name: profileData.name,
                    gender: profileData.gender,
                    birth_date: profileData.birth_date,
                    role: profileData.role
                };
                setUser(updatedUser);
                setEditMode(false);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            } else {
                alert('Error updating profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile');
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <img className="profile-avatar" src={profileData.photo || "/images/ava-1.jpg"} alt="Avatar" />
                <h1 className="profile-username">{profileData.name}</h1>
            </div>
            <div className="profile-details">
                <h2 className="profile-section-title">Thông tin tài khoản</h2>
                <div className="profile-info">
                    <div className="profile-info-item">
                        <span className="profile-info-label">Phone Number:</span>
                        <span className="profile-info-value">{profileData.phone_number}</span>
                    </div>
                    <div className="profile-info-item">
                        <span className="profile-info-label">Full Name:</span>
                        {editMode ? (
                            <input
                                type="text"
                                name="name"
                                value={profileData.name}
                                onChange={handleChange}
                            />
                        ) : (
                            <span className="profile-info-value">{profileData.name}</span>
                        )}
                    </div>
                    <div className="profile-info-item">
                        <span className="profile-info-label">Gender:</span>
                        {editMode ? (
                            <select
                                name="gender"
                                value={profileData.gender}
                                onChange={handleChange}
                            >
                                <option value="">Select Gender</option>
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                            </select>
                        ) : (
                            <span className="profile-info-value">{profileData.gender}</span>
                        )}
                    </div>
                    <div className="profile-info-item">
                        <span className="profile-info-label">Birthday:</span>
                        {editMode ? (
                            <input
                                type="date"
                                name="birth_date"
                                value={profileData.birth_date}
                                onChange={handleChange}
                            />
                        ) : (
                            <span className="profile-info-value">{profileData.birth_date}</span>
                        )}
                    </div>
                    <div className="profile-info-item">
                        <span className="profile-info-label">Role:</span>
                        <span className="profile-info-value">{profileData.role}</span>
                    </div>
                </div>
                {editMode ? (
                    <button className="btn save-btn" onClick={handleSave}>Save</button>
                ) : (
                    <button className="btn edit-btn" onClick={() => setEditMode(true)}>Edit</button>
                )}
            </div>
        </div>
    );
};

export default Profile;
