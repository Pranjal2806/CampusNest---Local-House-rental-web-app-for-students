import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PropertyDetails = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Fetch property details
    fetch(`/api/properties/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Property not found');
        return res.json();
      })
      .then((data) => {
        setProperty(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    // Check if saved if user is tenant
    if (user && user.role === 'tenant' && token) {
      fetch('/api/users/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const saved = data.some(p => p._id === id);
            setIsSaved(saved);
          }
        })
        .catch((err) => console.error('Error fetching wishlist status:', err));
    }
  }, [id, user, token]);

  const handleToggleWishlist = async () => {
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
        body: JSON.stringify({ propertyId: id })
      });

      const data = await response.json();
      if (response.ok) {
        setIsSaved(data.saved);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger d-inline-block" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error || 'Failed to load property details.'}
        </div>
        <div>
          <Link to="/listings" className="btn btn-success mt-3">Back to Listings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/" className="text-success text-decoration-none">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/listings" className="text-success text-decoration-none">Listings</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{property.title}</li>
        </ol>
      </nav>

      <div className="row g-5">
        {/* Left Side: Images & Info */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div style={{ maxHeight: '450px', overflow: 'hidden' }}>
              <img 
                src={property.image} 
                alt={property.title} 
                className="w-100 object-fit-cover"
                style={{ minHeight: '350px' }}
              />
            </div>
            <div className="card-body p-4 p-lg-5">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                <div>
                  <span className="badge bg-success px-3 py-2 text-uppercase mb-2">{property.type}</span>
                  <h1 className="fw-bold mb-2">{property.title}</h1>
                  <p className="text-muted d-flex align-items-center">
                    <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                    Located {property.distance} km from the nearest college campus
                  </p>
                </div>
                
                {user && user.role === 'tenant' && (
                  <button 
                    onClick={handleToggleWishlist} 
                    className={`btn px-4 py-2 fw-bold d-flex align-items-center gap-2 ${
                      isSaved ? 'btn-danger' : 'btn-outline-danger'
                    }`}
                  >
                    <i className={`bi ${isSaved ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                    {isSaved ? 'Saved to Wishlist' : 'Save Property'}
                  </button>
                )}
              </div>

              <hr />

              {/* Quick Metrics */}
              <div className="row g-3 text-center my-3">
                <div className="col-4 border-end">
                  <span className="text-muted small d-block">Monthly Rent</span>
                  <h3 className="fw-bold text-success mb-0">${property.rent}</h3>
                </div>
                <div className="col-4 border-end">
                  <span className="text-muted small d-block">Distance</span>
                  <h3 className="fw-bold text-dark mb-0">{property.distance} km</h3>
                </div>
                <div className="col-4">
                  <span className="text-muted small d-block">Tenant Rating</span>
                  <h3 className="fw-bold text-warning mb-0">
                    <i className="bi bi-star-fill me-1"></i>
                    {property.rating}
                  </h3>
                </div>
              </div>

              <hr />

              <h4 className="fw-bold mb-3 mt-4">Description</h4>
              <p className="text-muted lead-sm" style={{ lineHeight: '1.7' }}>
                {property.description || 'No description provided.'}
              </p>

              <h4 className="fw-bold mb-3 mt-5">Amenities Included</h4>
              <div className="d-flex flex-wrap gap-2 mb-4">
                {property.amenities && property.amenities.length > 0 ? (
                  property.amenities.map((amenity, idx) => (
                    <span key={idx} className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fs-6">
                      <i className="bi bi-patch-check-fill me-2"></i>
                      {amenity}
                    </span>
                  ))
                ) : (
                  <span className="text-muted">Standard utilities included.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Landlord & Booking Card */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white sticky-top" style={{ top: '30px' }}>
            <h4 className="fw-bold mb-4">Contact Landlord</h4>
            
            <div className="d-flex align-items-center mb-4">
              <div className="bg-success-subtle text-success rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-person-workspace fs-3"></i>
              </div>
              <div className="ms-3">
                <h5 className="fw-bold mb-1">{property.landlord_name}</h5>
                <span className="badge bg-secondary">Verified Owner</span>
              </div>
            </div>

            <div className="bg-light p-3 rounded-3 mb-4">
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-envelope-fill text-muted fs-5 me-3"></i>
                <div>
                  <span className="text-muted small d-block">Email Address</span>
                  <a href={`mailto:${property.landlord_email}`} className="text-dark fw-bold text-decoration-none">
                    {property.landlord_email}
                  </a>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <i className="bi bi-telephone-fill text-muted fs-5 me-3"></i>
                <div>
                  <span className="text-muted small d-block">Phone Support</span>
                  <span className="text-dark fw-bold">+1 (555) CampusNest</span>
                </div>
              </div>
            </div>

            <p className="text-muted small text-center mb-4">
              <i className="bi bi-shield-lock-fill text-success me-1"></i>
              Never pay deposit fees or sign rental contracts without visiting the property first in person.
            </p>

            <a 
              href={`mailto:${property.landlord_email}?subject=Inquiry about ${encodeURIComponent(property.title)}`}
              className="btn btn-success w-100 py-3 fw-bold text-uppercase"
            >
              <i className="bi bi-chat-left-text-fill me-2"></i>
              Send Inquiry
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
