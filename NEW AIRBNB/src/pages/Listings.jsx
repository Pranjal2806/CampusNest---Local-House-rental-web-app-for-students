import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Listings = () => {
  const { user, token } = useAuth();
  const location = useLocation();

  // Get query params from URL on load
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const initialType = queryParams.get('type') || 'All';

  // Filters State
  const [search, setSearch] = useState(initialSearch);
  const [type, setType] = useState(initialType);
  const [maxRent, setMaxRent] = useState(200000);
  const [maxDistance, setMaxDistance] = useState(10);

  // Data State
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [compareList, setCompareList] = useState([]);

  // Load properties and wishlist
  const fetchProperties = () => {
    setLoading(true);
    let url = `/api/properties?search=${encodeURIComponent(search)}&type=${type}&maxRent=${maxRent}&maxDistance=${maxDistance}`;
    
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProperties(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching properties:', err);
        setLoading(false);
      });
  };

  const fetchWishlist = () => {
    if (user && user.role === 'tenant' && token) {
      fetch('/api/users/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setWishlist(data.map(p => p._id));
          }
        })
        .catch((err) => console.error('Error fetching wishlist:', err));
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [type, maxRent, maxDistance]);

  useEffect(() => {
    fetchWishlist();
    // Load compare list from localStorage
    const savedCompare = JSON.parse(localStorage.getItem('compareList') || '[]');
    setCompareList(savedCompare);
  }, [user, token]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  // Toggle Wishlist
  const handleToggleWishlist = async (propertyId) => {
    if (!user) {
      alert('Please log in as a Tenant to save properties!');
      return;
    }
    if (user.role !== 'tenant') {
      alert('Only tenants can save properties to wishlist!');
      return;
    }

    try {
      const response = await fetch('/api/users/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ propertyId })
      });

      const data = await response.json();
      if (response.ok) {
        if (data.saved) {
          setWishlist(prev => [...prev, propertyId]);
        } else {
          setWishlist(prev => prev.filter(id => id !== propertyId));
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  // Toggle Compare
  const handleToggleCompare = (property) => {
    const isCompared = compareList.some(p => p._id === property._id);
    let updated;
    if (isCompared) {
      updated = compareList.filter(p => p._id !== property._id);
    } else {
      if (compareList.length >= 3) {
        alert('You can compare a maximum of 3 properties side-by-side.');
        return;
      }
      updated = [...compareList, property];
    }
    setCompareList(updated);
    localStorage.setItem('compareList', JSON.stringify(updated));
  };

  return (
    <div className="container py-5">
      <div className="row">
        {/* Filters Sidebar */}
        <div className="col-lg-3 mb-4">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
            <h4 className="fw-bold mb-4">Filters</h4>

            <form onSubmit={handleSearchSubmit} className="mb-4">
              <label className="form-label fw-semibold text-muted small">Search keyword</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="PG, flat, address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="btn btn-success" type="submit">
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </form>

            <div className="mb-4">
              <label className="form-label fw-semibold text-muted small">Accommodation Type</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="PG">PG (Paying Guest)</option>
                <option value="Flat">Flat / Apartment</option>
                <option value="Room">Private Room</option>
                <option value="Hostel">Hostel</option>
              </select>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between">
                <label className="form-label fw-semibold text-muted small">Max Monthly Rent</label>
                <span className="text-success fw-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(maxRent)}</span>
              </div>
              <input
                type="range"
                className="form-range"
                min="1000"
                max="200000"
                step="1000"
                value={maxRent}
                onChange={(e) => setMaxRent(Number(e.target.value))}
              />
              <div className="d-flex justify-content-between text-muted small">
                <span>₹1,000</span>
                <span>₹200,000</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between">
                <label className="form-label fw-semibold text-muted small">Max Distance to Campus</label>
                <span className="text-success fw-bold">{maxDistance} km</span>
              </div>
              <input
                type="range"
                className="form-range"
                min="0.5"
                max="15"
                step="0.5"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
              />
              <div className="d-flex justify-content-between text-muted small">
                <span>0.5 km</span>
                <span>15 km</span>
              </div>
            </div>

            {compareList.length > 0 && (
              <div className="mt-4 border-top pt-3">
                <h6 className="fw-bold mb-2">Comparison Bucket ({compareList.length}/3)</h6>
                <ul className="list-unstyled mb-3">
                  {compareList.map(p => (
                    <li key={p._id} className="d-flex justify-content-between align-items-center mb-2 bg-light p-2 rounded small">
                      <span className="text-truncate" style={{ maxWidth: '80%' }}>{p.title}</span>
                      <button onClick={() => handleToggleCompare(p)} className="btn btn-link text-danger p-0 border-0 shadow-none">
                        <i className="bi bi-x-circle-fill"></i>
                      </button>
                    </li>
                  ))}
                </ul>
                <Link to="/compare" className="btn btn-outline-success btn-sm w-100 fw-bold">
                  Go to Compare
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Listings Content */}
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-0">Properties Board</h2>
            <span className="badge bg-secondary p-2">{properties.length} Results Found</span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : properties.length > 0 ? (
            <div className="row g-4">
              {properties.map((prop) => {
                const isSaved = wishlist.includes(prop._id);
                const isCompared = compareList.some(p => p._id === prop._id);
                return (
                  <div key={prop._id} className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm overflow-hidden hover-card transition position-relative">
                      {/* Wishlist Button Overlay */}
                      {user && user.role === 'tenant' && (
                        <button
                          onClick={() => handleToggleWishlist(prop._id)}
                          className={`btn rounded-circle position-absolute m-3 z-1 shadow-sm d-flex align-items-center justify-content-center ${
                            isSaved ? 'btn-danger' : 'btn-light'
                          }`}
                          style={{ top: 0, right: 0, width: '40px', height: '40px' }}
                        >
                          <i className={`bi ${isSaved ? 'bi-heart-fill' : 'bi-heart'} fs-5`}></i>
                        </button>
                      )}

                      <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                        <img 
                          src={prop.image} 
                          alt={prop.title} 
                          className="w-100 h-100 object-fit-cover" 
                        />
                        <span className="badge bg-dark position-absolute top-0 start-0 m-3 py-2 px-3 fw-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(prop.rent)} /mo</span>
                      </div>
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                            {prop.type}
                          </span>
                          <div className="d-flex align-items-center">
                            <span className="text-warning fw-bold small me-3">
                              <i className="bi bi-star-fill me-1"></i>
                              {prop.rating}
                            </span>
                            <span className="text-muted small">
                              <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                              {prop.distance} km
                            </span>
                          </div>
                        </div>
                        <h5 className="card-title fw-bold text-truncate mb-2">{prop.title}</h5>
                        <p className="card-text text-muted small text-truncate-2 mb-3">
                          {prop.description}
                        </p>
                        
                        <div className="d-flex gap-2 flex-wrap mb-4">
                          {prop.amenities && prop.amenities.slice(0, 3).map((amenity, idx) => (
                            <span key={idx} className="badge bg-light text-dark border small">{amenity}</span>
                          ))}
                        </div>

                        <div className="d-flex gap-2">
                          <Link to={`/property/${prop._id}`} className="btn btn-outline-success flex-grow-1 fw-bold">
                            View Details
                          </Link>
                          {(!user || user.role === 'tenant') && (
                            <button
                              onClick={() => handleToggleCompare(prop)}
                              className={`btn fw-bold ${isCompared ? 'btn-success' : 'btn-outline-secondary'}`}
                              title="Compare this property"
                            >
                              <i className={`bi ${isCompared ? 'bi-check-lg' : 'bi-arrow-left-right'}`}></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-light rounded-4 text-center py-5">
              <i className="bi bi-house-exclamation text-muted display-4"></i>
              <h4 className="mt-3 fw-bold">No accommodations found</h4>
              <p className="text-muted">Adjust your filter options to explore other listings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Listings;
