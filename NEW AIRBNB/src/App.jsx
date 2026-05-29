import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Listings from './pages/Listings';
import PropertyDetails from './pages/PropertyDetails';
import Dashboard from './pages/Dashboard';
import Compare from './pages/Compare';
import './App.css';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100 bg-light text-dark">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/compare" element={<Compare />} />
          </Routes>
        </main>
        <footer className="bg-dark text-white-50 text-center py-4 border-top border-secondary">
          <div className="container">
            <p className="mb-1">&copy; 2026 CampusNest Inc. All rights reserved.</p>
            <p className="small mb-0">Hyperlocal student rental platform connecting tenants and landlords directly.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
