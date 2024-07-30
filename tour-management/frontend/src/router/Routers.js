import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Tour from "../pages/Tour";
import TourDetails from "../pages/TourDetails";
import Login from "../pages/Login";
import Register from "../pages/Register";
import SearchResultList from "../pages/SearchResultList";
import ThankYou from "../pages/ThankYou";
import Profile from "../pages/Profile";
import AddTour from "../admin_pages/AddTour";
import AddCategory from '../admin_pages/AddCategory';
import AddSchedule from '../admin_pages/AddSchedule';
import AdminPage from "../admin_pages/AdminPage";
import AddLocation from "../admin_pages/AddLocation";
import BookingDetails from "../pages/BookingDetails";
import Payment from "../pages/Payment";
import Invoices from "../pages/Invoices";
import EditTour from "../admin_pages/EditTour";
import ActiveTours from "../admin_pages/ActiveTours";
import UnactiveTours from "../admin_pages/UnActiveTours";
import ActiveToursItinerary from "../pages/ActiveToursItinerary";  // Import ActiveToursItinerary
import BookingCancelled from "../pages/BookingCancelled";
import UpdateCategory from "../admin_pages/UpdateCategory";
import UpdateLocation from "../admin_pages/UpdateLocation";
import TourRevenue from "../admin_pages/TourRevenue";

const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/tours" element={<Tour />} />
      <Route path="/tours/:id" element={<TourDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/register" element={<Register />} />
      <Route path="/thank-you" element={<ThankYou />} />
      <Route path="/tours/search" element={<SearchResultList />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/add-tour" element={<AddTour />} />
      <Route path="/add-category" element={<AddCategory />} />
      <Route path="/add-schedule" element={<AddSchedule />} />
      <Route path="/add-location" element={<AddLocation />} />
      <Route path="/booking-details" element={<BookingDetails />} />
      <Route path="/payment/:bookingId" element={<Payment />} />
      <Route path="/invoices" element={<Invoices />} />
      <Route path="/tours/edit/:tourId" element={<EditTour />} />
      <Route path="/tours/active" element={<ActiveTours />} />
      <Route path="/tours/unactive" element={<UnactiveTours />} />
      <Route path="/active-tours-itinerary" element={<ActiveToursItinerary />} />
      <Route path="/booking-canceled" element={<BookingCancelled />} />
      <Route path="/update-location/:id" element={<UpdateLocation />} />
      <Route path="/update-category/:id" element={<UpdateCategory />} />
      <Route path="/tour-revenue" element={<TourRevenue />} />
    </Routes>
  );
};

export default Routers;
