import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-3">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center fs-3 fw-bold text-success" to="/">
          <i className="bi bi-house-heart-fill me-2"></i>
          Campus<span className="text-white">Nest</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className="nav-link px-3" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-3" to="/listings">Browse Properties</Link>
            </li>
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link px-3" to="/dashboard">
                    <i className="bi bi-speedometer2 me-1"></i>
                    Dashboard ({user.role === 'landlord' ? 'Landlord' : 'Tenant'})
                  </Link>
                </li>
                {user.role === 'tenant' && (
                  <li className="nav-item">
                    <Link className="nav-link px-3" to="/compare">
                      <i className="bi bi-arrow-left-right me-1"></i>
                      Compare
                    </Link>
                  </li>
                )}
                <li className="nav-item ms-lg-3 mt-3 mt-lg-0">
                  <span className="text-light me-3 d-none d-lg-inline">
                    Hello, <strong>{user.name}</strong>
                  </span>
                  <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
                    <i className="bi bi-box-arrow-right me-1"></i>Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item ms-lg-3 mt-3 mt-lg-0">
                  <Link className="btn btn-outline-light btn-sm px-3 me-2" to="/login">Login</Link>
                  <Link className="btn btn-success btn-sm px-3" to="/register">Sign Up</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
