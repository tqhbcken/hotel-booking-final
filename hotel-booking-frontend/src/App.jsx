import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import RoomList from "./components/RoomList";
import RoomDetail from "./components/RoomDetail";
import BookingHistory from "./components/BookingHistory";
import Profile from "./components/Profile";
import Navbar from "./components/Navbar";
import ChatBot from "./components/ChatBot";
import "./App.css";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <ChatBot />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/rooms" element={<RoomList />} />
              <Route path="/rooms/:roomId" element={<RoomDetail />} />
              <Route 
                path="/bookings" 
                element={
                  <ProtectedRoute>
                    <BookingHistory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Home />} />
            </Routes>
          </main>
          <footer className="footer">
            <p>&copy; {new Date().getFullYear()} Hotel Booking. Tất cả các quyền được bảo lưu.</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;