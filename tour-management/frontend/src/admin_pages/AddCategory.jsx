import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../styles/admin.css";

const AddCategory = () => {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [tours, setTours] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTour, setSelectedTour] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTourDropdown, setShowTourDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:3000/categories');
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchTours = async () => {
      try {
        const response = await axios.get('http://localhost:3000/tours');
        setTours(response.data.tours);
      } catch (error) {
        console.error('Error fetching tours:', error);
      }
    };

    fetchCategories();
    fetchTours();
  }, []);

  const createCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/categories', { name });
      alert('Category created successfully');
      navigate('/tours');
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const addTourToCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/tour-categories', { tour_id: selectedTour, category_id: selectedCategory });
      alert('Tour added to category successfully');
      navigate('/tours');
    } catch (error) {
      console.error('Error adding tour to category:', error);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category.category_id);
  };

  const handleTourSelect = (tour) => {
    setSelectedTour(tour.tour_id);
  };

  return (
    <div className="admin-container">
      <h1>Add Category</h1>
      <form onSubmit={createCategory} className="admin-form">
        <input 
          type="text" 
          placeholder="Category Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <button type="submit">Add Category</button>
        <button type="button" onClick={() => navigate('/tours')}>Back to Admin Panel</button>
      </form>
      
      <h1>Add Tour to Category</h1>
      <form onSubmit={addTourToCategory} className="admin-form">
        <div className="input-with-button">
          <div className="input-with-dropdown">
            <input
              type="text"
              placeholder="Select Category"
              value={selectedCategory}
              onFocus={() => setShowCategoryDropdown(true)}
              onBlur={() => setShowCategoryDropdown(false)}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
            />
            {showCategoryDropdown && (
              <div className="dropdown" onMouseDown={e => e.preventDefault()}>
                {categories.map(category => (
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
        </div>
        
        <div className="input-with-button">
          <div className="input-with-dropdown">
            <input
              type="text"
              placeholder="Select Tour"
              value={selectedTour}
              onFocus={() => setShowTourDropdown(true)}
              onBlur={() => setShowTourDropdown(false)}
              onChange={(e) => setSelectedTour(e.target.value)}
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
        <button type="submit">Add Tour to Category</button>
      </form>
    </div>
  );
};

export default AddCategory;
