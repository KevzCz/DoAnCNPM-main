import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../styles/adminAdd.css";

const AddCategory = () => {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
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

    fetchCategories();
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

  return (
    <div className="admin-container-one">
      <h1>Add Category</h1>
      <form onSubmit={createCategory} className="admin-form-one">
        <input 
          type="text" 
          placeholder="Category Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <button type="submit" className="create-tour-button-one">Add Category</button>
        <button type="button" onClick={() => navigate('/tours')} className="create-tour-button-one">Back to Admin Panel</button>
      </form>
      <div className="category-list-one">
        <h2>Available Categories</h2>
        <ul className="category-items-one">
          {categories.map((category) => (
            <li key={category.category_id} onClick={() => navigate(`/update-category/${category.category_id}`)}>
              {category.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AddCategory;
