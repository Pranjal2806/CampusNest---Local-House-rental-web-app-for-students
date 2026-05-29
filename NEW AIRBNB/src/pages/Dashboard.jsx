import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Landlord States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rent, setRent] = useState('');
  const [distance, setDistance] = useState('');
  const [type, setType] = useState('Flat');
  const [amenities, setAmenities] = useState('');
  const [image, setImage] = useState('');
  const [landlordProperties, setLandlordProperties] = useState([]);

  // Tenant States
  const [wishlistProperties, setWishlistProperties] = useState([]);

  // Common Loading
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch dashboard data
  // Handle image file conversion to base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const fetchDashboardData = () => {
    if (!user || !token) return;
    setLoading(true);

    if (user.role === 'landlord') {
      // Get all properties and filter by landlord
      fetch('/api/properties')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const myProps = data.filter(p => p.landlord_id === user.id);
            setLandlordProperties(myProps);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      // Tenant: Get wishlist properties
      fetch('/api/users/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setWishlistProperties(data);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, token]);

  // Handle Property Upload (Landlord)
  const handleAddProperty = async (e) => {
    e.preventDefault();
    if (!title || !rent) {
      setMessage({ text: 'Title and Rent are required!', type: 'danger' });
      return;
    }

    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          rent: Number(rent),
          distance: Number(distance || 1.0),
          type,
          amenities,
          image
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'Property uploaded successfully!', type: 'success' });
        // Clear fields
        setTitle('');
        setDescription('');
        setRent('');
        setDistance('');
        setType('Flat');
        setAmenities('');
        setImage('');
        // Reload list
        fetchDashboardData();
      } else {
        setMessage({ text: data.message || 'Failed to upload property', type: 'danger' });
      }
    } catch (err) {
      setMessage({ text: 'Network error occurred.', type: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  // Remove property from wishlist (Tenant helper)
  const handleRemoveWishlist = async (propertyId) => {
    try {
      const response = await fetch('/api/users/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ propertyId })
      });
      if (response.ok) {
        setWishlistProperties(prev => prev.filter(p => p._id !== propertyId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="container py-5">
      <div className="row mb-5">
        <div className="col">
          <div className="bg-light p-4 rounded-4 shadow-sm border-0 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="fw-bold text-dark mb-1">User Dashboard</h2>
              <p className="text-muted mb-0">
                Welcome back, <strong className="text-success">{user.name}</strong> ({user.email})
              </p>
            </div>
            <span className="badge bg-dark py-2 px-3 fs-6">
              Role: {user.role === 'landlord' ? 'Landlord / Owner' : 'Student / Tenant'}
            </span>
          </div>
        </div>
      </div>

      {user.role === 'landlord' ? (
        // LANDLORD VIEW
        <div className="row g-5">
          {/* Add Property Form */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm p-4 p-lg-5 rounded-4 bg-white">
              <h3 className="fw-bold mb-4">
                <i className="bi bi-cloud-arrow-up-fill text-success me-2"></i>
                List New Property
              </h3>

              {message.text && (
                <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                  {message.text}
                  <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
                </div>
              )}

              <form onSubmit={handleAddProperty}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted">Property Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Cozy 1BHK Flat near Campus"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label fw-semibold small text-muted">Rent ($ / month) *</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 650"
                      value={rent}
                      onChange={(e) => setRent(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold small text-muted">Distance to College (km)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      placeholder="e.g. 1.2"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted">Accommodation Type</label>
                  <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="Flat">Flat / Apartment</option>
                    <option value="PG">PG (Paying Guest)</option>
                    <option value="Room">Private Room</option>
                    <option value="Hostel">Hostel</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted">Property Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={handleImageChange}
                  />
                  <div className="form-text text-muted small">Leave empty for a default beautiful property image</div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small text-muted">Amenities (comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="WiFi, AC, Kitchen, Laundry, Gym"
                    value={amenities}
                    onChange={(e) => setAmenities(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small text-muted">Full Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Provide details about the space, room rules, roommate criteria, ambience..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-success w-100 py-3 fw-bold text-uppercase" disabled={submitting}>
                  {submitting ? 'Uploading...' : 'Publish Listing'}
                </button>
              </form>
            </div>
          </div>

          {/* Uploaded Listings List */}
          <div className="col-lg-7">
            <h3 className="fw-bold mb-4">Your Active Listings ({landlordProperties.length})</h3>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
              </div>
            ) : landlordProperties.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {landlordProperties.map((prop) => (
                  <div key={prop._id} className="card border-0 shadow-sm overflow-hidden p-0">
                    <div className="row g-0">
                      <div className="col-sm-4" style={{ height: '140px' }}>
                        <img src={prop.image} alt={prop.title} className="w-100 h-100 object-fit-cover" />
                      </div>
                      <div className="col-sm-8">
                        <div className="card-body p-3 h-100 d-flex flex-column justify-content-between">
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="badge bg-success-subtle text-success small">{prop.type}</span>
                              <span className="fw-bold text-success">${prop.rent}/mo</span>
                            </div>
                            <h5 className="card-title fw-bold text-truncate mb-1">{prop.title}</h5>
                            <p className="card-text text-muted small text-truncate mb-2">{prop.description}</p>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted small">
                              <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                              {prop.distance} km from college
                            </span>
                            <Link to={`/property/${prop._id}`} className="btn btn-outline-success btn-sm">
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-light rounded-4 text-center py-5 border">
                <i className="bi bi-house-add-fill text-muted display-4"></i>
                <h5 className="mt-3 fw-bold">No active listings</h5>
                <p className="text-muted mb-0">Use the form on the left to add your first rental property!</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // TENANT VIEW
        <div className="row">
          <div className="col">
            <h3 className="fw-bold mb-4">Your Wishlist / Saved Listings ({wishlistProperties.length})</h3>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
              </div>
            ) : wishlistProperties.length > 0 ? (
              <div className="row g-4">
                {wishlistProperties.map((prop) => (
                  <div key={prop._id} className="col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm overflow-hidden hover-card transition position-relative">
                      {/* Delete Overlay */}
                      <button
                        onClick={() => handleRemoveWishlist(prop._id)}
                        className="btn btn-danger btn-sm rounded-circle position-absolute m-3 z-1 shadow-sm d-flex align-items-center justify-content-center"
                        style={{ top: 0, right: 0, width: '36px', height: '36px' }}
                        title="Remove from wishlist"
                      >
                        <i className="bi bi-trash-fill fs-6"></i>
                      </button>

                      <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                        <img src={prop.image} alt={prop.title} className="w-100 h-100 object-fit-cover" />
                        <span className="badge bg-dark position-absolute top-0 start-0 m-3 py-1 px-2 fw-bold">
                          ${prop.rent}/mo
                        </span>
                      </div>
                      <div className="card-body p-4">
                        <span className="badge bg-success-subtle text-success mb-2">{prop.type}</span>
                        <h5 className="card-title fw-bold text-truncate mb-2">{prop.title}</h5>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <span className="text-muted small">
                            <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                            {prop.distance} km away
                          </span>
                          <Link to={`/property/${prop._id}`} className="btn btn-outline-success btn-sm fw-bold">
                            View details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-light rounded-4 text-center py-5">
                <i className="bi bi-heartbreak-fill text-muted display-4"></i>
                <h5 className="mt-3 fw-bold">Wishlist is empty</h5>
                <p className="text-muted mb-4">Browse and save listings you like to compare them later.</p>
                <Link to="/listings" className="btn btn-success fw-bold px-4">Browse Listings</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
