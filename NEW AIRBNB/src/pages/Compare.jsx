import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Compare = () => {
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    // Load compared properties from local storage
    const savedCompare = JSON.parse(localStorage.getItem('compareList') || '[]');
    setCompareList(savedCompare);
  }, []);

  const handleRemoveCompare = (id) => {
    const updated = compareList.filter(p => p._id !== id);
    setCompareList(updated);
    localStorage.setItem('compareList', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    setCompareList([]);
    localStorage.removeItem('compareList');
  };

  // Find optimal values to highlight
  const getMinRent = () => {
    if (compareList.length === 0) return null;
    return Math.min(...compareList.map(p => p.rent));
  };

  const getMinDistance = () => {
    if (compareList.length === 0) return null;
    return Math.min(...compareList.map(p => p.distance));
  };

  const getMaxRating = () => {
    if (compareList.length === 0) return null;
    return Math.max(...compareList.map(p => p.rating));
  };

  const minRentVal = getMinRent();
  const minDistanceVal = getMinDistance();
  const maxRatingVal = getMaxRating();

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Property Comparison Board</h2>
          <p className="text-muted mb-0">Compare up to 3 properties side-by-side to make the best decision</p>
        </div>
        {compareList.length > 0 && (
          <button onClick={handleClearAll} className="btn btn-outline-danger">
            <i className="bi bi-trash3-fill me-2"></i>Clear All
          </button>
        )}
      </div>

      {compareList.length > 0 ? (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-bordered mb-0 align-middle text-center" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr className="bg-light">
                  <th style={{ width: '220px' }} className="text-start py-4 ps-4 fs-5 fw-bold text-dark">Feature</th>
                  {compareList.map(prop => (
                    <th key={prop._id} className="py-3 px-3 position-relative">
                      <button
                        onClick={() => handleRemoveCompare(prop._id)}
                        className="btn btn-sm btn-close position-absolute top-0 end-0 m-2 shadow-none"
                        title="Remove from comparison"
                      ></button>
                      <div className="text-center pt-2">
                        <img 
                          src={prop.image} 
                          alt={prop.title} 
                          className="rounded-3 mb-2 object-fit-cover" 
                          style={{ width: '100%', height: '120px' }}
                        />
                        <h6 className="fw-bold text-truncate mb-0 px-2">{prop.title}</h6>
                        <span className="badge bg-success-subtle text-success mt-1">{prop.type}</span>
                      </div>
                    </th>
                  ))}
                  {/* Fill empty cells if comparing less than 3 */}
                  {compareList.length < 3 && 
                    Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                      <th key={`empty-${idx}`} className="text-muted small align-middle opacity-50 bg-light">
                        <i className="bi bi-house-add display-6 d-block mb-2"></i>
                        Add another property to compare
                      </th>
                    ))
                  }
                </tr>
              </thead>
              <tbody>
                {/* Rent Row */}
                <tr>
                  <td className="text-start py-3 ps-4 fw-bold text-muted">Monthly Rent</td>
                  {compareList.map(p => {
                    const isBest = p.rent === minRentVal;
                    return (
                      <td key={p._id} className={`py-3 ${isBest ? 'bg-success-subtle' : ''}`}>
                        <span className={`fs-5 fw-bold ${isBest ? 'text-success' : 'text-dark'}`}>
                          ${p.rent}
                        </span>
                        {isBest && (
                          <div className="badge bg-success text-white d-block mx-auto mt-1" style={{ width: 'fit-content' }}>
                            Lowest Rent
                          </div>
                        )}
                      </td>
                    );
                  })}
                  {compareList.length < 3 && <td colSpan={3 - compareList.length} className="bg-light"></td>}
                </tr>

                {/* Distance Row */}
                <tr>
                  <td className="text-start py-3 ps-4 fw-bold text-muted">Distance to Campus</td>
                  {compareList.map(p => {
                    const isBest = p.distance === minDistanceVal;
                    return (
                      <td key={p._id} className={`py-3 ${isBest ? 'bg-success-subtle' : ''}`}>
                        <span className={`fs-5 fw-bold ${isBest ? 'text-success' : 'text-dark'}`}>
                          {p.distance} km
                        </span>
                        {isBest && (
                          <div className="badge bg-success text-white d-block mx-auto mt-1" style={{ width: 'fit-content' }}>
                            Closest to Campus
                          </div>
                        )}
                      </td>
                    );
                  })}
                  {compareList.length < 3 && <td colSpan={3 - compareList.length} className="bg-light"></td>}
                </tr>

                {/* Rating Row */}
                <tr>
                  <td className="text-start py-3 ps-4 fw-bold text-muted">Tenant Rating</td>
                  {compareList.map(p => {
                    const isBest = p.rating === maxRatingVal;
                    return (
                      <td key={p._id} className={`py-3 ${isBest ? 'bg-warning-subtle' : ''}`}>
                        <span className={`fs-5 fw-bold ${isBest ? 'text-warning' : 'text-dark'}`}>
                          <i className="bi bi-star-fill me-1"></i>
                          {p.rating}
                        </span>
                        {isBest && (
                          <div className="badge bg-warning text-dark d-block mx-auto mt-1" style={{ width: 'fit-content' }}>
                            Highest Rated
                          </div>
                        )}
                      </td>
                    );
                  })}
                  {compareList.length < 3 && <td colSpan={3 - compareList.length} className="bg-light"></td>}
                </tr>

                {/* Amenities Row */}
                <tr>
                  <td className="text-start py-3 ps-4 fw-bold text-muted">Amenities</td>
                  {compareList.map(p => (
                    <td key={p._id} className="py-3 px-3">
                      <div className="d-flex flex-wrap justify-content-center gap-1">
                        {p.amenities && p.amenities.length > 0 ? (
                          p.amenities.map((amenity, idx) => (
                            <span key={idx} className="badge bg-light text-dark border small">
                              {amenity}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted small">Standard Utilities</span>
                        )}
                      </div>
                    </td>
                  ))}
                  {compareList.length < 3 && <td colSpan={3 - compareList.length} className="bg-light"></td>}
                </tr>

                {/* Description Row */}
                <tr>
                  <td className="text-start py-3 ps-4 fw-bold text-muted">Details & Owner</td>
                  {compareList.map(p => (
                    <td key={p._id} className="py-3 px-3 text-start small">
                      <p className="text-muted mb-2 text-truncate-3">{p.description}</p>
                      <div className="border-top pt-2">
                        <strong className="d-block">{p.landlord_name}</strong>
                        <span className="text-muted text-truncate d-block">{p.landlord_email}</span>
                      </div>
                    </td>
                  ))}
                  {compareList.length < 3 && <td colSpan={3 - compareList.length} className="bg-light"></td>}
                </tr>

                {/* Actions Row */}
                <tr>
                  <td className="text-start py-3 ps-4 fw-bold text-muted">Action</td>
                  {compareList.map(p => (
                    <td key={p._id} className="py-3">
                      <Link to={`/property/${p._id}`} className="btn btn-success fw-bold px-4">
                        View Full Details
                      </Link>
                    </td>
                  ))}
                  {compareList.length < 3 && <td colSpan={3 - compareList.length} className="bg-light"></td>}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-light rounded-4 text-center py-5 border">
          <i className="bi bi-arrow-left-right text-muted display-4"></i>
          <h4 className="mt-3 fw-bold">No properties selected for comparison</h4>
          <p className="text-muted mb-4">Select properties from the Listings page to compare them here.</p>
          <Link to="/listings" className="btn btn-success fw-bold px-4">Go to Listings</Link>
        </div>
      )}
    </div>
  );
};

export default Compare;
