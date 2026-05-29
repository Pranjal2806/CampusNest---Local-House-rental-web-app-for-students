import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
  const location = useLocation();
  // Determine mode from path: '/login' or '/register'
  const isLoginMode = location.pathname === '/login';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('tenant');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (isLoginMode) {
        await login(email, password);
        setSuccess('Logged in successfully! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        await register(name, email, password, role);
        setSuccess('Registration successful! Please login.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="bg-success text-white py-4 px-4 text-center">
              <i className="bi bi-house-lock fs-1 mb-2"></i>
              <h3 className="fw-bold mb-0">{isLoginMode ? 'Welcome Back' : 'Create Account'}</h3>
              <p className="small opacity-75 mb-0">
                {isLoginMode ? 'Log in to manage or find campus rentals' : 'Join CampusNest today'}
              </p>
            </div>
            <div className="card-body p-4 p-lg-5">
              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}
              {success && (
                <div className="alert alert-success d-flex align-items-center" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  <div>{success}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {!isLoginMode && (
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">Full Name</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-person text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control bg-light border-start-0"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label fw-bold small text-muted">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-envelope text-muted"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control bg-light border-start-0"
                      placeholder="student@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small text-muted">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-shield-lock text-muted"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control bg-light border-start-0"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {!isLoginMode && (
                  <div className="mb-4">
                    <label className="form-label fw-bold small text-muted d-block">Register As</label>
                    <div className="row g-2">
                      <div className="col-6">
                        <input
                          type="radio"
                          className="btn-check"
                          name="role"
                          id="role-tenant"
                          value="tenant"
                          checked={role === 'tenant'}
                          onChange={() => setRole('tenant')}
                        />
                        <label className="btn btn-outline-success w-100 py-2 d-flex flex-column align-items-center" htmlFor="role-tenant">
                          <i className="bi bi-person-badge fs-4 mb-1"></i>
                          <span>Tenant / Student</span>
                        </label>
                      </div>
                      <div className="col-6">
                        <input
                          type="radio"
                          className="btn-check"
                          name="role"
                          id="role-landlord"
                          value="landlord"
                          checked={role === 'landlord'}
                          onChange={() => setRole('landlord')}
                        />
                        <label className="btn btn-outline-success w-100 py-2 d-flex flex-column align-items-center" htmlFor="role-landlord">
                          <i className="bi bi-house-gear fs-4 mb-1"></i>
                          <span>Landlord</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-success w-100 py-3 fw-bold text-uppercase tracking-wide mt-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : null}
                  {isLoginMode ? 'Log In' : 'Sign Up'}
                </button>
              </form>

              <div className="text-center mt-4">
                <span className="text-muted small">
                  {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
                </span>
                <button
                  onClick={() => navigate(isLoginMode ? '/register' : '/login')}
                  className="btn btn-link btn-sm text-success p-0 fw-bold shadow-none"
                >
                  {isLoginMode ? 'Register Here' : 'Login Here'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
