import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const [search, setSearch] = useState('');
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch top 3 properties
    fetch('/api/properties')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFeatured(data.slice(0, 3));
        }
      })
      .catch((err) => console.error('Error fetching featured properties:', err));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/listings?search=${encodeURIComponent(search)}`);
  };

  const handleQuickFilter = (type) => {
    navigate(`/listings?type=${type}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section 
        className="text-white text-center py-5 d-flex align-items-center"
        style={{
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          minHeight: '450px'
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-9 col-lg-8">
              <span className="badge bg-success mb-3 px-3 py-2 text-uppercase tracking-wider">Hyperlocal Student Rental</span>
              <h1 className="display-4 fw-bold mb-3">Find Your Home Near Campus</h1>
              <p className="lead mb-4 opacity-75">
                CampusNest connects students and local tenants with verified properties, PGs, and flats right next to your college.
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="bg-white p-2 rounded-pill shadow-lg d-flex align-items-center mb-4">
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-0 text-muted ps-3">
                    <i className="bi bi-search fs-5"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-0 bg-transparent py-3 shadow-none text-dark fs-5"
                    placeholder="Search PGs, 2BHK flats, hostels..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button type="submit" className="btn btn-success px-4 rounded-pill fw-bold text-uppercase fs-6">
                    Search
                  </button>
                </div>
              </form>

              {/* Quick College Tags */}
              <div className="d-flex flex-wrap justify-content-center gap-2 align-items-center">
                <span className="text-white-50 me-2">Try searching near:</span>
                <button onClick={() => setSearch('Stanford University')} className="btn btn-sm btn-outline-light rounded-pill px-3">Stanford</button>
                <button onClick={() => setSearch('MIT')} className="btn btn-sm btn-outline-light rounded-pill px-3">MIT</button>
                <button onClick={() => setSearch('PG')} className="btn btn-sm btn-outline-light rounded-pill px-3">PGs</button>
                <button onClick={() => setSearch('Flat')} className="btn btn-sm btn-outline-light rounded-pill px-3">Flats</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Categories */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Browse by Accommodation Type</h2>
            <p className="text-muted">Select the type of stay that fits your student lifestyle</p>
          </div>
          <div className="row g-4 justify-content-center">
            {[
              { title: 'PGs (Paying Guest)', type: 'PG', icon: 'bi-people-fill', desc: 'Shared rooms with meals and housekeeping.' },
              { title: 'Flats & Apartments', type: 'Flat', icon: 'bi-building-fill', desc: 'Independent 1BHK, 2BHK & 3BHK options.' },
              { title: 'Private Rooms', type: 'Room', icon: 'bi-door-closed-fill', desc: 'Single rooms with shared common spaces.' },
              { title: 'Hostels', type: 'Hostel', icon: 'bi-backpack-fill', desc: 'Budget student housing near university hubs.' },
            ].map((cat, i) => (
              <div key={i} className="col-sm-6 col-md-3">
                <div 
                  className="card border-0 shadow-sm text-center p-4 h-100 cursor-pointer hover-card transition"
                  onClick={() => handleQuickFilter(cat.type)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-inline-flex align-items-center justify-content-center bg-success-subtle text-success rounded-circle p-3 mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                    <i className={`bi ${cat.icon} fs-3`}></i>
                  </div>
                  <h5 className="fw-bold mb-2">{cat.title}</h5>
                  <p className="text-muted small mb-0">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <h2 className="fw-bold mb-1">Featured Listings</h2>
              <p className="text-muted mb-0">Handpicked properties with proximity to campus</p>
            </div>
            <Link to="/listings" className="btn btn-outline-success">View All Properties</Link>
          </div>

          {featured.length > 0 ? (
            <div className="row g-4">
              {featured.map((prop) => (
                <div key={prop._id} className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm overflow-hidden hover-card transition">
                    <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                      <img 
                        src={prop.image} 
                        alt={prop.title} 
                        className="w-100 h-100 object-fit-cover" 
                      />
                      <span className="badge bg-dark position-absolute top-0 end-0 m-3 py-2 px-3 fw-bold">
                        ${prop.rent}/mo
                      </span>
                      <span className="badge bg-success position-absolute top-0 start-0 m-3 py-2 px-3 fw-bold">
                        {prop.type}
                      </span>
                    </div>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted small">
                          <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                          {prop.distance} km from college
                        </span>
                        <span className="text-warning fw-bold small">
                          <i className="bi bi-star-fill me-1"></i>
                          {prop.rating}
                        </span>
                      </div>
                      <h5 className="card-title fw-bold text-truncate mb-2">{prop.title}</h5>
                      <p className="card-text text-muted small text-truncate-2 mb-3">
                        {prop.description}
                      </p>
                      
                      {/* Amenities Icons Preview */}
                      <div className="d-flex gap-2 flex-wrap mb-4">
                        {prop.amenities && prop.amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="badge bg-light text-dark border small">{amenity}</span>
                        ))}
                      </div>

                      <Link to={`/property/${prop._id}`} className="btn btn-outline-success w-100 fw-bold">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-light rounded-4 text-center py-5">
              <i className="bi bi-house-door text-muted display-4"></i>
              <h4 className="mt-3 fw-bold">No properties listed yet</h4>
              <p className="text-muted mb-4">Be the first to list a property on CampusNest!</p>
              <Link to="/register" className="btn btn-success fw-bold px-4">Register as Landlord</Link>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-5 bg-dark text-white">
        <div className="container text-center py-4">
          <h2 className="fw-bold mb-4">Made Specially for Students & Landlords</h2>
          <div className="row g-4 mt-2">
            <div className="col-md-4">
              <i className="bi bi-shield-check fs-1 text-success mb-3"></i>
              <h4>Verified Localities</h4>
              <p className="opacity-75">All listings are vetted to ensure they are inside student hubs and safe areas.</p>
            </div>
            <div className="col-md-4">
              <i className="bi bi-lightning-charge fs-1 text-success mb-3"></i>
              <h4>Quick Compare</h4>
              <p className="opacity-75">Compare up to 3 listings side-by-side on price, rating, and walking distance.</p>
            </div>
            <div className="col-md-4">
              <i className="bi bi-chat-left-heart fs-1 text-success mb-3"></i>
              <h4>Direct Landlord Connect</h4>
              <p className="opacity-75">No hidden brokerage. Connect directly with landlords via phone or email.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
