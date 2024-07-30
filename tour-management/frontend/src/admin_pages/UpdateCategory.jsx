import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import "../styles/adminAdd.css";

const UpdateCategory = () => {
  const { id } = useParams();
  const [name, setName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/categories/${id}`);
        setName(response.data.name);
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    };

    fetchCategory();
  }, [id]);

  const updateCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/categories/${id}`, { name });
      alert('Category updated successfully');
      navigate('/tours');
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  return (
    <div className="admin-container-one">
      <h1>Update Category</h1>
      <form onSubmit={updateCategory} className="admin-form-one">
        <input 
          type="text" 
          placeholder="Category Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <button type="submit" className="create-tour-button-one">Update Category</button>
        <button type="button" className="create-tour-button-one" onClick={() => navigate('/tours')}>Back to Admin Panel</button>
      </form>
    </div>
  );
};

export default UpdateCategory;
